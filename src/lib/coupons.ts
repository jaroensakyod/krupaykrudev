import { prisma } from "@/lib/prisma";

/** V1.5: คูปองรายร้าน + ติดตามร้าน (ใช้ Follow model ของระบบ) */

export type AppliedCoupon = {
  code: string;
  creatorId: string;
  discountPct: number;
};

/** ตรวจคูปอง — ใช้ได้เมื่อ active + ไม่หมดอายุ คืนข้อมูลสำหรับคิดส่วนลด */
export async function validateCoupon(code: string): Promise<AppliedCoupon | null> {
  const coupon = await prisma.coupon.findUnique({ where: { code: code.trim().toUpperCase() } });
  if (!coupon || !coupon.isActive) return null;
  if (coupon.expiresAt && coupon.expiresAt < new Date()) return null;
  return { code: coupon.code, creatorId: coupon.creatorId, discountPct: coupon.discountPct };
}

export async function createCoupon(creatorId: string, code: string, discountPct: number, expiresAt?: Date) {
  return prisma.coupon.create({
    data: {
      creatorId,
      code: code.trim().toUpperCase(),
      discountPct: Math.min(90, Math.max(1, Math.round(discountPct))),
      expiresAt: expiresAt ?? null,
    },
  });
}

export async function listSellerCoupons(creatorId: string) {
  return prisma.coupon.findMany({
    where: { creatorId },
    orderBy: { createdAt: "desc" },
  });
}

export async function deactivateCoupon(creatorId: string, couponId: string) {
  await prisma.coupon.updateMany({
    where: { id: couponId, creatorId }, // เจ้าของเท่านั้น
    data: { isActive: false },
  });
}

/** ติดตาม/เลิกติดตามร้าน — ใช้ Follow model (creatorId) */
export async function toggleStoreFollow(userId: string, creatorId: string): Promise<"added" | "removed"> {
  const existing = await prisma.follow.findFirst({
    where: { userId, creatorId },
  });
  if (existing) {
    await prisma.follow.delete({ where: { id: existing.id } });
    return "removed";
  }
  await prisma.follow.create({ data: { userId, creatorId } });
  return "added";
}

export async function isFollowingStore(userId: string, creatorId: string) {
  return prisma.follow.findFirst({ where: { userId, creatorId } }).then((r) => Boolean(r));
}

export async function listFollowedStores(userId: string) {
  const follows = await prisma.follow.findMany({
    where: { userId, creatorId: { not: null } },
    include: { creator: { select: { displayName: true, slug: true } } },
    orderBy: { createdAt: "desc" },
  });
  return follows.filter((f) => f.creator);
}

export async function countStoreFollowers(creatorId: string) {
  return prisma.follow.count({ where: { creatorId } });
}
