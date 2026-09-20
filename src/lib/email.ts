import { getEnv } from "@/lib/env";
import { siteConfig } from "@/lib/site";
import { logger } from "@/lib/logger";

/**
 * TASK-13x: email channel ผ่าน Resend (REST API ตรง ไม่ใช้ SDK)
 * - ไม่ตั้ง RESEND_API_KEY → ข้ามการส่งอย่างปลอดภัย (ระบบอื่นทำงานปกติ)
 * - ทุกจดหมายใช้ template HTML แบบ inline-style (รองรับ Gmail/Outlook)
 */

type EmailInput = { to: string; subject: string; html: string };

export async function sendEmail({ to, subject, html }: EmailInput): Promise<boolean> {
  const env = getEnv();
  if (!env.RESEND_API_KEY) {
    logger.warn("email_skipped_no_resend_key", { to, subject });
    return false;
  }
  const from = env.EMAIL_FROM || "KruPayKru <onboarding@resend.dev>";
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: [to], subject, html }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      logger.error("email_send_failed", { status: res.status, to, subject, body: body.slice(0, 300) });
      return false;
    }
    logger.info("email_sent", { to, subject });
    return true;
  } catch (error) {
    logger.error("email_send_error", { to, subject, error: String(error) });
    return false;
  }
}

function shell(title: string, bodyHtml: string, cta?: { text: string; url: string }): string {
  const button = cta
    ? `<a href="${cta.url}" style="display:inline-block;background:#0F766E;color:#ffffff;font-size:15px;font-weight:600;padding:12px 28px;border-radius:10px;text-decoration:none;margin-top:8px">${cta.text}</a>`
    : "";
  return `<!DOCTYPE html><html lang="th"><body style="margin:0;padding:24px;background:#FAFAF8;font-family:'IBM Plex Sans Thai','Sukhumvit Set',Tahoma,sans-serif;color:#1F2937">
  <div style="max-width:520px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:14px;padding:32px">
    <div style="font-size:18px;font-weight:700;color:#0F766E;margin-bottom:16px">🎓 ครูเปย์ครู KruPayKru</div>
    <h2 style="font-size:20px;margin:0 0 12px">${title}</h2>
    <div style="font-size:14px;line-height:1.7;color:#374151">${bodyHtml}</div>
    ${button}
    <p style="font-size:12px;color:#9ca3af;margin-top:28px">อีเมลนี้ส่งจากระบบโดยอัตโนมัติ — ${siteConfig.url}</p>
  </div></body></html>`;
}

export async function sendPasswordResetEmail(to: string, link: string): Promise<boolean> {
  return sendEmail({
    to,
    subject: "ตั้งรหัสผ่านใหม่ — KruPayKru",
    html: shell(
      "ตั้งรหัสผ่านใหม่",
      `<p>มีคำขอตั้งรหัสผ่านใหม่สำหรับบัญชีนี้</p><p>กดปุ่มด้านล่างเพื่อตั้งรหัสผ่านใหม่ (ลิงก์หมดอายุใน <b>1 ชั่วโมง</b>)</p>
       <p style="font-size:12px;color:#6b7280">ถ้าคุณไม่ได้เป็นผู้ขอ ไม่ต้องทำอะไร — รหัสผ่านเดิมของคุณยังใช้ได้ปกติ</p>`,
      { text: "ตั้งรหัสผ่านใหม่", url: link },
    ),
  });
}

export async function sendEmailVerificationEmail(to: string, link: string): Promise<boolean> {
  return sendEmail({
    to,
    subject: "ยืนยันอีเมล — KruPayKru",
    html: shell(
      "ยืนยันอีเมลของคุณ",
      `<p>กดปุ่มด้านล่างเพื่อยืนยันอีเมล (ลิงก์หมดอายุใน <b>1 ชั่วโมง</b>)</p>`,
      { text: "ยืนยันอีเมล", url: link },
    ),
  });
}

export async function sendOrderReceiptEmail(
  to: string,
  orderId: string,
  items: { title: string; price: number }[],
  total: number,
): Promise<boolean> {
  const rows = items
    .map(
      (i) =>
        `<tr><td style="padding:8px 0;border-bottom:1px solid #f3f4f6">${i.title}</td><td style="padding:8px 0;border-bottom:1px solid #f3f4f6;text-align:right">฿${i.price.toLocaleString()}</td></tr>`,
    )
    .join("");
  return sendEmail({
    to,
    subject: `ใบเสร็จคำสั่งซื้อ #${orderId.slice(0, 8).toUpperCase()} — KruPayKru`,
    html: shell(
      "ชำระเงินสำเร็จ — ขอบคุณที่ซื้อสื่อกับเรา 🎉",
      `<p>คำสั่งซื้อ <b>#${orderId.slice(0, 8).toUpperCase()}</b></p>
       <table style="width:100%;border-collapse:collapse;font-size:14px">${rows}
       <tr><td style="padding:10px 0;font-weight:700">รวม</td><td style="padding:10px 0;text-align:right;font-weight:700">฿${total.toLocaleString()}</td></tr></table>
       <p>สื่อของคุณพร้อมดาวน์โหลดแล้วที่ คลังสื่อของฉัน — โหลดได้ตลอดไม่มีวันหมดอายุ</p>`,
      { text: "เปิดคลังสื่อของฉัน", url: `${siteConfig.url}/account/downloads` },
    ),
  });
}

export async function sendSaleNotificationEmail(
  to: string,
  itemTitle: string,
  orderId: string,
): Promise<boolean> {
  return sendEmail({
    to,
    subject: "คุณมีการขายใหม่! 🎉 — KruPayKru",
    html: shell(
      "คุณมีการขายใหม่! 🎉",
      `<p>สื่อ <b>"${itemTitle}"</b> ถูกซื้อไปแล้ว (คำสั่งซื้อ #${orderId.slice(0, 8).toUpperCase()})</p>
       <p>รายได้เข้ากระเป๋าของคุณเรียบร้อย — ดูยอดได้ที่หน้ารายได้</p>`,
      { text: "ดูรายได้ของฉัน", url: `${siteConfig.url}/dashboard/earnings` },
    ),
  });
}
