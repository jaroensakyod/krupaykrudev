import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { writeAudit } from "@/lib/trust";
import type { Prisma, Order } from "@prisma/client";

/**
 * Phase 8 — Finance
 * - ทุกบาทผ่าน immutable ledger (PRD §36) — ห้าม hard delete, ห้าม mutate
 * - Balance derive จาก ledger เท่านั้น
 * - Idempotent: unique (transactionGroupId, entryType, accountId) ระดับ DB
 */

export const HOLD_DAYS = Number(process.env.FINANCE_HOLD_DAYS ?? "7");

function holdUntil(from: Date): Date {
  return new Date(from.getTime() + HOLD_DAYS * 24 * 60 * 60 * 1000);
}

/**
 * TASK-080/081: บันทึก ledger ตอน payment สำเร็จ — เรียกใน transaction เดียวกับ fulfillment
 * SALE (debit buyer→platform) + PLATFORM_FEE (credit) + CREATOR_EARNING (credit ต่อ creator)
 */
export async function recordSaleLedger(
  tx: Prisma.TransactionClient,
  order: Order & { items: Array<{ creatorId: string; creatorAmount: Prisma.Decimal; platformFee: Prisma.Decimal }> },
) {
  const availableAt = holdUntil(order.paidAt ?? new Date());
  const groupId = `order:${order.id}`;

  await tx.ledgerEntry.create({
    data: {
      transactionGroupId: groupId,
      entryType: "SALE",
      direction: "CREDIT",
      accountType: "PLATFORM",
      accountId: "PLATFORM",
      amount: order.total,
      orderId: order.id,
      availableAt,
    },
  });

  // รวมต่อ creator (คนเดียวกันหลายชิ้นในออเดอร์เดียว → entry เดียว)
  const perCreator = new Map<string, { earning: number; fee: number }>();
  for (const item of order.items) {
    const cur = perCreator.get(item.creatorId) ?? { earning: 0, fee: 0 };
    cur.earning += item.creatorAmount.toNumber();
    cur.fee += item.platformFee.toNumber();
    perCreator.set(item.creatorId, cur);
  }

  for (const [creatorId, amounts] of perCreator) {
    const creator = await tx.creatorProfile.findUniqueOrThrow({
      where: { id: creatorId },
      select: { userId: true },
    });
    await tx.ledgerEntry.create({
      data: {
        transactionGroupId: groupId,
        entryType: "PLATFORM_FEE",
        direction: "DEBIT",
        accountType: "PLATFORM",
        accountId: "PLATFORM",
        amount: amounts.fee,
        orderId: order.id,
      },
    });
    await tx.ledgerEntry.create({
      data: {
        transactionGroupId: groupId,
        entryType: "CREATOR_EARNING",
        direction: "CREDIT",
        accountType: "CREATOR",
        accountId: creator.userId,
        amount: amounts.earning,
        orderId: order.id,
        availableAt,
      },
    });
  }
  logger.info("sale_ledger_recorded", { orderId: order.id, groupId });
}

/** TASK-082/083: balances จาก ledger เท่านั้น */
export async function getCreatorBalance(creatorUserId: string) {
  const now = new Date();
  const [pendingAgg, availableEarnedAgg, payoutAgg] = await Promise.all([
    prisma.ledgerEntry.aggregate({
      where: { accountType: "CREATOR", accountId: creatorUserId, entryType: "CREATOR_EARNING", availableAt: { gt: now } },
      _sum: { amount: true },
    }),
    prisma.ledgerEntry.aggregate({
      where: { accountType: "CREATOR", accountId: creatorUserId, entryType: "CREATOR_EARNING", availableAt: { lte: now } },
      _sum: { amount: true },
    }),
    prisma.ledgerEntry.aggregate({
      where: { accountType: "CREATOR", accountId: creatorUserId, entryType: { in: ["PAYOUT", "REFUND", "ADJUSTMENT"] } },
      _sum: { amount: true },
    }),
  ]);
  const pending = pendingAgg._sum.amount?.toNumber() ?? 0;
  const available = (availableEarnedAgg._sum.amount?.toNumber() ?? 0) - (payoutAgg._sum.amount?.toNumber() ?? 0);
  return { pending: Math.round(pending * 100) / 100, available: Math.round(available * 100) / 100 };
}

/** TASK-086: creator ขอถอน available balance */
export async function requestPayout(creatorUserId: string, amount: number) {
  const { available } = await getCreatorBalance(creatorUserId);
  if (amount <= 0 || amount > available) throw new Error("INSUFFICIENT_BALANCE");
  const payout = await prisma.payout.create({
    data: { creatorUserId, amount },
  });
  logger.info("payout_requested", { payoutId: payout.id, creatorUserId, amount });
  return payout;
}

