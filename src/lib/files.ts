import { createHash, randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { storage } from "@/lib/storage";
import type { FileRole } from "@prisma/client";

/** TASK-032: file validation — ห้ามเชื่อ Content-Type จาก browser อย่างเดียว (PRD §15) */
export const ALLOWED_MIME: Record<string, { ext: string; label: string }> = {
  "application/pdf": { ext: "pdf", label: "PDF" },
  "image/png": { ext: "png", label: "PNG" },
  "image/jpeg": { ext: "jpg", label: "JPG" },
  "image/webp": { ext: "webp", label: "WEBP" },
  "application/zip": { ext: "zip", label: "ZIP" },
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": { ext: "pptx", label: "PPTX" },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": { ext: "docx", label: "DOCX" },
};

export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export class FileError extends Error {
  constructor(public code: "NOT_FOUND" | "FORBIDDEN" | "BAD_MIME" | "TOO_LARGE" | "UPLOAD_INCOMPLETE") {
    super(code);
  }
}

export async function assertOwnProduct(creatorId: string, productId: string) {
  const product = await prisma.product.findFirst({
    where: { id: productId, deletedAt: null },
  });
  if (!product) throw new FileError("NOT_FOUND");
  if (product.creatorId !== creatorId) throw new FileError("FORBIDDEN");
  return product;
}

export function sanitizeFilename(name: string): string {
  return name.replace(/[^\p{L}\p{N}._-]+/gu, "_").slice(0, 120);
}

export function buildStorageKey(productId: string, filename: string, role: FileRole): string {
  // PRD §14: products/{productId}/... — original แยกจาก preview path
  const dir = role === "COVER" ? "cover" : "original";
  return `products/${productId}/${dir}/${randomUUID()}/${sanitizeFilename(filename)}`;
}

/** TASK-031: issue a direct-upload ticket (client uploads straight to storage). */
export async function createUploadTicket(input: {
  productId: string;
  filename: string;
  mimeType: string;
  size: number;
  role: FileRole;
}) {
  if (!ALLOWED_MIME[input.mimeType]) throw new FileError("BAD_MIME");
  if (input.size <= 0 || input.size > MAX_FILE_SIZE) throw new FileError("TOO_LARGE");
  const key = buildStorageKey(input.productId, input.filename, input.role);
  const ticket = await storage.presignUpload(key, input.mimeType);
  return { ...ticket, filename: sanitizeFilename(input.filename) };
}

/** TASK-033: hash + record file, generate watermarked preview for images. */
export async function confirmUpload(input: {
  creatorId: string;
  productId: string;
  key: string;
  filename: string;
  mimeType: string;
  role: FileRole;
}) {
  await assertOwnProduct(input.creatorId, input.productId);
  if (!ALLOWED_MIME[input.mimeType]) throw new FileError("BAD_MIME");
  // key ต้องอยู่ใต้ product ของ creator เท่านั้น
  if (!input.key.startsWith(`products/${input.productId}/`)) throw new FileError("FORBIDDEN");

  // อ่านไฟล์จาก storage เพื่อตรวจขนาด + คำนวณ SHA-256 (server-side)
  const buffer = await storage.getBuffer(input.key);
  if (!buffer || buffer.length === 0) throw new FileError("UPLOAD_INCOMPLETE");
  if (buffer.length > MAX_FILE_SIZE) throw new FileError("TOO_LARGE");
  const fileSize = buffer.length;
  const sha256 = createHash("sha256").update(buffer).digest("hex");

  const file = await prisma.productFile.create({
    data: {
      productId: input.productId,
      storageKey: input.key,
      originalFilename: sanitizeFilename(input.filename),
      mimeType: input.mimeType,
      fileSize,
      sha256Hash: sha256,
      fileRole: input.role,
      scanStatus: "CLEAN",
    },
  });

  // TASK-047 (ครึ่งที่เป็นไปได้ก่อนมีไฟล์ทุกผลงาน): exact duplicate detection
  const duplicate = await prisma.productFile.findFirst({
    where: { sha256Hash: sha256, id: { not: file.id } },
    select: { productId: true },
  });

  // TASK-035/036: preview + watermark สำหรับรูปภาพ
  let previewInfo: { width?: number; height?: number; watermark: boolean } | null = null;
  if (input.mimeType === "image/png" || input.mimeType === "image/jpeg" || input.mimeType === "image/webp") {
    try {
      const sharp = (await import("sharp")).default;
      const img = sharp(buffer);
      const meta = await img.metadata();
      const previewBuffer = await img
        .composite([{ input: watermarkSvg(meta.width ?? 1200, meta.height ?? 900), gravity: "center" }])
        .toBuffer();
      const previewKey = `products/${input.productId}/preview/${file.id}.png`;
      await storage.putBuffer(previewKey, previewBuffer, "image/png");
      await prisma.productPreview.create({
        data: {
          fileId: file.id,
          productId: input.productId,
          storageKey: previewKey,
          mimeType: "image/png",
          width: meta.width,
          height: meta.height,
          watermarkApplied: true,
        },
      });
      previewInfo = { width: meta.width, height: meta.height, watermark: true };
    } catch (e) {
      logger.error("preview_generation_failed", { fileId: file.id, error: String(e).slice(0, 200) });
    }
  }

  logger.info("file_confirmed", {
    fileId: file.id,
    productId: input.productId,
    size: fileSize,
    duplicateOf: duplicate?.productId ?? null,
    preview: previewInfo,
  });

  return { fileId: file.id, duplicateOfProductId: duplicate?.productId ?? null, preview: previewInfo };
}

function watermarkSvg(w: number, h: number): Buffer {
  const label = "ครูเปย์ครู KruPayKru • ตัวอย่าง";
  const svg = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <g opacity="0.28" transform="translate(${w / 2},${h / 2}) rotate(-30)">
      <text x="0" y="0" text-anchor="middle" font-size="${Math.max(28, Math.floor(w / 22))}" fill="#0F766E" font-family="sans-serif" font-weight="bold">${label}</text>
      <text x="0" y="${Math.max(48, Math.floor(w / 14))}" text-anchor="middle" font-size="${Math.max(20, Math.floor(w / 30))}" fill="#0F766E" font-family="sans-serif">${label}</text>
    </g>
  </svg>`;
  return Buffer.from(svg);
}

export async function listProductFiles(productId: string) {
  return prisma.productFile.findMany({
    where: { productId },
    orderBy: { createdAt: "asc" },
    include: { preview: true },
  });
}

export async function deleteOwnFile(creatorId: string, fileId: string) {
  const file = await prisma.productFile.findUnique({ where: { id: fileId } });
  if (!file) throw new FileError("NOT_FOUND");
  const product = await prisma.product.findUnique({ where: { id: file.productId } });
  if (!product || product.creatorId !== creatorId) throw new FileError("FORBIDDEN");
  await storage.delete(file.storageKey);
  const preview = await prisma.productPreview.findUnique({ where: { fileId: file.id } });
  if (preview) {
    await storage.delete(preview.storageKey);
    await prisma.productPreview.delete({ where: { id: preview.id } });
  }
  await prisma.productFile.delete({ where: { id: file.id } });
}

/** TASK-037/038: authorized download — log ทุกครั้ง (PRD §42) */
export async function authorizeDownload(fileId: string, userId: string | null) {
  const file = await prisma.productFile.findUnique({
    where: { id: fileId },
    include: { product: true },
  });
  if (!file) throw new FileError("NOT_FOUND");

  // TASK-078: entitlement คือสิทธิ์หลักของผู้ซื้อ + เจ้าของสินค้า + admin (PRD §41)
  if (userId) {
    const [entitled, creatorProfile, user] = await Promise.all([
      prisma.entitlement.findFirst({ where: { buyerId: userId, productId: file.productId, revokedAt: null } }),
      prisma.creatorProfile.findFirst({
        where: { userId, id: file.product.creatorId, deletedAt: null },
      }),
      prisma.user.findUnique({ where: { id: userId }, select: { role: true } }),
    ]);
    const isOwner = Boolean(creatorProfile);
    const isAdmin = user?.role === "ADMIN";
    if (!entitled && !isOwner && !isAdmin) throw new FileError("FORBIDDEN");
  } else {
    throw new FileError("FORBIDDEN");
  }

  await prisma.downloadEvent.create({
    data: { userId, fileId: file.id, productId: file.productId },
  });
  return file;
}

/** สำหรับหน้า public product page (Phase 6): โหลด preview โดยไม่ต้อง login */
export async function getPreviewForRead(fileId: string) {
  const preview = await prisma.productPreview.findUnique({ where: { fileId } });
  return preview;
}
