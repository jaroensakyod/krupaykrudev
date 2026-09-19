/**
 * V1.5: Opn/Omise payment adapter (PRD §35 — payment provider abstraction)
 *
 * - ยืนยันทุก charge ด้วย Secret key ฝั่ง server เท่านั้น — ห้ามเชื่อ payload/redirect จาก client
 * - Test mode: การ์ดทดสอบ 4242 4242 4242 4242 · PromptPay QR จะจำลอง
 * - Live mode: ใส่ live keys ใน env หลัง KYC ผ่าน — โค้ดไม่ต้องแก้
 */

const API = "https://api.omise.co";

function secretKey(): string {
  const key = process.env.OMISE_SECRET_KEY;
  if (!key) throw new Error("OMISE_NOT_CONFIGURED");
  return key;
}

export function omiseEnabled(): boolean {
  return Boolean(process.env.OMISE_SECRET_KEY);
}

async function omiseRequest<T>(path: string, body?: Record<string, string | number>): Promise<T> {
  const auth = Buffer.from(`${secretKey()}:`).toString("base64");
  const res = await fetch(`${API}${path}`, {
    method: body ? "POST" : "GET",
    headers: {
      Authorization: `Basic ${auth}`,
      ...(body ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
    },
    ...(body ? { body: new URLSearchParams(body as Record<string, string>).toString() } : {}),
  });
  const json = (await res.json()) as Record<string, unknown> & {
    object: string;
    id: string;
    status?: string;
    paid?: boolean;
    failure_code?: string;
    amount?: number;
  };
  if (!res.ok || json.object === "error") {
    throw new Error(`OMISE_ERROR: ${String((json as { message?: string }).message ?? res.status)}`);
  }
  return json as unknown as T;
}

export type OmiseCharge = {
  id: string;
  status: string; // pending | successful | failed
  paid: boolean;
  amount: number; // satang
  currency: string;
  failure_code?: string | null;
  source?: { scannable_code?: { image?: { download_uri?: string } } };
};

/** PromptPay source + charge — ได้ QR image URL กลับมา ผู้ซื้อสแกนจ่าย */
export async function createPromptPayCharge(amountThb: number, orderRef: string): Promise<OmiseCharge> {
  const satang = Math.round(amountThb * 100);
  const source = await omiseRequest<{ id: string }>("/sources", {
    type: "promptpay",
    amount: satang,
    currency: "thb",
  });
  return omiseRequest<OmiseCharge>("/charges", {
    amount: satang,
    currency: "thb",
    source: source.id,
    "metadata[order_ref]": orderRef,
  });
}

/** Card charge — token มาจาก Omise.js (บัตรไม่เคยผ่านเซิร์ฟเวอร์เรา) */
export async function createCardCharge(amountThb: number, cardToken: string, orderRef: string): Promise<OmiseCharge> {
  return omiseRequest<OmiseCharge>("/charges", {
    amount: Math.round(amountThb * 100),
    currency: "thb",
    card: cardToken,
    "metadata[order_ref]": orderRef,
  });
}

/** ยืนยัน charge โดยอ่านจาก Omise ตรง ๆ ด้วย Secret key (webhook/redirect ใช้เป็นหลักฐานไม่ได้) */
export async function retrieveCharge(chargeId: string): Promise<OmiseCharge> {
  if (!chargeId.startsWith("chrg_")) throw new Error("INVALID_CHARGE_ID");
  return omiseRequest<OmiseCharge>(`/charges/${chargeId}`);
}

export function isChargePaid(charge: OmiseCharge): boolean {
  return charge.status === "successful" && charge.paid === true;
}
