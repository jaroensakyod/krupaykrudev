import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { getCreatorByUserId } from "@/lib/creators";
import { prisma } from "@/lib/prisma";
import { storage } from "@/lib/storage";
import { runAiTask, AiGatewayError } from "@/lib/ai/gateway";
import { AI_TASKS } from "@/lib/ai/tasks";
import { rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  productId: z.string().uuid(),
  task: z.enum(["METADATA", "SEO", "QUALITY"]),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const creator = await getCreatorByUserId(session.user.id);
  if (!creator) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  const rl = rateLimit(`ai:${session.user.id}`, 10, 300); // 10 calls / 5 นาที / คน
  if (!rl.allowed) {
    return NextResponse.json({ error: "RATE_LIMITED" }, { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "INVALID" }, { status: 400 });

  const product = await prisma.product.findFirst({
    where: { id: parsed.data.productId, deletedAt: null },
    include: {
      subject: true,
      grade: true,
      files: { where: { fileRole: { in: ["ORIGINAL", "ANSWER", "SUPPORTING"] } } },
    },
  });
  if (!product) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  if (product.creatorId !== creator.id) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  // ส่งไฟล์แรกให้ AI อ่าน (PDF/รูป อ่านตรงได้ ≤ 15MB)
  let files: { mimeType: string; dataBase64: string }[] | undefined;
  const readable = product.files.find((f) =>
    ["application/pdf", "image/png", "image/jpeg", "image/webp"].includes(f.mimeType),
  );
  if (readable && readable.fileSize <= 15 * 1024 * 1024) {
    const buf = await storage.getBuffer(readable.storageKey);
    if (buf) files = [{ mimeType: readable.mimeType, dataBase64: buf.toString("base64") }];
  }

  const taxo = { subject: product.subject.nameTh, grade: product.grade.nameTh };
  try {
    if (parsed.data.task === "METADATA") {
      const result = await runAiTask({
        task: AI_TASKS.METADATA,
        promptContext: {
          filename: product.files[0]?.originalFilename ?? "(ไม่มีไฟล์)",
          existingTitle: product.title,
          existingDescription: product.description ?? "",
        },
        files,
        entityType: "product",
        entityId: product.id,
        userId: session.user.id,
      });
      return NextResponse.json({ task: "METADATA", cached: result.cached, ...result.output });
    }

    if (parsed.data.task === "SEO") {
      const result = await runAiTask({
        task: AI_TASKS.SEO,
        promptContext: {
          title: product.title,
          description: product.description ?? "",
          subject: taxo.subject,
          grade: taxo.grade,
        },
        entityType: "product",
        entityId: product.id,
        userId: session.user.id,
      });
      return NextResponse.json({ task: "SEO", cached: result.cached, ...result.output });
    }

    const fileNames = product.files.map((f) => f.originalFilename).join(", ");
    const result = await runAiTask({
      task: AI_TASKS.QUALITY,
      promptContext: {
        title: product.title,
        description: product.description ?? "",
        hasFiles: product.files.length > 0,
        fileNames,
        price: product.price.toNumber() === 0 ? "ฟรี" : `฿${product.price.toNumber()}`,
      },
      entityType: "product",
      entityId: product.id,
      userId: session.user.id,
    });
    return NextResponse.json({ task: "QUALITY", cached: result.cached, ...result.output });
  } catch (error) {
    if (error instanceof AiGatewayError) {
      return NextResponse.json({ error: error.code }, { status: 429 });
    }
    return NextResponse.json({ error: "PROVIDER_ERROR" }, { status: 502 });
  }
}
