"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { verifyPaymentConfirm, fulfillPaidPayment } from "@/lib/commerce";

/**
 * TASK-076/077: mock payment confirm — ทำงานเหมือน webhook (idempotent, verify ฝั่ง server)
 * Production: เปลี่ยนเป็น webhook route ของ provider จริง (signature verify) โครงเดียวกัน
 */
export async function mockPayConfirmAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const paymentId = String(formData.get("paymentId") ?? "");
  const signature = String(formData.get("signature") ?? "");
  if (!verifyPaymentConfirm(paymentId, signature)) {
    redirect("/orders?error=invalid_signature");
  }

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    select: { id: true, providerPaymentId: true, order: { select: { buyerId: true } } },
  });
  if (!payment || payment.order.buyerId !== session.user.id) {
    redirect("/orders?error=invalid_signature");
  }

  const result = await fulfillPaidPayment(payment.providerPaymentId);
  redirect(`/orders?paid=${result.orderId}`);
}
