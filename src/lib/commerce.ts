import { createHmac, timingSafeEqual, randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

/**
 * TASK-070-078: commerce core
 * - ราคาตอน checkout คำนวณฝั่ง server จาก DB เสมอ — client price ห้ามเชื่อ (PRD §33)
 * - order item snapshot ราคา/เวอร์ชัน/ค่า fee ติดหนาดตอนสั่ง (PRD §34)
 * - fulfillment idempotent — webhook ยิงซ้ำไม่สร้าง duplicate (PRD §89, §110)
 */

export const PAYMENT_CONFIRM_SECRET = process.env.AUTH_SECRET ?? "dev";

export function signPaymentConfirm(paymentId: string): string {
  return createHmac("sha256", PAYMENT_CONFIRM_SECRET).update(`confirm:${paymentId}`).digest("hex");
}

export function verifyPaymentConfirm(paymentId: string, signature: string): boolean {
  const expected = Buffer.from(signPaymentConfirm(paymentId));
  const given = Buffer.from(signature);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

async function activeFeeRate(): Promise<number> {
  const rule = await prisma.platformFeeRule.findFirst({ where: { isActive: true }, orderBy: { id: "asc" } });
  return rule ? rule.ratePct.toNumber() / 100 : 0.15;
}

export async function getOrCreateCart(userId: string) {
  return prisma.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
    include: { items: { include: { product: { include: { creator: true } }, bundle: { include: { creator: true, items: { include: { product: true } } } } } } },
  });
}

export async function addToCart(userId: string, productId: string) {
  // ซื้อซ้ำไม่ได้ถ้ามีสิทธิ์อยู่แล้ว (PRD §41 entitlement)
  const owned = await prisma.entitlement.findFirst({
    where: { buyerId: userId, productId, revokedAt: null },
  });
  if (owned) throw new Error("ALREADY_OWNED");
  const product = await prisma.product.findFirst({
    where: { id: productId, deletedAt: null, status: "PUBLISHED", visibility: "PUBLIC" },
  });
  if (!product) throw new Error("PRODUCT_NOT_AVAILABLE");
  if (product.creatorId === (await prisma.creatorProfile.findUnique({ where: { userId } }))?.id) {
    throw new Error("OWN_PRODUCT");
  }
  const cart = await getOrCreateCart(userId);
  await prisma.cartItem.upsert({
    where: { productId },
    update: {},
    create: { cartId: cart.id, productId },
  });
}

export async function removeFromCart(userId: string, productId: string) {
  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) return;
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id, productId } });
}

export async function removeBundleFromCart(userId: string, bundleId: string) {
  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (cart) await prisma.cartItem.deleteMany({ where: { cartId: cart.id, bundleId } });
}

/** ราคาปัจจุบันจาก DB เท่านั้น — ใช้ทั้งตอนแสดง cart และตอน checkout */
export async function cartPriced(userId: string) {
  const cart = await getOrCreateCart(userId);
  const items = cart.items.flatMap((item) => {
    if (item.bundle && item.bundleId) return [{ cartItemId: item.id, productId: item.bundleId, title: item.bundle.title, price: item.bundle.price.toNumber(), creatorName: item.bundle.creator.displayName, isBundle: true }];
    if (!item.product || !item.productId) return [];
    return [{
      cartItemId: item.id,
      productId: item.productId,
      title: item.product.title,
      price: item.product.price.toNumber(),
      creatorName: item.product.creator.displayName,
      isBundle: false,
    }];
  });
  const subtotal = items.reduce((sum, i) => sum + i.price, 0);
  return { items, subtotal };
}

/**
 * TASK-071/072/073: checkout — สร้าง order พร้อม snapshot + payment session
 */
