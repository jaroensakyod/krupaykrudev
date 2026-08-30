import Link from "next/link";
import { redirect } from "next/navigation";
import { MaterialIcon } from "@/components/material-icon";
import { getSession } from "@/lib/session";
import { listOrders } from "@/lib/commerce";

export const metadata = { title: "คำสั่งซื้อของฉัน" };

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ paid?: string; error?: string }>;
}) {
  const { paid, error } = await searchParams;
  const session = await getSession();
  if (!session?.user) redirect("/login");
  const orders = await listOrders(session.user.id);

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="font-headline text-2xl font-bold mb-8">คำสั่งซื้อของฉัน</h1>

      {paid && (
        <div className="mb-6 rounded-xl bg-green-50 border border-green-200 p-6 text-center">
          <MaterialIcon name="check_circle" className="text-4xl text-success mb-2" filled />
          <p className="font-headline font-bold text-lg text-green-800">ชำระเงินสำเร็จ!</p>
          <p className="text-sm text-green-700">สื่อของคุณพร้อมดาวน์โหลดแล้ว</p>
          <Link
            href="/account/downloads"
            className="inline-block mt-3 bg-primary text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-primary-dark"
          >
            ไปที่คลังสื่อของฉัน
          </Link>
        </div>
      )}
      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">ลายเซ็นยืนยันไม่ถูกต้อง</p>
      )}

      {orders.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
          <MaterialIcon name="receipt_long" className="text-5xl text-gray-200 mb-4" />
          <p className="font-headline font-medium text-lg mb-1">ยังไม่มีคำสั่งซื้อ</p>
          <Link href="/search" className="text-primary text-sm font-medium hover:underline">
            เริ่มเลือกซื้อสื่อการสอน
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-headline font-bold">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="text-xs text-text-muted">
                    {order.createdAt.toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" })}
                    {" · "}
                    {order.status === "PAID" ? "ชำระแล้ว" : order.status === "PENDING_PAYMENT" ? "รอชำระเงิน" : order.status}
                  </p>
                </div>
                <p className="font-headline font-bold text-primary text-lg">
                  {order.total.toNumber() === 0 ? "ฟรี" : `฿${order.total.toNumber().toLocaleString()}`}
                </p>
              </div>
              <ul className="divide-y divide-gray-100">
                {order.items.map((item) => (
                  <li key={item.id} className="py-2.5 flex items-center justify-between text-sm">
                    <span className="truncate pr-3">{item.title}</span>
                    {order.status === "PAID" ? (
                      <Link href="/account/downloads" className="text-primary text-xs font-medium hover:underline whitespace-nowrap">
                        ดาวน์โหลด
                      </Link>
                    ) : (
                      <Link
                        href={`/checkout/pay/${order.payments[0]?.id ?? ""}`}
                        className="text-accent text-xs font-medium hover:underline whitespace-nowrap"
                      >
                        ชำระเงิน
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