/** TASK-087: admin จ่ายเงิน — บันทึก ledger PAYOUT + audit */
export async function completePayout(adminId: string, payoutId: string, reference?: string) {
  const payout = await prisma.payout.findUnique({ where: { id: payoutId } });
  if (!payout) throw new Error("PAYOUT_NOT_FOUND");
  if (payout.status === "PAID") return payout; // idempotent

  const updated = await prisma.$transaction(async (tx) => {
    const now = new Date();
    const updatedPayout = await tx.payout.update({
      where: { id: payoutId },
      data: { status: "PAID", processedAt: now, processedBy: adminId, providerReference: reference },
    });
    await tx.ledgerEntry.create({
      data: {
        transactionGroupId: `payout:${payout.id}`,
        entryType: "PAYOUT",
        direction: "DEBIT",
        accountType: "CREATOR",
        accountId: payout.creatorUserId,
        amount: payout.amount,
        payoutId: payout.id,
      },
    });
    return updatedPayout;
  });
  await writeAudit(adminId, "finance.payout_paid", "payout", payoutId, {
    metadata: { amount: payout.amount.toNumber(), reference },
  });
  const { notify } = await import("@/lib/notifications");
  await notify({
    userId: payout.creatorUserId,
    type: "PAYOUT_UPDATE",
    title: "เงินถอนเข้าแล้ว 💰",
    body: `ยอด ฿${payout.amount.toNumber().toLocaleString()} ถูกโอนแล้ว${reference ? ` (อ้างอิง ${reference})` : ""}`,
    linkUrl: "/dashboard/earnings",
  });
  return updated;
}

/**
 * TASK-084/085: refund — reverse ledger (entry ใหม่ ห้ามลบของเดิม) + revoke entitlement
 */
export async function processRefund(
  adminId: string,
  orderId: string,
  reason: string,
) {
  const order = await prisma.order.findUniqueOrThrow({
    where: { id: orderId },
    include: { items: true },
  });
  if (order.status !== "PAID") throw new Error("ORDER_NOT_REFUNDABLE");

  const refund = await prisma.$transaction(async (tx) => {
    const now = new Date();
    const refundRow = await tx.refund.create({
      data: { orderId, amount: order.total, reason, requestedBy: order.buyerId, reviewedBy: adminId, status: "COMPLETED", completedAt: now },
    });
    await tx.order.update({
      where: { id: orderId },
      data: { status: "REFUNDED", paymentStatus: "REFUNDED" },
    });
    // Ledger reversal — กระทบยอดกลับด้วย entry ใหม่ทุกบัญชี
    await tx.ledgerEntry.create({
      data: {
        transactionGroupId: `refund:${refundRow.id}`,
        entryType: "REFUND",
        direction: "DEBIT",
        accountType: "PLATFORM",
        accountId: "PLATFORM",
        amount: order.total,
        refundId: refundRow.id,
      },
    });
    const perCreator = new Map<string, number>();
    for (const item of order.items) {
      const creator = await tx.creatorProfile.findUniqueOrThrow({ where: { id: item.creatorId }, select: { userId: true } });
      perCreator.set(creator.userId, (perCreator.get(creator.userId) ?? 0) + item.creatorAmount.toNumber());
    }
    for (const [creatorUserId, amount] of perCreator) {
      await tx.ledgerEntry.create({
        data: {
          transactionGroupId: `refund:${refundRow.id}`,
          entryType: "REFUND",
          direction: "DEBIT",
          accountType: "CREATOR",
          accountId: creatorUserId,
          amount,
          refundId: refundRow.id,
        },
      });
    }
    // Revoke entitlements ของออเดอร์นี้
    for (const item of order.items) {
      await tx.entitlement.updateMany({
        where: { orderItemId: item.id, revokedAt: null },
        data: { revokedAt: now },
      });
    }
    return refundRow;
  });

  await writeAudit(adminId, "finance.refund_processed", "order", orderId, {
    metadata: { reason, amount: order.total.toNumber(), refundId: refund.id },
  });
  logger.info("refund_processed", { orderId, refundId: refund.id });
  return refund;
}

/**
 * TASK-088: reconciliation — ทุก transaction group ของออเดอร์ต้อง net เป็นศูนย์
 * (SALE credit = PLATFORM_FEE debit + CREATOR_EARNING credit ต่อออเดอร์)
 */
export async function reconcilePlatform(): Promise<{
  ok: boolean;
  brokenGroups: Array<{ groupId: string; drift: number }>;
  groupsChecked: number;
}> {
  const entries = await prisma.ledgerEntry.findMany({
    where: { transactionGroupId: { startsWith: "order:" } },
    select: { transactionGroupId: true, entryType: true, amount: true },
  });
  const groups = new Map<string, { sale: number; fee: number; earning: number }>();
  for (const e of entries) {
    const amt = e.amount.toNumber();
    const g = groups.get(e.transactionGroupId) ?? { sale: 0, fee: 0, earning: 0 };
    if (e.entryType === "SALE") g.sale += amt;
    else if (e.entryType === "PLATFORM_FEE") g.fee += amt;
    else if (e.entryType === "CREATOR_EARNING") g.earning += amt;
    groups.set(e.transactionGroupId, g);
  }
  const brokenGroups = [...groups.entries()]
    .filter(([, g]) => Math.abs(g.sale - g.fee - g.earning) >= 0.01)
    .map(([groupId, g]) => ({ groupId, drift: Math.round((g.sale - g.fee - g.earning) * 100) / 100 }));
  return { ok: brokenGroups.length === 0, brokenGroups, groupsChecked: groups.size };
}

/** Backfill ledger สำหรับออเดอร์ที่จ่ายก่อน ledger มีถึง (ใช้ครั้งเดียวตอน deploy ระบบ finance) */
export async function backfillPaidOrders() {
  const orders = await prisma.order.findMany({
    where: { status: "PAID" },
    include: { items: true },
  });
  let done = 0;
  for (const order of orders) {
    const exists = await prisma.ledgerEntry.findFirst({ where: { transactionGroupId: `order:${order.id}` } });
    if (!exists) {
      await prisma.$transaction(async (tx) => {
        await recordSaleLedger(tx, order as Order & { items: never[] });
      });
      done++;
    }
  }
  return done;
}
