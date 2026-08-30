import { prisma } from "@/lib/prisma";

/**
 * TASK-091: reviews — verified purchase only, กันซ้ำระดับ DB (PRD §43)
 */

export class ReviewError extends Error {
  constructor(public code: "NOT_ENTITLED" | "ALREADY_REVIEWED" | "INVALID_RATING") {
    super(code);
  }
}

export async function createReview(input: {
  buyerId: string;
  orderItemId: string;
  rating: number;
  title?: string;
  body?: string;
}) {
  if (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5) {
    throw new ReviewError("INVALID_RATING");
  }
  const orderItem = await prisma.orderItem.findUnique({
    where: { id: input.orderItemId },
    include: { order: true },
  });
  if (!orderItem || orderItem.order.buyerId !== input.buyerId || orderItem.order.status !== "PAID") {
    throw new ReviewError("NOT_ENTITLED");
  }
  const existing = await prisma.review.findUnique({ where: { orderItemId: input.orderItemId } });
  if (existing) throw new ReviewError("ALREADY_REVIEWED");

  return prisma.review.create({
    data: {
      productId: orderItem.productId,
      buyerId: input.buyerId,
      orderItemId: input.orderItemId,
      rating: input.rating,
      title: input.title || null,
      body: input.body || null,
    },
  });
}

export async function getProductReviews(productId: string) {
  return prisma.review.findMany({
    where: { productId },
    orderBy: { createdAt: "desc" },
    include: { buyer: { select: { displayName: true } } },
  });
}

export async function getProductRating(productId: string) {
  const agg = await prisma.review.aggregate({
    where: { productId },
    _avg: { rating: true },
    _count: { rating: true },
  });
  return {
    avg: agg._avg.rating ? Math.round(agg._avg.rating * 10) / 10 : null,
    count: agg._count.rating,
  };
}

export async function getBuyerReviewableItems(buyerId: string) {
  // order items ที่ซื้อแล้ว + ยังไม่รีวิว
  const items = await prisma.orderItem.findMany({
    where: { order: { buyerId, status: "PAID" }, review: null },
    orderBy: { orderId: "desc" },
    take: 10,
  });
  return items;
}

/** TASK-092: wishlist toggle */
export async function toggleWishlist(userId: string, productId: string): Promise<"added" | "removed"> {
  const wishlist = await prisma.wishlist.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });
  const existing = await prisma.wishlistItem.findUnique({ where: { productId } });
  if (existing && existing.wishlistId === wishlist.id) {
    await prisma.wishlistItem.delete({ where: { id: existing.id } });
    return "removed";
  }
  if (existing) {
    // อยู่ wishlist อื่น (ไม่ควรเกิด) — ย้ายมา
    await prisma.wishlistItem.update({ where: { id: existing.id }, data: { wishlistId: wishlist.id } });
    return "added";
  }
  await prisma.wishlistItem.create({ data: { wishlistId: wishlist.id, productId } });
  return "added";
}

export async function listWishlist(userId: string) {
  const wishlist = await prisma.wishlist.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            include: {
              creator: { select: { displayName: true } },
              files: { where: { fileRole: { in: ["ORIGINAL", "COVER"] } }, include: { preview: true }, take: 1 },
            },
          },
        },
      },
    },
  });
  return wishlist?.items ?? [];
}
