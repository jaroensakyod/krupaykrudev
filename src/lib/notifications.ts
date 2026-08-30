import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

/**
 * TASK-094: in-app notifications (PRD §71) — email channel จะเพิ่มตอนมี Resend (Phase 13)
 */

type NotificationType =
  | "PRODUCT_APPROVED"
  | "PRODUCT_REJECTED"
  | "PRODUCT_NEEDS_CHANGES"
  | "NEW_SALE"
  | "PAYMENT_SUCCESS"
  | "PAYOUT_UPDATE"
  | "REPORT_UPDATE";

export async function notify(input: {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  linkUrl?: string;
}) {
  try {
    await prisma.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        title: input.title,
        body: input.body,
        linkUrl: input.linkUrl,
      },
    });
  } catch (e) {
    logger.warn("notify_failed", { error: String(e).slice(0, 100) });
  }
}

export async function getUnreadCount(userId: string): Promise<number> {
  return prisma.notification.count({ where: { userId, readAt: null } });
}

export async function listNotifications(userId: string) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 30,
  });
}

export async function markAllRead(userId: string) {
  await prisma.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() },
  });
}
