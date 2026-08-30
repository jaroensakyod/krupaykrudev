import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import type { Prisma } from "@prisma/client";

export const COPYRIGHT_DECLARATION_VERSION = "1.0";

/**
 * TASK-057: immutable audit trail for critical actions.
 * Financial/moderation/user actions MUST write an audit entry (PRD §54).
 */
export async function writeAudit(
  actorId: string | null,
  action: string,
  entityType: string,
  entityId: string,
  opts?: {
    before?: Prisma.InputJsonValue;
    after?: Prisma.InputJsonValue;
    metadata?: Prisma.InputJsonValue;
  },
) {
  await prisma.auditLog.create({
    data: {
      actorId,
      action,
      entityType,
      entityId,
      beforeJson: opts?.before,
      afterJson: opts?.after,
      metadataJson: opts?.metadata,
    },
  });
  logger.info("audit", { actorId, action, entityType, entityId });
}

/** TASK-050: record the pre-submit rights declaration (PRD §46). */
export async function recordCopyrightDeclaration(creatorId: string, productId: string) {
  await prisma.copyrightDeclaration.create({
    data: {
      creatorId,
      productId,
      declarationVersion: COPYRIGHT_DECLARATION_VERSION,
    },
  });
}

async function openOrGetProductCase(productId: string) {
  const existing = await prisma.moderationCase.findFirst({
    where: { entityType: "product", entityId: productId, status: { in: ["OPEN", "IN_REVIEW"] } },
  });
  if (existing) return existing;
  return prisma.moderationCase.create({
    data: { caseType: "PRODUCT_REVIEW", entityType: "product", entityId: productId },
  });
}

export type ModerationDecision = "APPROVE" | "REJECT" | "NEEDS_CHANGES" | "SUSPEND";

/**
 * TASK-054: moderation decision — status transitions happen only here.
 * Every decision updates the product, closes the case, and writes an audit log.
 */
export async function moderateProduct(
  adminId: string,
  productId: string,
  decision: ModerationDecision,
  note?: string,
) {
  const product = await prisma.product.findFirst({
    where: { id: productId, deletedAt: null },
  });
  if (!product) throw new Error("PRODUCT_NOT_FOUND");

  const decisionData: Prisma.ProductUpdateInput = {};
  const auditAfter: Record<string, string | null> = {};
  if (decision === "APPROVE") {
    decisionData.status = "PUBLISHED";
    decisionData.moderationStatus = "APPROVED";
    decisionData.visibility = "PUBLIC";
    decisionData.publishedAt = new Date();
    auditAfter.status = "PUBLISHED";
    auditAfter.moderationStatus = "APPROVED";
  } else if (decision === "REJECT") {
    decisionData.status = "REJECTED";
    decisionData.moderationStatus = "REJECTED";
    auditAfter.status = "REJECTED";
  } else if (decision === "NEEDS_CHANGES") {
    decisionData.status = "NEEDS_CHANGES";
    decisionData.moderationStatus = "NEEDS_CHANGES";
    auditAfter.status = "NEEDS_CHANGES";
  } else {
    decisionData.status = "SUSPENDED";
    auditAfter.status = "SUSPENDED";
  }

  const updated = await prisma.$transaction(async (tx) => {
    const updatedProduct = await tx.product.update({
      where: { id: productId },
      data: decisionData,
    });

    const resolution =
      decision === "APPROVE"
        ? `approved${note ? `: ${note}` : ""}`
        : decision === "REJECT"
          ? `rejected${note ? `: ${note}` : ""}`
          : decision === "NEEDS_CHANGES"
            ? `needs changes${note ? `: ${note}` : ""}`
            : `suspended${note ? `: ${note}` : ""}`;

    await tx.moderationCase.updateMany({
      where: { entityType: "product", entityId: productId, status: { in: ["OPEN", "IN_REVIEW"] } },
      data: { status: "RESOLVED", assignedTo: adminId, resolution, resolvedAt: new Date() },
    });

    await tx.auditLog.create({
      data: {
        actorId: adminId,
        action: `moderation.${decision.toLowerCase()}`,
        entityType: "product",
        entityId: productId,
        beforeJson: { status: product.status, moderationStatus: product.moderationStatus },
        afterJson: auditAfter,
        metadataJson: note ? { note } : undefined,
      },
    });

    return updatedProduct;
  });

  logger.info("moderation_decision", { adminId, productId, decision });
  return updated;
}

/** Open a new moderation case manually (reports, disputes ฯลฯ) */
export async function openModerationCase(input: {
  caseType: "PRODUCT_REVIEW" | "COPYRIGHT" | "FRAUD" | "USER_REPORT" | "PAYMENT_DISPUTE";
  entityType: string;
  entityId: string;
  riskLevel?: "LOW" | "MEDIUM" | "HIGH";
}) {
  return prisma.moderationCase.create({
    data: {
      caseType: input.caseType,
      entityType: input.entityType,
      entityId: input.entityId,
      riskLevel: input.riskLevel ?? "LOW",
    },
  });
}

/** TASK-056: strike a user — enforcement via policy/service, never AI alone. */
export async function issueStrike(
  adminId: string,
  userId: string,
  reason: string,
  severity: "LOW" | "MEDIUM" | "HIGH",
  relatedCaseId?: string,
) {
  const strike = await prisma.strike.create({
    data: { userId, reason, severity, relatedCaseId },
  });
  await writeAudit(adminId, "trust.strike_issued", "user", userId, {
    metadata: { reason, severity, strikeId: strike.id },
  });
  return strike;
}

export async function getModerationQueue() {
  const products = await prisma.product.findMany({
    where: { status: { in: ["READY_FOR_REVIEW", "UNDER_REVIEW"] }, deletedAt: null },
    orderBy: { updatedAt: "asc" },
    include: {
      creator: { select: { displayName: true, slug: true, verificationStatus: true } },
      productType: true,
      subject: true,
      grade: true,
      copyrightDeclarations: { orderBy: { acceptedAt: "desc" }, take: 1 },
    },
  });
  return products;
}

export async function getAdminOverview() {
  const [
    totalUsers,
    totalCreators,
    totalProducts,
    publishedProducts,
    pendingModeration,
    openReports,
  ] = await Promise.all([
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.creatorProfile.count({ where: { deletedAt: null } }),
    prisma.product.count({ where: { deletedAt: null } }),
    prisma.product.count({ where: { status: "PUBLISHED" } }),
    prisma.product.count({ where: { status: { in: ["READY_FOR_REVIEW", "UNDER_REVIEW"] } } }),
    prisma.report.count({ where: { status: "OPEN" } }),
  ]);
  return { totalUsers, totalCreators, totalProducts, publishedProducts, pendingModeration, openReports };
}
