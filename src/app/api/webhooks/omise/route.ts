import { NextResponse } from "next/server";
import { fulfillPaidPayment } from "@/lib/commerce";
import { retrieveCharge, isChargePaid } from "@/lib/payments/omise";

/**
 * TASK-076: Omise webhook — PRD §35: ห้ามเชื่อ payload จากภายนอก
 * ใช้ payload เพื่อรู้ "charge id" เท่านั้น แล้วดึงข้อมูลจริงจาก Omise API ด้วย Secret key
 * (ตั้ง URL นี้ใน Dashboard → Settings → Webhooks)
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    data?: { id?: string; object?: string };
  } | null;
  const chargeId = body?.data?.id;
  if (!chargeId || !chargeId.startsWith("chrg_")) {
    return NextResponse.json({ received: true, ignored: true });
  }

  try {
    const charge = await retrieveCharge(chargeId); // ยืนยันจริงจาก Omise
    if (isChargePaid(charge)) {
      await fulfillPaidPayment(charge.id);
    }
    return NextResponse.json({ received: true });
  } catch {
    // ตอบ 200 เสมอกัน webhook retry ไม่รุนแรงเกิน — สถานะจริงตรวจผ่าน polling ฝั่งผู้ซื้อด้วย
    return NextResponse.json({ received: true });
  }
}