export async function checkout(userId: string) {
  const { items, subtotal } = await cartPriced(userId);
  if (items.length === 0) throw new Error("EMPTY_CART");

  const bundleIds = items.filter((i) => i.isBundle).map((i) => i.productId);
  const bundles = bundleIds.length ? await prisma.bundle.findMany({ where: { id: { in: bundleIds }, status: "PUBLISHED", visibility: "PUBLIC" }, include: { items: { include: { product: true } } } }) : [];
  if (bundles.length !== bundleIds.length || bundles.some((b) => b.items.length < 2)) throw new Error("PRODUCT_UNAVAILABLE");
  const individualIds = items.filter((i) => !i.isBundle).map((i) => i.productId);
  const componentBundleIds = bundles.flatMap((b) => b.items.map((i) => i.productId));
  const requestedIds = [...individualIds, ...componentBundleIds];
  if (new Set(requestedIds).size !== requestedIds.length) throw new Error("PRODUCT_UNAVAILABLE");
  // revalidate ตอน checkout: ทุก product ต้องยัง published
  const published = await prisma.product.findMany({
    where: { id: { in: requestedIds }, status: "PUBLISHED", visibility: "PUBLIC", deletedAt: null },
    include: { versions: { orderBy: { versionNumber: "desc" }, take: 1 } },
  });
  if (published.length !== requestedIds.length || published.some((p) => !p.versions[0])) throw new Error("PRODUCT_UNAVAILABLE");

  const feeRate = await activeFeeRate();

  const order = await prisma.order.create({
    data: {
      buyerId: userId,
      subtotal,
      total: subtotal,
      items: {
        create: published.map((p) => {
          const bundle = bundles.find((b) => b.items.some((i) => i.productId === p.id));
          const regularTotal = bundle ? bundle.items.reduce((sum, i) => sum + i.product.price.toNumber(), 0) : 0;
          const unitPrice = bundle && regularTotal > 0 ? Math.round((bundle.price.toNumber() * p.price.toNumber() / regularTotal) * 100) / 100 : p.price.toNumber();
          const fee = Math.round(unitPrice * feeRate * 100) / 100;
          return {
            productId: p.id,
            creatorId: p.creatorId,
            title: p.title,
            unitPrice,
            platformFee: fee,
            creatorAmount: Math.round((unitPrice - fee) * 100) / 100,
            productVersionId: p.versions[0].id,
            bundleId: bundle?.id,
          };
        }),
      },
    },
    include: { items: true },
  });

  // TASK-075: payment session (mock provider)
  const payment = await prisma.payment.create({
    data: {
      orderId: order.id,
      provider: "mock",
      providerPaymentId: `mock_${randomUUID()}`,
      amount: order.total,
    },
  });

  await prisma.cartItem.deleteMany({ where: { cartId: (await getOrCreateCart(userId)).id } });

  logger.info("order_created", { orderId: order.id, total: order.total.toNumber(), items: order.items.length });
  return { order, payment };
}

/**
 * TASK-076/077/078: fulfillment — idempotent เท่านั้น (PRD §110)
 * เรียกจาก mock confirm หรือ webhook ก็ได้ ผลลัพธ์เหมือนกันและซ้ำไม่เกิดผล
 */
