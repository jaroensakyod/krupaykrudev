import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { fulfillPaidPayment } from "@/lib/commerce";
import {
  omiseEnabled,
  createPromptPayCharge,
  createCardCharge,
  retrieveCharge,
  isChargePaid,
} from "@/lib/payments/omise";

const promptpaySchema = z.object({ method: z.literal("promptpay") });
const cardSchema = z.object({
  method: z.literal("card"),
  token: z.string().startsWith("tokn_"),
});

/**
 * V1.5: สร้าง charge จริงผ่าน Opn/Omise ตามวิธีชำระที่เลือก
 * - promptpay → ได้ QR image (ผู้ซื้อสแกน) · status poll ที่ /status
 * - card (token จาก Omise.js) → charge ทันที สำเร็จ = fulfill
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  if (!omiseEnabled()) return NextResponse.json({ error: "OMISE_NOT_CONFIGURED" }, { status: 503 });

  const { id } = await params;
  const payment = await prisma.payment.findUnique({
    where: { id },
    include: { order: { select: { buyerId: true, status: true, total: true } } },
  });
  if (!payment || payment.order.buyerId !== session.user.id) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }
  if (payment.status === "PAID") {
    return NextResponse.json({ status: "PAID", orderId: payment.orderId });
  }

  const body = await request.json().catch(() => null);
  const parsed = z.union([promptpaySchema, cardSchema]).safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "INVALID" }, { status: 400 });

  try {
    const charge =
      parsed.data.method === "promptpay"
        ? await createPromptPayCharge(payment.amount.toNumber(), payment.orderId)
        : await createCardCharge(payment.amount.toNumber(), parsed.data.token, payment.orderId);

    await prisma.payment.update({
      where: { id: payment.id },
      data: { provider: "omise", providerPaymentId: charge.id, status: "PENDING" },
    });

    // บัตรตัดสินผลทันที — สำเร็จให้จบ flow ได้เลย
    if (isChargePaid(charge)) {
      await fulfillPaidPayment(charge.id);
      return NextResponse.json({ status: "PAID", orderId: payment.orderId });
    }
    if (charge.status === "failed") {
      return NextResponse.json({ status: "FAILED", error: charge.failure_code ?? "FAILED" }, { status: 402 });
    }

    // promptpay: รอผู้ซื้อสแกน
    return NextResponse.json({
      status: "PENDING",
      chargeId: charge.id,
      qrImage: charge.source?.scannable_code?.image?.download_uri ?? null,
    });
  } catch (error) {
    const msg = String(error);
    if (msg.includes("OMISE_NOT_CONFIGURED")) {
      return NextResponse.json({ error: "OMISE_NOT_CONFIGURED" }, { status: 503 });
    }
    return NextResponse.json({ error: "CHARGE_FAILED" }, { status: 502 });
  }
}

/** GET — status polling (ยืนยัน charge กับ Omise ตรง ๆ ทุกครั้ง) */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const { id } = await params;
  const payment = await prisma.payment.findUnique({
    where: { id },
    select: { id: true, provider: true, providerPaymentId: true, status: true, orderId: true, order: { select: { buyerId: true } } },
  });
  if (!payment || payment.order.buyerId !== session.user.id) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }
  if (payment.status === "PAID") {
    return NextResponse.json({ status: "PAID", orderId: payment.orderId });
  }
  if (payment.provider !== "omise" || !payment.providerPaymentId.startsWith("chrg_")) {
    return NextResponse.json({ status: payment.status });
  }

  try {
    const charge = await retrieveCharge(payment.providerPaymentId);
    if (isChargePaid(charge)) {
      await fulfillPaidPayment(payment.providerPaymentId);
      return NextResponse.json({ status: "PAID", orderId: payment.orderId });
    }
    return NextResponse.json({ status: charge.status === "failed" ? "FAILED" : "PENDING" });
  } catch {
    return NextResponse.json({ status: "PENDING" });
  }
}
