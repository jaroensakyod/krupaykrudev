-- CreateEnum
CREATE TYPE "CreatorVerificationStatus" AS ENUM ('UNVERIFIED', 'BASIC', 'VERIFIED', 'RESTRICTED');

-- CreateTable
CREATE TABLE "creator_profiles" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "bio" TEXT,
    "profile_image_url" TEXT,
    "banner_url" TEXT,
    "subjects" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "grade_levels" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "specialties" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "social_links" JSONB,
    "verification_status" "CreatorVerificationStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "trust_level" INTEGER NOT NULL DEFAULT 0,
    "terms_accepted_at" TIMESTAMP(3),
    "terms_version" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "creator_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "creator_profiles_user_id_key" ON "creator_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "creator_profiles_slug_key" ON "creator_profiles"("slug");

-- AddForeignKey
ALTER TABLE "creator_profiles" ADD CONSTRAINT "creator_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
