import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export async function toggleCreatorFollow(userId: string, creatorId: string) {
  const existing = await prisma.follow.findUnique({ where: { userId_creatorId: { userId, creatorId } } });
  if (existing) { await prisma.follow.delete({ where: { id: existing.id } }); return "removed" as const; }
  await prisma.follow.create({ data: { userId, creatorId } });
  return "added" as const;
}

export async function toggleTopicFollow(userId: string, subjectId: number, gradeId: number) {
  const existing = await prisma.follow.findUnique({ where: { userId_subjectId_gradeId: { userId, subjectId, gradeId } } });
  if (existing) { await prisma.follow.delete({ where: { id: existing.id } }); return "removed" as const; }
  await prisma.follow.create({ data: { userId, subjectId, gradeId } });
  return "added" as const;
}

function codeFor(name: string) { return `${name.replace(/[^a-z0-9]/gi, "").slice(0, 8).toUpperCase()}${randomUUID().slice(0, 5).toUpperCase()}`; }
export const referralExpiresAt = (from: Date) => new Date(from.getTime() + 90 * 86400000);
export const referralRewardAmount = (platformFee: number) => Math.round(platformFee * 0.05 * 100) / 100;

export async function getOrCreateReferralCode(creatorId: string, displayName: string) {
  const existing = await prisma.referralCode.findUnique({ where: { creatorId } });
  return existing ?? prisma.referralCode.create({ data: { creatorId, code: codeFor(displayName) } });
}

export async function attributeReferral(userId: string, code: string) {
  const referral = await prisma.referralCode.findUnique({ where: { code: code.toUpperCase() }, include: { creator: true } });
  if (!referral?.isActive || referral.creator.userId === userId) return false;
  await prisma.referralAttribution.upsert({
    where: { referredUserId: userId }, update: {},
    create: { referredUserId: userId, referralCodeId: referral.id, expiresAt: referralExpiresAt(new Date()) },
  });
  return true;
}

export async function createReferralReward(tx: Prisma.TransactionClient, orderId: string, buyerId: string, platformFee: number) {
  const attribution = await tx.referralAttribution.findUnique({ where: { referredUserId: buyerId }, include: { referralCode: { include: { creator: true } } } });
  if (!attribution || attribution.expiresAt < new Date()) return null;
  return tx.referralReward.upsert({
    where: { orderId }, update: {},
    create: { attributionId: attribution.id, orderId, creatorUserId: attribution.referralCode.creator.userId, amount: referralRewardAmount(platformFee) },
  });
}
