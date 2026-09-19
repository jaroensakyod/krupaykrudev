import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { rateLimit, ipKey } from "@/lib/rate-limit";
import { headers } from "next/headers";

const schema = z.object({
  email: z.string().email().max(200),
  role: z.enum(["teacher", "buyer"]).default("teacher"),
});

/** ลงทะเบียนรอ — เก็บ leads รุ่นแรก (PRD §91: creator waitlist) */
export async function POST(request: Request) {
  const h = await headers();
  const rl = rateLimit(ipKey({ headers: h }, "waitlist"), 10, 3600);
  if (!rl.allowed) {
    return NextResponse.json({ error: "RATE_LIMITED" }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "INVALID" }, { status: 400 });

  try {
    await prisma.waitlistEntry.upsert({
      where: { email: parsed.data.email },
      update: { role: parsed.data.role },
      create: { email: parsed.data.email, role: parsed.data.role },
    });
  } catch {
    return NextResponse.json({ error: "FAILED" }, { status: 500 });
  }

  const count = await prisma.waitlistEntry.count();
  return NextResponse.json({ ok: true, count });
}

export async function GET() {
  const count = await prisma.waitlistEntry.count();
  return NextResponse.json({ count });
}
