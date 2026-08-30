import { MaterialIcon } from "@/components/material-icon";
import { requirePermission } from "@/lib/session";
import { getModerationQueue } from "@/lib/trust";
import { moderateAction } from "./actions";

export const metadata = { title: "คิวตรวจสอบสื่อ" };

export default async function ModerationQueuePage({
  searchParams,
}: {
  searchParams: Promise<{ done?: string; error?: string }>;
}) {
  const session = await requirePermission("moderation:decide");
  const { done, error } = await searchParams;
  const queue = await getModerationQueue();

  return (
    <div>
      <h1 className="font-headline text-2xl font-bold mb-1">คิวตรวจสอบสื่อ</h1>
      <p className="text-sm text-text-muted mb-8">
        สื่อที่รอการตรวจ ({queue.length} รายการ) — ทุกการตัดสินใจถูกบันทึกใน Audit Log
      </p>

      {done && (
        <p className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700 flex items-center gap-1.5">
          <MaterialIcon name="check_circle" className="text-base" /> บันทึกการตัดสินใจเรียบร้อย
        </p>
      )}
      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">คำสั่งไม่ถูกต้อง</p>
      )}

      {queue.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
          <MaterialIcon name="task_alt" className="text-5xl text-green-200 mb-4" />
          <p className="font-headline font-medium text-lg">คิวว่างเปล่า</p>
          <p className="text-sm text-text-muted">ไม่มีสื่อรอการตรวจสอบในขณะนี้</p>
        </div>
      ) : (
        <div className="space-y-4">
          {queue.map((product) => (
            <div key={product.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Product info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="font-headline font-bold text-lg">{product.title}</h2>
                    {product.copyrightDeclarations.length > 0 ? (
                      <span className="text-[10px] text-green-700 bg-green-50 border border-green-200 px-1.5 rounded">
                        ✓ ประกาศลิขสิทธิ์
                      </span>
                    ) : (
                      <span className="text-[10px] text-red-700 bg-red-50 border border-red-200 px-1.5 rounded">
                        ✗ ไม่มีประกาศลิขสิทธิ์
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-text-muted mb-3">{product.shortDescription ?? "—"}</p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="px-2 py-1 bg-gray-50 border border-gray-200 rounded">
                      {product.productType.nameTh}
                    </span>
                    <span className="px-2 py-1 bg-gray-50 border border-gray-200 rounded">
                      {product.subject.nameTh}
                    </span>
                    <span className="px-2 py-1 bg-gray-50 border border-gray-200 rounded">
                      {product.grade.nameTh}
                    </span>
                    <span className="px-2 py-1 bg-gray-50 border border-gray-200 rounded font-bold text-primary">
                      {product.price.toNumber() === 0 ? "ฟรี" : `฿${product.price.toNumber().toLocaleString()}`}
                    </span>
                  </div>
                  <p className="mt-3 text-xs text-text-muted">
                    ผู้ขาย: <span className="font-medium">{product.creator.displayName}</span> (@
                    {product.creator.slug}) ·{" "}
                    {product.creator.verificationStatus === "UNVERIFIED"
                      ? "ยังไม่ยืนยันตัวตน"
                      : product.creator.verificationStatus}
                  </p>
                </div>

                {/* Decision */}
                <form action={moderateAction} className="w-full md:w-72 shrink-0 space-y-3">
                  <input name="productId" type="hidden" value={product.id} />
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    name="note"
                    placeholder="หมายเหตุ (ถ้ามี)"
                    type="text"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      className="bg-success hover:bg-success/90 text-white text-sm font-medium py-2 rounded-lg transition-colors"
                      name="decision"
                      type="submit"
                      value="APPROVE"
                    >
                      อนุมัติ
                    </button>
                    <button
                      className="border border-danger text-danger hover:bg-red-50 text-sm font-medium py-2 rounded-lg transition-colors"
                      name="decision"
                      type="submit"
                      value="REJECT"
                    >
                      ปฏิเสธ
                    </button>
                    <button
                      className="border border-accent text-accent hover:bg-amber-50 text-sm font-medium py-2 rounded-lg transition-colors"
                      name="decision"
                      type="submit"
                      value="NEEDS_CHANGES"
                    >
                      ให้แก้ไข
                    </button>
                    <button
                      className="border border-gray-300 text-gray-600 hover:bg-gray-50 text-sm font-medium py-2 rounded-lg transition-colors"
                      name="decision"
                      type="submit"
                      value="SUSPEND"
                    >
                      ระงับ
                    </button>
                  </div>
                  <p className="text-[10px] text-text-muted">Action โดย: {session.user.email}</p>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
