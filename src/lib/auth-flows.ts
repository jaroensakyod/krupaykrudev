"use server";

import { randomUUID } from "node:crypto";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

/**
 * §6: password reset + email verification flows
 * ตอนนี้ยังไม่มี email provider — token link จะถูก (1) log ลง server และ
 * (2) ส่งเป็น in-app notification เมื่อผู้ใช้ยังล็อกอินอยู่ · Phase 13 จะแทนด้วย email จริง
 */

const HOUR = 60 * 60 * 1000;

async function issueToken(identifier: string, purpose: string): Promise<string> {
  const token = randomUUID();
  await prisma.verificationToken.create({
    data: { identifier: `${purpose}:${identifier}`, token, expires: new Date(Date.now() + HOUR) },
  });
  return token;
}

export async function consumeToken(token: string, purpose: string): Promise<string | null> {
  const row = await prisma.verificationToken.findUnique({ where: { token } });
  if (!row || row.expires < new Date() || !row.identifier.startsWith(`${purpose}:`)) return null;
  await prisma.verificationToken.delete({ where: { token } }).catch(() => {});
  return row.identifier.slice(purpose.length + 1); // email
}

export async function requestPasswordResetAction(
  _prev: { error?: string; sent?: boolean },
  formData: FormData,
): Promise<{ error?: string; sent?: boolean }> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) return { error: "กรุณากรอกอีเมล" };

  // ตอบเหมือนกันทุกกรณี — ไม่เปิดเผยว่าอีเมลมีในระบบหรือไม่
  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    const token = await issueToken(email, "reset");
    const link = `/reset-password?token=${token}`;
    logger.info("password_reset_link (dev — แทนด้วย email ใน Phase 13)", { email, link });
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: "REPORT_UPDATE", // ใช้ enum ที่มี — แสดงเป็นข้อความทั่วไป
        title: "ลิงก์ตั้งรหัสผ่านใหม่",
        body: `กดลิงก์นี้เพื่อตั้งรหัสผ่านใหม่ (หมดอายุใน 1 ชั่วโมง): ${link}`,
        linkUrl: link,
      },
    }).catch(() => {});
  }
  return { sent: true };
}

const resetSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(8).max(128),
});

export async function resetPasswordAction(
  _prev: { error?: string; done?: boolean },
  formData: FormData,
): Promise<{ error?: string; done?: boolean }> {
  const parsed = resetSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร" };

  const email = await consumeToken(parsed.data.token, "reset");
  if (!email) return { error: "ลิงก์ไม่ถูกต้องหรือหมดอายุ กรุณาขอลิงก์ใหม่" };

  await prisma.user.update({
    where: { email },
    data: { passwordHash: await bcrypt.hash(parsed.data.password, 12) },
  });
  logger.info("password_reset_done", { email });
  return { done: true };
}

/** ส่งอีเมลยืนยัน (dev: log + notification) */
export async function sendEmailVerificationAction(): Promise<void> {
  // client จะเรียกผ่าน form action แบบไม่มี args
}

export async function requestEmailVerificationAction(
  _prev: { sent?: boolean },
  formData: FormData,
): Promise<{ sent?: boolean }> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });
  if (user && !user.emailVerified) {
    const token = await issueToken(email, "verify");
    const link = `/verify-email?token=${token}`;
    logger.info("email_verification_link (dev)", { email, link });
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: "REPORT_UPDATE",
        title: "ยืนยันอีเมลของคุณ",
        body: `กดลิงก์เพื่อยืนยันอีเมล (หมดอายุใน 1 ชั่วโมง): ${link}`,
        linkUrl: link,
      },
    }).catch(() => {});
  }
  return { sent: true };
}

export async function verifyEmailToken(token: string): Promise<boolean> {
  const email = await consumeToken(token, "verify");
  if (!email) return false;
  await prisma.user.update({ where: { email }, data: { emailVerified: new Date() } });
  return true;
}
