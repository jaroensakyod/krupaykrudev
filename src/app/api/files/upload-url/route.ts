import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { getCreatorByUserId } from "@/lib/creators";
import { assertOwnProduct, createUploadTicket, FileError } from "@/lib/files";
import { rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  productId: z.string().uuid(),
  filename: z.string().min(1).max(255),
  mimeType: z.string(),
  size: z.number().int().positive(),
  role: z.enum(["ORIGINAL", "BONUS", "ANSWER", "SUPPORTING", "COVER"]),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const creator = await getCreatorByUserId(session.user.id);
  if (!creator) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  const rl = rateLimit(`upload:${session.user.id}`, 30, 3600); // 30 ไฟล์ / ชั่วโมง / คน
  if (!rl.allowed) {
    return NextResponse.json({ error: "RATE_LIMITED" }, { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID" }, { status: 400 });
  }

  try {
    await assertOwnProduct(creator.id, parsed.data.productId);
    const ticket = await createUploadTicket(parsed.data);
    return NextResponse.json(ticket);
  } catch (error) {
    if (error instanceof FileError) {
      return NextResponse.json({ error: error.code }, { status: 400 });
    }
    return NextResponse.json({ error: "INTERNAL" }, { status: 500 });
  }
}
