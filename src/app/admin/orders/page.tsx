import Link from "next/link";
import { requirePermission } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "คำสั่งซื้อทั้งหมด" };

// TASK-114: order inspection
export default async function AdminOrdersPage() {
  await requirePermission("order:view:all");
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      buyer: { select: { email: true } },
      items: { include: { product: { select: { slug: true } } } },
      payments: true,
    },
    take: 100,
  });

  return (
    <div>
      <h1 className="font-headline text-2xl font-bold mb-1">คำสั่งซื้อทั้งหมด ({orders.length})</h1>
      <p className="text-sm text-text-muted mb-6">100 รายการล่าสุด</p>

      <div className="space-y-3">
        {orders.map((order) => (
          <div key={order.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <span className="font-headline font-bold text-sm">#{order.id.slice(0, 8).toUpperCase()}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  order.status === "PAID"
                    ? "bg-green-50 text-green-700"
                    : order.status === "REFUNDED"
                      ? "bg-gray-100 text-gray-500"
                      : "bg-amber-50 text-amber-700"
                }`}
              >
                {order.status}
              </span>
              <span className="text-xs text-text-muted">{order.buyer.email}</span>
              <span className="text-xs text-text-muted">{order.createdAt.toLocaleString("th-TH")}</span>
              <span className="ml-auto font-headline font-bold text-primary">฿{order.total.toNumber().toLocaleString()}</span>
            </div>
            <ul className="text-xs text-text-muted flex flex-wrap gap-x-4 gap-y-1">
              {order.items.map((item) => (
                <li key={item.id}>
                  <Link href={`/products/${item.product.slug}`} className="hover:text-primary">
                    {item.title}
                  </Link>{" "}
                  (fee ฿{item.platformFee.toNumber()})
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
