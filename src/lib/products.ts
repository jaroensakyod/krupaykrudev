import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import type { ProductStatus } from "@prisma/client";

export class ProductError extends Error {
  constructor(
    public code:
      | "NOT_FOUND"
      | "FORBIDDEN"
      | "INVALID_STATUS"
      | "INCOMPLETE_SUBMISSION",
  ) {
    super(code);
  }
}

/** Thai-friendly slug: keep Thai letters/numbers, collapse spaces to dashes. */
async function generateUniqueSlug(title: string): Promise<string> {
  const base =
    title
      .toLowerCase()
      .trim()
      .replace(/[\s_]+/g, "-")
      .replace(/[^\p{L}\p{N}-]+/gu, "")
      .replace(/-{2,}/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60) || "san";

  let slug = base;
  let n = 2;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const taken = await prisma.product.findUnique({ where: { slug } });
    if (!taken) return slug;
    slug = `${base}-${n++}`;
  }
}

/** TASK-027: create a draft product + initial version record. */
export async function createDraftProduct(creatorId: string, userId: string, title: string) {
  const cleanTitle = title.trim();
  if (cleanTitle.length < 3 || cleanTitle.length > 200) {
    throw new ProductError("INCOMPLETE_SUBMISSION");
  }
  const slug = await generateUniqueSlug(cleanTitle);
  const product = await prisma.product.create({
    data: {
      creatorId,
      title: cleanTitle,
      slug,
      // ค่าเริ่มต้น: วิชา/ชั้น/ประเภทแรก — creator แก้ในหน้า editor ก่อน submit
      productTypeId: (await prisma.productType.findFirstOrThrow({ orderBy: { sortOrder: "asc" } })).id,
      subjectId: (await prisma.subject.findFirstOrThrow({ orderBy: { sortOrder: "asc" } })).id,
      primaryGradeId: (await prisma.grade.findFirstOrThrow({ orderBy: { sortOrder: "asc" } })).id,
      versions: {
        create: { versionNumber: 1, createdBy: userId, changeSummary: "สร้างร่างแรก" },
      },
    },
    include: { versions: true },
  });
  logger.info("product_draft_created", { creatorId, productId: product.id });
  return product;
}

async function requireOwnProduct(creatorId: string, productId: string) {
  const product = await prisma.product.findFirst({
    where: { id: productId, deletedAt: null },
    include: { tags: { include: { tag: true } } },
  });
  if (!product) throw new ProductError("NOT_FOUND");
  if (product.creatorId !== creatorId) throw new ProductError("FORBIDDEN");
  return product;
}

export type UpdateDraftInput = {
  title: string;
  shortDescription?: string;
  description?: string;
  productTypeId: number;
  subjectId: number;
  primaryGradeId: number;
  curriculumId?: number | null;
  price: number;
  tags?: string[];
};

const EDITABLE_STATUSES: ProductStatus[] = ["DRAFT", "NEEDS_CHANGES", "REJECTED"];

/** TASK-028: edit draft product (metadata). */
export async function updateDraftProduct(
  creatorId: string,
  productId: string,
  input: UpdateDraftInput,
) {
  const product = await requireOwnProduct(creatorId, productId);
  if (!EDITABLE_STATUSES.includes(product.status)) {
    throw new ProductError("INVALID_STATUS");
  }

  const title = input.title.trim();
  if (title.length < 3 || title.length > 200) {
    throw new ProductError("INCOMPLETE_SUBMISSION");
  }
  if (input.price < 0 || input.price > 100000) {
    throw new ProductError("INCOMPLETE_SUBMISSION");
  }

  const tagNames = [...new Set((input.tags ?? []).map((t) => t.trim()).filter(Boolean))].slice(0, 20);

  return prisma.$transaction(async (tx) => {
    const updated = await tx.product.update({
      where: { id: productId },
      data: {
        title,
        shortDescription: input.shortDescription || null,
        description: input.description || null,
        productTypeId: input.productTypeId,
        subjectId: input.subjectId,
        primaryGradeId: input.primaryGradeId,
        curriculumId: input.curriculumId ?? null,
        price: input.price,
      },
    });

    if (input.tags) {
      await tx.productTag.deleteMany({ where: { productId } });
      for (const name of tagNames) {
        const existing = await tx.tag.findUnique({ where: { name } });
        const tag =
          existing ?? (await tx.tag.create({ data: { name, slug: await tagSlug(name) } }));
        await tx.productTag.create({ data: { productId, tagId: tag.id } });
      }
    }
    return updated;
  });
}

async function tagSlug(name: string): Promise<string> {
  const base = name.toLowerCase().trim().replace(/[\s_]+/g, "-").replace(/[^\p{L}\p{N}-]+/gu, "").slice(0, 40) || "tag";
  let slug = base;
  let n = 2;
  while (await prisma.tag.findUnique({ where: { slug } })) {
    slug = `${base}-${n++}`;
  }
  return slug;
}

/**
 * TASK-029: lifecycle transition — DRAFT/NEEDS_CHANGES/REJECTED → READY_FOR_REVIEW.
 * Status transitions are controlled here (service), never by the client (PRD §17).
 * TASK-050: requires the copyright declaration to be recorded (PRD §46).
 */
export async function submitForReview(
  creatorId: string,
  productId: string,
  declarationAccepted: boolean,
) {
  const product = await requireOwnProduct(creatorId, productId);
  if (!EDITABLE_STATUSES.includes(product.status)) {
    throw new ProductError("INVALID_STATUS");
  }
  if (!declarationAccepted) {
    throw new ProductError("INCOMPLETE_SUBMISSION");
  }

  // Submission requirements (files/preview จะเพิ่มเงื่อนไขใน Phase 3)
  if (product.title.trim().length < 3) {
    throw new ProductError("INCOMPLETE_SUBMISSION");
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.copyrightDeclaration.create({
      data: { creatorId, productId, declarationVersion: "1.0" },
    });
    const updatedProduct = await tx.product.update({
      where: { id: productId },
      data: { status: "READY_FOR_REVIEW", moderationStatus: "PENDING" },
    });
    // เปิด moderation case ให้ทีมตรวจ (TASK-052)
    const openCase = await tx.moderationCase.findFirst({
      where: { entityType: "product", entityId: productId, status: { in: ["OPEN", "IN_REVIEW"] } },
    });
    if (!openCase) {
      await tx.moderationCase.create({
        data: { caseType: "PRODUCT_REVIEW", entityType: "product", entityId: productId },
      });
    }
    return updatedProduct;
  });

  logger.info("product_submitted_for_review", { productId, creatorId });
  return updated;
}

export async function listCreatorProducts(creatorId: string) {
  return prisma.product.findMany({
    where: { creatorId, deletedAt: null },
    orderBy: { updatedAt: "desc" },
    include: { productType: true, subject: true, grade: true },
  });
}

export async function getOwnProduct(creatorId: string, productId: string) {
  return requireOwnProduct(creatorId, productId);
}