export async function fulfillPaidPayment(providerPaymentId: string) {
  const payment = await prisma.payment.findUnique({
    where: { providerPaymentId },
    include: { order: { include: { items: true } } },
  });
  if (!payment) throw new Error("PAYMENT_NOT_FOUND");

  // Idempotency: paid ไปแล้ว → คืนผลเดิม ไม่ทำอะไร
  if (payment.status === "PAID") {
    return { alreadyPaid: true, orderId: payment.orderId };
  }

  const granted = await prisma.$transaction(async (tx) => {
    const now = new Date();
    await tx.payment.update({
      where: { id: payment.id },
      data: { status: "PAID", paidAt: now },
    });
    await tx.order.update({
      where: { id: payment.orderId },
      data: { status: "PAID", paymentStatus: "PAID", paidAt: now },
    });
    // Entitlement สร้างครั้งเดียวต่อ order item (unique constraint กันซ้ำระดับ DB)
    let created = 0;
    for (const item of payment.order.items) {
      // upsert: สร้างใหม่ หรือ "ปลดล็อก" สิทธิ์เดิมที่ถูก revoke (กรณีซื้อซ้ำหลังคืนเงิน)
      const existing = await tx.entitlement.findUnique({ where: { orderItemId: item.id } });
      if (existing) continue;
      await tx.entitlement.upsert({
        where: { buyerId_productId: { buyerId: payment.order.buyerId, productId: item.productId } },
        update: { revokedAt: null, orderItemId: item.id },
        create: {
          buyerId: payment.order.buyerId,
          orderItemId: item.id,
          productId: item.productId,
        },
      });
      created++;
    }
    // TASK-080: ledger บันทึกใน transaction เดียวกัน — ทุกบาท trace ได้ (PRD §110)
    const { recordSaleLedger } = await import("@/lib/finance");
    const alreadyLedgered = await tx.ledgerEntry.findFirst({
      where: { transactionGroupId: `order:${payment.orderId}` },
    });
    if (!alreadyLedgered) {
      await recordSaleLedger(tx, payment.order);
    }
    // Referral is first-touch, limited to 90 days and protected by a unique order constraint.
    // Rewards are recorded here; payout release remains gated on production KYC/payment operations.
    const { createReferralReward } = await import("@/lib/growth");
    const platformFee = payment.order.items.reduce((sum, item) => sum + item.platformFee.toNumber(), 0);
    const reward = await createReferralReward(tx, payment.orderId, payment.order.buyerId, platformFee);
    if (reward) {
      const { trackEvent } = await import("@/lib/analytics");
      void trackEvent({ eventType: "REFERRAL_CONVERSION", userId: payment.order.buyerId, properties: { orderId: payment.orderId, reward: reward.amount.toNumber() } });
    }
    return created;
  });

  // TASK-094: แจ้งเตือน — new sale ให้ creator + payment success ให้ buyer
  const notifiedCreators = new Set<string>();
  for (const item of payment.order.items) {
    if (!notifiedCreators.has(item.creatorId)) {
      notifiedCreators.add(item.creatorId);
      const creatorProfile = await prisma.creatorProfile.findUnique({ where: { id: item.creatorId }, select: { userId: true } });
      if (creatorProfile) {
        const { notify } = await import("@/lib/notifications");
        await notify({
          userId: creatorProfile.userId,
          type: "NEW_SALE",
          title: "คุณมีการขายใหม่! 🎉",
          body: item.title,
          linkUrl: "/dashboard/earnings",
        });
      }
    }
  }
  {
    const { notify } = await import("@/lib/notifications");
    await notify({
      userId: payment.order.buyerId,
      type: "PAYMENT_SUCCESS",
      title: "ชำระเงินสำเร็จ",
      body: "สื่อของคุณพร้อมดาวน์โหลดแล้ว",
      linkUrl: "/account/downloads",
    });
  }

  // TASK-107: purchase attribution — ต่อ creator/product เพื่อ funnel analytics
  const { trackEvent } = await import("@/lib/analytics");
  for (const item of payment.order.items) {
    void trackEvent({
      eventType: "PURCHASE",
      userId: payment.order.buyerId,
      productId: item.productId,
      creatorId: item.creatorId,
      properties: { orderId: payment.orderId, amount: item.unitPrice.toNumber() },
    });
  }

  logger.info("payment_fulfilled", { paymentId: payment.id, orderId: payment.orderId, entitlements: granted });
  return { alreadyPaid: false, orderId: payment.orderId, entitlements: granted };
}

/** TASK-079: purchase history */
export async function listOrders(buyerId: string) {
  return prisma.order.findMany({
    where: { buyerId },
    orderBy: { createdAt: "desc" },
    include: { items: { include: { product: true } }, payments: true },
  });
}

export async function listEntitlements(buyerId: string) {
  return prisma.entitlement.findMany({
    where: { buyerId, revokedAt: null },
    orderBy: { grantedAt: "desc" },
    include: {
      orderItem: { select: { title: true, unitPrice: true, orderId: true } },
    },
  });
}

export async function hasEntitlement(userId: string, productId: string): Promise<boolean> {
  const ent = await prisma.entitlement.findFirst({
    where: { buyerId: userId, productId, revokedAt: null },
  });
  return Boolean(ent);
}
