-- CreateEnum
CREATE TYPE "ModerationCaseStatus" AS ENUM ('OPEN', 'IN_REVIEW', 'RESOLVED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "ModerationCaseType" AS ENUM ('PRODUCT_REVIEW', 'COPYRIGHT', 'FRAUD', 'USER_REPORT', 'PAYMENT_DISPUTE');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('OPEN', 'REVIEWING', 'RESOLVED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "ReportReason" AS ENUM ('COPYRIGHT', 'MISLEADING', 'BROKEN_FILE', 'INAPPROPRIATE', 'SPAM', 'DUPLICATE', 'OTHER');

-- CreateEnum
CREATE TYPE "StrikeSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateTable
CREATE TABLE "copyright_declarations" (
    "id" UUID NOT NULL,
    "creator_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "declaration_version" TEXT NOT NULL,
    "accepted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "copyright_declarations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "moderation_cases" (
    "id" UUID NOT NULL,
    "case_type" "ModerationCaseType" NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "risk_level" "RiskLevel" NOT NULL DEFAULT 'LOW',
    "status" "ModerationCaseStatus" NOT NULL DEFAULT 'OPEN',
    "assigned_to" UUID,
    "resolution" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMP(3),

    CONSTRAINT "moderation_cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" UUID NOT NULL,
    "reporter_id" UUID,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "reason" "ReportReason" NOT NULL,
    "description" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'OPEN',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "strikes" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "reason" TEXT NOT NULL,
    "severity" "StrikeSeverity" NOT NULL DEFAULT 'LOW',
    "related_case_id" UUID,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "strikes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "actor_id" UUID,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "before_json" JSONB,
    "after_json" JSONB,
    "metadata_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "copyright_declarations_product_id_idx" ON "copyright_declarations"("product_id");

-- CreateIndex
CREATE INDEX "moderation_cases_status_case_type_idx" ON "moderation_cases"("status", "case_type");

-- CreateIndex
CREATE INDEX "moderation_cases_entity_type_entity_id_idx" ON "moderation_cases"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "reports_status_idx" ON "reports"("status");

-- CreateIndex
CREATE INDEX "strikes_user_id_idx" ON "strikes"("user_id");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "audit_logs_actor_id_idx" ON "audit_logs"("actor_id");

-- AddForeignKey
ALTER TABLE "strikes" ADD CONSTRAINT "strikes_related_case_id_fkey" FOREIGN KEY ("related_case_id") REFERENCES "moderation_cases"("id") ON DELETE SET NULL ON UPDATE CASCADE;
