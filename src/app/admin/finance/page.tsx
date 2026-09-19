import { MaterialIcon } from "@/components/material-icon";
import { requirePermission } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { reconcilePlatform } from "@/lib/finance";
import { completePayoutAction, refundAction, reconcileAction } from "./actions";

export const metadata = { title: "การเงิน" };

export default async function AdminFinancePage({
  searchParams,
}: {
  searchParams: Promise<{ payout?: string; refund?: string; error?: string; reconcile?: string }>;
}) {
  await requirePermission("payout:process");
  const { payout, refund, error, reconcile } = await searchParams;

  const [payoutQueue, paidOrders, refundQueue, recon] = await Promise.all([
    prisma.payout.findMany({ where: { status: "REQUESTED" }, orderBy: { requestedAt: "asc" } }),
    prisma.order.findMany({ where: { status: "PAID" }, orderBy: { createdAt: "desc" }, include: { items: true } }),
    prisma.refund.findMany({ where: { status: "REQUESTED" }, orderBy: { createdAt: "asc" } }),
    reconcilePlatform(),
  ]);

  return (
    <div>
      <h1 className="font-headline text-2xl font-bold mb-1">การเงินและยอดถอน</h1>
      <p className="text-sm text-text-muted mb-8">ทุกบาท trace ได้จาก immutable ledger</p>

      {payout && <p className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">โอนเงินสำเร็จ บันทึก ledger แล้ว</p>}
      {refund && <p className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">คืนเงินสำเร็จ — ledger reversal + ยกเลิกสิทธิ์ดาวน์โหลดแล้ว</p>}
      {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">ทำรายการไม่ได้</p>}

      {/* Reconciliation */}
      <div className={`rounded-xl border p-5 mb-8 ${recon.ok ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <MaterialIcon name={recon.ok ? "verified" : "warning"} className={recon.ok ? "text-success" : "text-danger"} filled />
            <div>
              <p className="font-headline font-bold text-sm">
                Reconciliation: {recon.ok ? "ผ่าน — ทุกออเดอร์บันทึกครบถ้วน" : `พบกลุ่มไม่สมดุล ${recon.brokenGroups.length} กลุ่ม`}
              </p>
              <p className="text-xs text-text-muted">ตรวจแล้ว {recon.groupsChecked} ออเดอร์ (SALE = FEE + CREATOR_EARNING)</p>
              {recon.brokenGroups.map((g) => (
                <p key={g.groupId} className="text-xs text-red-700">
                  {g.groupId} — เพี้ยน ฿{g.drift}
                </p>
              ))}
            </div>
          </div>
          <form action={reconcileAction}>
            <button className="border border-gray-300 text-gray-600 text-xs font-medium px-4 py-2 rounded-lg hover:bg-white" type="submit">
              ตรวจสอบอีกครั้ง
            </button>
          </form>
        </div>
      </div>

      {/* Refund requests */}
      {refundQueue.length > 0 && (
        <div className="mb-8">
          <h2 className="font-headline font-bold text-lg mb-3 text-danger">คำขอคืนเงินรอดำเนินการ ({refundQueue.length})</h2>
          <div className="space-y-3">
            {refundQueue.map((r) => (
              <div key={r.id} className="bg-red-50 border border-red-200 rounded-xl p-5 flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-48">
                  <p className="font-headline font-bold text-sm">#{r.orderId.slice(0, 8).toUpperCase()} — ฿{r.amount.toNumber().toLocaleString()}</p>
                  <p className="text-xs text-text-muted">เหตุผล: {r.reason} · แจ้งเมื่อ {r.createdAt.toLocaleDateString("th-TH")}</p>
                </div>
                <form action={refundAction}>
                  <input name="orderId" type="hidden" value={r.orderId} />
                  <input name="reason" type="hidden" value={r.reason} />
                  <button className="bg-danger text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-danger/90" type="submit">
                    อนุมัติคืนเงิน
                  </button>
                </form>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payout queue */}
      <h2 className="font-headline font-bold text-lg mb-3">คิวถอนเงิน ({payoutQueue.length})</h2>
      {payoutQueue.length === 0 ? (
        <p className="text-sm text-text-muted bg-white rounded-xl border border-gray-100 p-6 text-center mb-8">ไม่มีคำขอถอนรอดำเนินการ</p>
      ) : (
        <div className="space-y-3 mb-8">
          {payoutQueue.map((p) => (
            <div key={p.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 flex-wrap">
              <div className="flex-1 min-w-40">
                <p className="font-headline font-bold">#{p.id.slice(0, 8).toUpperCase()}</p>
                <p className="text-xs text-text-muted">
                  ขอเมื่อ {p.requestedAt.toLocaleDateString("th-TH")} · user {p.creatorUserId.slice(0, 8)}
                </p>
              </div>
              <p className="font-headline text-xl font-bold text-primary">฿{p.amount.toNumber().toLocaleString()}</p>
              <form action={completePayoutAction} className="flex items-center gap-2">
                <input name="payoutId" type="hidden" value={p.id} />
                <input
                  className="px-3 py-2 border border-gray-300 rounded-lg text-xs"
                  name="reference"
                  placeholder="เลขอ้างอิงโอนเงิน"
                  type="text"
                />
                <button className="bg-success text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-success/90" type="submit">
                  ยืนยันโอน
                </button>
              </form>
            </div>
          ))}
        </div>
      )}

      {/* Paid orders + refund */}
      <h2 className="font-headline font-bold text-lg mb-3">คำสั่งซื้อที่ชำระแล้ว ({paidOrders.length})</h2>
      {paidOrders.length === 0 ? (
        <p className="text-sm text-text-muted bg-white rounded-xl border border-gray-100 p-6 text-center">ยังไม่มีคำสั่งซื้อ</p>
      ) : (
        <div className="space-y-3">
          {paidOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                <div>
                  <p className="font-headline font-bold">#{order.id.slice(0, 8).toUpperCase()}</p>
                  <p className="text-xs text-text-muted">
                    {order.createdAt.toLocaleDateString("th-TH")} · {order.items.length} รายการ ·{" "}
                    ค่าธรรมเนียมแพลตฟอร์ม ฿{order.items.reduce((s, i) => s + i.platformFee.toNumber(), 0).toLocaleString()}
                  </p>
                </div>
                <p className="font-headline text-lg font-bold">฿{order.total.toNumber().toLocaleString()}</p>
              </div>
              <form action={refundAction} className="flex items-center gap-2 pt-2 border-t border-gray-100">
                <input name="orderId" type="hidden" value={order.id} />
                <input
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-xs"
                  name="reason"
                  placeholder="เหตุผลการคืนเงิน"
                  type="text"
                  required
                />
                <button className="border border-danger text-danger text-xs font-medium px-4 py-2 rounded-lg hover:bg-red-50" type="submit">
                  คืนเงิน
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
