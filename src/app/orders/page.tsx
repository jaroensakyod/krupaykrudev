import Link from "next/link";
import { redirect } from "next/navigation";
import { MaterialIcon } from "@/components/material-icon";
import { getSession } from "@/lib/session";
import { listOrders } from "@/lib/commerce";
import { getBuyerReviewableItems } from "@/lib/reviews";
import { prisma } from "@/lib/prisma";
import { createReviewAction, requestRefundAction } from "@/app/account/actions";

export const metadata = { title: "คำสั่งซื้อของฉัน" };

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ paid?: string; error?: string; reviewed?: string; refund_requested?: string }>;
}) {
  const { paid, error, reviewed, refund_requested } = await searchParams;
  const session = await getSession();
  if (!session?.user) redirect("/login");
  const orders = await listOrders(session.user.id);
  const reviewable = await getBuyerReviewableItems(session.user.id);
  const reviewedItemIds = new Set(
    (
      await prisma.review.findMany({
        where: { buyerId: session.user.id },
        select: { orderItemId: true },
      })
    ).map((r) => r.orderItemId),
  );

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
      {reviewed && (
        <p className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">ขอบคุณสำหรับรีวิว!</p>
      )}
      {error === "already_reviewed" && (
        <p className="mb-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700">คุณรีวิวรายการนี้ไปแล้ว</p>
      )}
      {error === "review_failed" && (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">ส่งรีวิวไม่สำเร็จ</p>
      )}
      {refund_requested && (
        <p className="mb-4 rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-700">
          ได้รับคำขอคืนเงินแล้ว — ทีมงานจะตรวจสอบและแจ้งผลภายใน 1-2 วันทำการ
        </p>
      )}
      {error === "refund_reason" && (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">กรุณาระบุเหตุผลการขอคืนเงิน</p>
      )}
      {error === "refund_not_allowed" && (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          ขอคืนเงินได้เฉพาะภายใน 7 วันหลังซื้อ และคำขอต้องไม่ซ้ำ
        </p>
      )}

      {/* TASK-091: review prompts — verified purchase only */}
      {reviewable.filter((i) => !reviewedItemIds.has(i.id)).length > 0 && (
        <div className="mb-8 bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-headline font-bold mb-4">ให้คะแนนสื่อที่คุณซื้อ</h2>
          <div className="space-y-4">
            {reviewable
              .filter((i) => !reviewedItemIds.has(i.id))
              .map((item) => (
                <form key={item.id} action={createReviewAction} className="border border-gray-100 rounded-lg p-4 space-y-3">
                  <input name="orderItemId" type="hidden" value={item.id} />
                  <p className="text-sm font-medium">{item.title}</p>
                  <div className="flex gap-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <label key={star} className="cursor-pointer flex flex-col items-center text-xs text-text-muted">
                        <input className="peer sr-only" type="radio" name="rating" value={star} required />
                        <MaterialIcon name="star" className="text-2xl text-gray-300 peer-checked:text-accent" filled />
                        {star}
                      </label>
                    ))}
                  </div>
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    name="title"
                    placeholder="หัวข้อรีวิว (ไม่บังคับ)"
                    maxLength={100}
                    type="text"
                  />
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    name="body"
                    placeholder="เล่าประสบการณ์ใช้งาน (ไม่บังคับ)"
                    rows={2}
                    maxLength={500}
                  />
                  <button className="bg-accent text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-accent/90" type="submit">
                    ส่งรีวิว
                  </button>
                </form>
              ))}
          </div>
        </div>
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
              {order.status === "PAID" && Date.now() - order.createdAt.getTime() < 7 * 24 * 60 * 60 * 1000 && (
                <details className="mb-3">
                  <summary className="text-xs text-text-muted cursor-pointer hover:text-danger">
                    มีปัญหากับคำสั่งซื้อนี้? ขอคืนเงิน (ภายใน 7 วัน)
                  </summary>
                  <form action={requestRefundAction} className="mt-2 flex flex-wrap gap-2">
                    <input name="orderId" type="hidden" value={order.id} />
                    <input
                      className="flex-1 min-w-48 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      name="reason"
                      placeholder="เหตุผล เช่น ไฟล์เปิดไม่ได้ / ไม่ตรงคำอธิบาย"
                      required
                      type="text"
                    />
                    <button className="border border-danger text-danger text-xs font-medium px-4 py-2 rounded-lg hover:bg-red-50" type="submit">
                      ส่งคำขอคืนเงิน
                    </button>
                  </form>
                </details>
              )}
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
