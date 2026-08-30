-- CreateEnum
CREATE TYPE "AiJobStatus" AS ENUM ('QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AiTaskType" AS ENUM ('PRODUCT_METADATA', 'PRODUCT_SEO', 'PRODUCT_QUALITY', 'SUPPORT', 'MODERATION_ASSIST', 'SEARCH_ASSIST', 'DEMAND_ANALYSIS', 'CREATOR_ASSIST');

-- CreateTable
CREATE TABLE "ai_jobs" (
    "id" UUID NOT NULL,
    "task_type" "AiTaskType" NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "user_id" UUID,
    "provider" TEXT NOT NULL DEFAULT 'gemini',
    "model" TEXT NOT NULL,
    "prompt_version" TEXT NOT NULL,
    "input_hash" TEXT NOT NULL,
    "status" "AiJobStatus" NOT NULL DEFAULT 'QUEUED',
    "confidence" DOUBLE PRECISION,
    "output_json" JSONB,
    "error" TEXT,
    "input_tokens" INTEGER,
    "output_tokens" INTEGER,
    "estimated_cost" DECIMAL(12,8) NOT NULL DEFAULT 0,
    "latency_ms" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "ai_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ai_jobs_input_hash_status_idx" ON "ai_jobs"("input_hash", "status");

-- CreateIndex
CREATE INDEX "ai_jobs_task_type_created_at_idx" ON "ai_jobs"("task_type", "created_at");
