import { MaterialIcon } from "@/components/material-icon";
import { requirePermission } from "@/lib/session";
import { getCreatorByUserId } from "@/lib/creators";
import { getCreatorBalance, HOLD_DAYS } from "@/lib/finance";
import { prisma } from "@/lib/prisma";
import { requestPayoutAction } from "./actions";

export const metadata = { title: "รายได้" };

export default async function EarningsPage({
  searchParams,
}: {
  searchParams: Promise<{ requested?: string; error?: string }>;
}) {
  const { requested, error } = await searchParams;
  const session = await requirePermission("payout:request");
  const profile = await getCreatorByUserId(session.user.id);
  const balance = await getCreatorBalance(session.user.id);

  // รายการขายของ creator นี้ (จาก ledger CREATOR_EARNING)
  const earnings = await prisma.ledgerEntry.findMany({
    where: { accountType: "CREATOR", accountId: session.user.id, entryType: "CREATOR_EARNING" },
    orderBy: { createdAt: "desc" },
  });
  const payouts = await prisma.payout.findMany({
    where: { creatorUserId: session.user.id },
    orderBy: { requestedAt: "desc" },
  });

  return (
    <div>
      <h1 className="font-headline text-2xl font-bold mb-1">รายได้และกระเป๋าเงิน</h1>
      <p className="text-sm text-text-muted mb-8">
        ทุกบาทตรวจสอบย้อนหลังได้จากบัญชีแยกประเภท (Ledger)
      </p>

      {requested && (
        <p className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">ส่งคำขอถอนเงินแล้ว — รอแอดมินดำเนินการ</p>
      )}
      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">ยอดเงินไม่เพียงพอสำหรับถอน</p>
      )}

      {/* Balances */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-text-muted">ยอดพร้อมถอน</span>
            <MaterialIcon name="account_balance_wallet" className="text-primary text-lg" />
          </div>
          <p className="font-headline text-3xl font-bold text-primary">฿{balance.available.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-text-muted">รอปล่อย (ถือ {HOLD_DAYS} วัน)</span>
            <MaterialIcon name="schedule" className="text-gray-400 text-lg" />
          </div>
          <p className="font-headline text-3xl font-bold text-gray-500">฿{balance.pending.toLocaleString()}</p>
        </div>
      </div>

      {/* Payout request */}
      {balance.available > 0 ? (
        <form action={requestPayoutAction} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-8 flex items-center gap-3">
          <span className="text-sm font-medium">ขอถอนทั้งหมด:</span>
          <input name="amount" type="hidden" value={balance.available} />
          <span className="font-headline font-bold text-primary">฿{balance.available.toLocaleString()}</span>
          <button
            className="ml-auto bg-primary hover:bg-primary-dark text-white text-sm font-medium px-5 py-2.5 rounded-lg"
            type="submit"
          >
            ขอถอนเงิน
          </button>
        </form>
      ) : (
        <p className="text-xs text-text-muted mb-8">
          ถอนได้เมื่อยอดพร้อมถอนมากกว่า 0 (ยอดขายจะพร้อมถอนหลังหมดระยะถือเงิน)
        </p>
      )}

      {/* Sales */}
      <h2 className="font-headline font-bold text-lg mb-3">รายการรับเงิน</h2>
      {earnings.length === 0 ? (
        <p className="text-sm text-text-muted bg-white rounded-xl border border-gray-100 p-6 text-center mb-8">
          ยังไม่มีรายการ — ยอดขายจะแสดงที่นี่ทันทีที่ขายได้
        </p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-100 mb-8">
          {earnings.map((e) => (
            <div key={e.id} className="p-4 flex items-center justify-between text-sm">
              <div>
                <p className="font-medium">คำสั่งซื้อ #{e.orderId?.slice(0, 8).toUpperCase()}</p>
                <p className="text-xs text-text-muted">
                  {e.createdAt.toLocaleDateString("th-TH")} ·{" "}
                  {e.availableAt && e.availableAt > new Date() ? `พร้อมถอน ${e.availableAt.toLocaleDateString("th-TH")}` : "พร้อมถอนแล้ว"}
                </p>
              </div>
              <p className="font-headline font-bold text-success">+฿{e.amount.toNumber().toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}

      {/* Payout history */}
      <h2 className="font-headline font-bold text-lg mb-3">ประวัติการถอน</h2>
      {payouts.length === 0 ? (
        <p className="text-sm text-text-muted bg-white rounded-xl border border-gray-100 p-6 text-center">ยังไม่มีรายการถอน</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-100">
          {payouts.map((p) => (
            <div key={p.id} className="p-4 flex items-center justify-between text-sm">
              <div>
                <p className="font-medium">#{p.id.slice(0, 8).toUpperCase()}</p>
                <p className="text-xs text-text-muted">
                  {p.requestedAt.toLocaleDateString("th-TH")} ·{" "}
                  {p.status === "PAID" ? "โอนแล้ว" : p.status === "REQUESTED" ? "รอดำเนินการ" : p.status}
                </p>
              </div>
              <p className="font-headline font-bold">฿{p.amount.toNumber().toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
