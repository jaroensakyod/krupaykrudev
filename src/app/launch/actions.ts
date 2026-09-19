"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export type LaunchState = { error?: string };

/** ใส่รหัสถูก = เปิดเว็บทั้งระบบทันที (ทุกคนเห็นเว็บจริงภายในไม่กี่วินาที) */
export async function launchSiteAction(
  _prev: LaunchState,
  formData: FormData,
): Promise<LaunchState> {
  const code = String(formData.get("code") ?? "").trim();
  const expected = process.env.LAUNCH_CODE ?? "";

  if (!expected) {
    return { error: "ยังไม่ได้ตั้งรหัสเปิดเว็บ (LAUNCH_CODE)" };
  }
  if (code !== expected) {
    return { error: "รหัสไม่ถูกต้อง" };
  }

  await prisma.launchFlag.upsert({
    where: { key: "site" },
    update: { live: true, launchedAt: new Date() },
    create: { key: "site", live: true, launchedAt: new Date() },
  });

  // อุปกรณ์นี้เห็นเว็บจริงทันที (ไม่รอ cache ของ middleware)
  const store = await cookies();
  store.set("launch_admin", "1", {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });

  redirect("/");
}
