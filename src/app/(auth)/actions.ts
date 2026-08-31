"use server";

import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { signIn, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { headers } from "next/headers";
import { cookies } from "next/headers";
import { rateLimit, ipKey } from "@/lib/rate-limit";
import { attributeReferral } from "@/lib/growth";
import { trackEvent } from "@/lib/analytics";

export type AuthFormState = { error?: string };

const registerSchema = z.object({
  displayName: z.string().min(2).max(60),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  role: z.enum(["buyer", "seller"]).default("buyer"),
});

export async function registerAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const h = await headers();
  const rl = rateLimit(ipKey({ headers: h }, "register"), 5, 300); // 5 ครั้ง / 5 นาที / IP
  if (!rl.allowed) {
    return { error: `พยายามบ่อยเกินไป ลองใหม่ใน ${rl.retryAfterSec} วินาที` };
  }

  const parsed = registerSchema.safeParse({
    displayName: formData.get("displayName"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role") ?? "buyer",
  });
  if (!parsed.success) {
    return { error: "กรุณากรอกข้อมูลให้ถูกต้อง (รหัสผ่านอย่างน้อย 8 ตัวอักษร)" };
  }

  const { displayName, email, password, role } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "อีเมลนี้ถูกใช้งานแล้ว" };
  }

  try {
    const user = await prisma.user.create({
      data: {
        email,
        displayName,
        passwordHash: await bcrypt.hash(password, 12),
      },
    });
    const store = await cookies();
    const ref = store.get("kp_ref")?.value;
    if (ref && await attributeReferral(user.id, ref)) {
      void trackEvent({ eventType: "REFERRAL_SIGNUP", userId: user.id, source: "referral", utmSource: store.get("kp_utm_source")?.value, utmMedium: store.get("kp_utm_medium")?.value, utmCampaign: store.get("kp_utm_campaign")?.value });
    }
  } catch (error) {
    logger.error("register_failed", { error: String(error) });
    return { error: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง" };
  }

  // ผู้ขายพาไปตั้งค่าร้านค้าต่อ / ผู้ซื้อเข้าหน้าแรก
  await signIn("credentials", {
    email,
    password,
    redirectTo: role === "seller" ? "/sell/start" : "/",
  });
  return {};
}

export async function loginAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const h = await headers();
  const rl = rateLimit(ipKey({ headers: h }, "login"), 10, 300); // 10 ครั้ง / 5 นาที / IP
  if (!rl.allowed) {
    return { error: `พยายามบ่อยเกินไป ลองใหม่ใน ${rl.retryAfterSec} วินาที` };
  }
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  try {
    await signIn("credentials", { email, password, redirectTo: "/" });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" };
    }
    throw error; // redirect errors must propagate
  }
  return {};
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}
