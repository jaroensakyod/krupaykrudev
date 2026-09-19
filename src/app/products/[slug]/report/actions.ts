"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit, ipKey } from "@/lib/rate-limit";
import { headers } from "next/headers";

const schema = z.object({
  productId: z.string().uuid(),
  reason: z.enum(["COPYRIGHT", "MISLEADING", "BROKEN_FILE", "INAPPROPRIATE", "SPAM", "DUPLICATE", "OTHER"]),
  description: z.string().max(1000).optional(),
});

// TASK-055: report UI — ผู้ใช้ทุกคน (แม้ไม่ login) แจ้งได้
export async function reportProductAction(
  _prev: { error?: string; sent?: boolean },
  formData: FormData,
): Promise<{ error?: string; sent?: boolean }> {
  const session = await auth();
  // SECURITY: กันสแปมรายงาน — 5 ครั้ง / ชั่วโมง / IP
  const h = await headers();
  const rl = rateLimit(ipKey({ headers: h }, "report"), 5, 3600);
  if (!rl.allowed) return { error: "ส่งรายงานบ่อยเกินไป ลองใหม่ภายหลัง" };
  const parsed = schema.safeParse({
    productId: formData.get("productId"),
    reason: formData.get("reason"),
    description: formData.get("description") || undefined,
  });
  if (!parsed.success) return { error: "กรุณาเลือกเหตุผลการแจ้ง" };

  await prisma.report.create({
    data: {
      reporterId: session?.user?.id ?? null,
      entityType: "product",
      entityId: parsed.data.productId,
      reason: parsed.data.reason,
      description: parsed.data.description,
    },
  });
  return { sent: true };
}
