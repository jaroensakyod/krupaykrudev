import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { MaterialIcon } from "@/components/material-icon";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { signPaymentConfirm } from "@/lib/commerce";
import { omiseEnabled } from "@/lib/payments/omise";
import { PayClient } from "./pay-client";
import { mockPayConfirmAction } from "./actions";

export const metadata = { title: "ชำระเงิน" };

export default async function PayPage({ params }: PageProps<"/checkout/pay/[id]">) {
  const { id } = await params;
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const payment = await prisma.payment.findUnique({
    where: { id },
    include: { order: { include: { items: true } } },
  });
  if (!payment) notFound();
  if (payment.order.buyerId !== session.user.id) notFound();

  // จ่ายแล้ว → ไปหน้าผลลัพธ์
  if (payment.status === "PAID") {
    redirect(`/orders?paid=${payment.orderId}`);
  }

  const signature = signPaymentConfirm(payment.id);
  const useOmise = omiseEnabled();

  return (
    <div className="max-w-xl mx-auto px-6 py-12">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs px-3 py-1.5 rounded-full mb-4">
          <MaterialIcon name="science" className="text-sm" />
          SANDBOX — ระบบชำระเงินจำลอง (รอเชื่อม provider จริง)
        </div>
        <h1 className="font-headline text-2xl font-bold">ชำระเงิน</h1>
        <p className="text-sm text-text-muted mt-1">คำสั่งซื้อ #{payment.orderId.slice(0, 8).toUpperCase()}</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
        <ul className="divide-y divide-gray-100">
          {payment.order.items.map((item) => (
            <li key={item.id} className="py-3 flex justify-between text-sm">
              <span className="truncate pr-4">{item.title}</span>
              <span className="font-bold whitespace-nowrap">
                {item.unitPrice.toNumber() === 0 ? "ฟรี" : `฿${item.unitPrice.toNumber().toLocaleString()}`}
              </span>
            </li>
          ))}
        </ul>
        <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
          <span className="font-headline font-bold">ยอดชำระ</span>
          <span className="font-headline text-2xl font-bold text-primary">
            {payment.amount.toNumber() === 0 ? "ฟรี" : `฿${payment.amount.toNumber().toLocaleString()}`}
          </span>
        </div>
      </div>

      {useOmise ? (
        <PayClient paymentId={payment.id} amount={payment.amount.toNumber()} omisePublicKey={process.env.OMISE_PUBLIC_KEY ?? ""} />
      ) : (
        <form action={mockPayConfirmAction} className="space-y-3">
          <input name="paymentId" type="hidden" value={payment.id} />
          <input name="signature" type="hidden" value={signature} />
          <button
            className="w-full bg-success hover:bg-success/90 text-white font-headline font-bold text-lg py-4 rounded-xl transition-colors shadow-md"
            type="submit"
          >
            ยืนยันการชำระเงิน (จำลอง)
          </button>
        </form>
      )}
      <p className="mt-4 text-xs text-text-muted text-center">
        เมื่อชำระสำเร็จ ระบบจะปลดล็อกดาวน์โหลดทันทีและบันทึกสิทธิ์ถาวรในบัญชีของคุณ ·{" "}
        <Link href="/terms" className="text-primary hover:underline">
          นโยบายการคืนเงิน
        </Link>
      </p>
    </div>
  );
}
