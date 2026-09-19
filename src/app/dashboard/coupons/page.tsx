import { MaterialIcon } from "@/components/material-icon";
import { requirePermission } from "@/lib/session";
import { getCreatorByUserId } from "@/lib/creators";
import { listSellerCoupons } from "@/lib/coupons";
import { createCouponAction, deactivateCouponAction } from "./actions";

export const metadata = { title: "คูปองของร้าน" };

export default async function CouponsPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string; error?: string }>;
}) {
  const { created, error } = await searchParams;
  const session = await requirePermission("product:create");
  const profile = await getCreatorByUserId(session.user.id);
  const coupons = profile ? await listSellerCoupons(profile.id) : [];

  return (
    <div className="max-w-2xl">
      <h1 className="font-headline text-2xl font-bold mb-1">คูปองของร้าน</h1>
      <p className="text-sm text-text-muted mb-8">
        สร้างโค้ดส่วนลดสำหรับสินค้าของร้านคุณ — ผู้ซื้อกรอกโค้ดตอนชำระเงิน
      </p>

      {created && (
        <p className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">สร้างคูปองแล้ว</p>
      )}
      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">โค้ดนี้ถูกใช้แล้ว กรุณาใช้โค้ดอื่น</p>
      )}

      {/* Create */}
      <form action={createCouponAction} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold mb-1" htmlFor="code">โค้ด *</label>
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm uppercase font-mono"
              id="code"
              name="code"
              pattern="[A-Z0-9]{3,20}"
              placeholder="KRUTEACHER10"
              required
              title="A-Z ตัวใหญ่ ตัวเลข 3-20 ตัว"
              type="text"
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1" htmlFor="discountPct">ส่วนลด (%) *</label>
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              id="discountPct"
              max={90}
              min={1}
              name="discountPct"
              placeholder="10"
              required
              type="number"
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1" htmlFor="expiresAt">หมดอายุ</label>
            <input className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" id="expiresAt" name="expiresAt" type="date" />
          </div>
        </div>
        <button className="bg-primary text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-primary-dark" type="submit">
          สร้างคูปอง
        </button>
      </form>

      {/* List */}
      <h2 className="font-headline font-bold text-lg mb-3">คูปองทั้งหมด ({coupons.length})</h2>
      {coupons.length === 0 ? (
        <p className="text-sm text-text-muted bg-white rounded-xl border border-gray-100 p-6 text-center">
          ยังไม่มีคูปอง
        </p>
      ) : (
        <div className="space-y-2">
          {coupons.map((c) => {
            const expired = c.expiresAt && c.expiresAt < new Date();
            return (
              <div key={c.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
                <div className="flex-1">
                  <p className="font-mono font-bold text-sm">{c.code}</p>
                  <p className="text-xs text-text-muted">
                    ลด {c.discountPct}% ·{" "}
                    {expired ? (
                      <span className="text-red-600">หมดอายุแล้ว</span>
                    ) : c.expiresAt ? (
                      `ถึง ${c.expiresAt.toLocaleDateString("th-TH")}`
                    ) : (
                      "ไม่มีวันหมดอายุ"
                    )}
                    {!c.isActive && " · ปิดใช้งาน"}
                  </p>
                </div>
                {c.isActive && !expired && (
                  <form action={deactivateCouponAction}>
                    <input name="couponId" type="hidden" value={c.id} />
                    <button className="text-xs text-danger hover:underline" type="submit">
                      ปิดใช้งาน
                    </button>
                  </form>
                )}
                {!c.isActive && <MaterialIcon name="check_circle" className="text-gray-300 text-lg" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
