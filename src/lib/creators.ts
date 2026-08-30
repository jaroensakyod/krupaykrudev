import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export const CREATOR_TERMS_VERSION = "1.0";

export class CreatorError extends Error {
  constructor(public code: "ALREADY_CREATOR" | "SLUG_TAKEN" | "USER_NOT_FOUND" | "INVALID_SLUG") {
    super(code);
  }
}

const SLUG_RE = /^[a-z0-9][a-z0-9-]{2,39}$/;

export type BecomeCreatorInput = {
  displayName: string;
  slug: string;
  bio?: string;
  subjects?: string[];
};

/**
 * TASK-014: Become Creator flow — atomic profile creation + role upgrade.
 * Terms acceptance (TASK-017) is recorded on the profile.
 */
export async function becomeCreator(userId: string, input: BecomeCreatorInput) {
  const slug = input.slug.toLowerCase().trim();
  if (!SLUG_RE.test(slug)) {
    throw new CreatorError("INVALID_SLUG");
  }

  try {
    return await prisma.$transaction(async (tx) => {
      const existing = await tx.creatorProfile.findFirst({
        where: { userId, deletedAt: null },
      });
      if (existing) throw new CreatorError("ALREADY_CREATOR");

      const slugTaken = await tx.creatorProfile.findUnique({ where: { slug } });
      if (slugTaken) throw new CreatorError("SLUG_TAKEN");

      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) throw new CreatorError("USER_NOT_FOUND");

      const profile = await tx.creatorProfile.create({
        data: {
          userId,
          slug,
          displayName: input.displayName,
          bio: input.bio,
          subjects: input.subjects ?? [],
          gradeLevels: [],
          specialties: [],
          termsAcceptedAt: new Date(),
          termsVersion: CREATOR_TERMS_VERSION,
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: { role: "CREATOR" },
      });

      logger.info("creator_created", { userId, profileId: profile.id, slug });
      return profile;
    });
  } catch (error) {
    if (error instanceof CreatorError) throw error;
    logger.error("become_creator_failed", { userId, error: String(error) });
    throw error;
  }
}

export async function getCreatorBySlug(slug: string) {
  return prisma.creatorProfile.findFirst({
    where: { slug, deletedAt: null },
    include: { user: { select: { displayName: true, avatarUrl: true } } },
  });
}

export async function getCreatorByUserId(userId: string) {
  return prisma.creatorProfile.findFirst({
    where: { userId, deletedAt: null },
  });
}
