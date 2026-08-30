import { requirePermission } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "การชำระเงิน" };

// TASK-115: payment inspection
export default async function AdminPaymentsPage() {
  await requirePermission("payment:view:all");
  const payments = await prisma.payment.findMany({
    orderBy: { id: "desc" },
    include: { order: { include: { buyer: { select: { email: true } } } } },
    take: 100,
  });

  return (
    <div>
      <h1 className="font-headline text-2xl font-bold mb-1">รายการชำระเงิน ({payments.length})</h1>
      <p className="text-sm text-text-muted mb-6">ตรวจสอบ provider / idempotency key / สถานะ</p>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-100">
        {payments.map((p) => (
          <div key={p.id} className="p-4 flex flex-wrap items-center gap-3 text-sm">
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                p.status === "PAID" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
              }`}
            >
              {p.status}
            </span>
            <span className="font-mono text-xs text-text-muted">{p.providerPaymentId.slice(0, 20)}...</span>
            <span className="text-xs text-text-muted">{p.order.buyer.email}</span>
            <span className="text-xs text-text-muted">
              ออเดอร์ #{p.orderId.slice(0, 8).toUpperCase()}
            </span>
            <span className="ml-auto font-headline font-bold">฿{p.amount.toNumber().toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
