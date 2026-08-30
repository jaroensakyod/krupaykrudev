import { createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { GeminiProvider, type AiProvider, type InlineFile } from "./provider";
import { PROMPT_VERSION } from "./tasks";
import type { z } from "zod";

/**
 * TASK-041: AI Gateway — ทุก AI call ต้องผ่านที่นี่เท่านั้น (PRD §22, §70)
 * - cost guard: per-user daily quota + global daily budget
 * - cache: input_hash + task + prompt_version + model (PRD §26)
 * - validation: zod ทุก output (TASK-048)
 * - logging: ai_jobs ทุก call พร้อม token/cost/latency (TASK-043)
 */

const PER_USER_DAILY_LIMIT = 30;
const GLOBAL_DAILY_BUDGET_JOBS = 500;

// ราคาประมาณต่อ 1M tokens (USD) — ใช้ประมาณต้นทุน
const COST_PER_MTOKEN_INPUT = 0.1;
const COST_PER_MTOKEN_OUTPUT = 0.4;

const provider: AiProvider = new GeminiProvider();

export class AiGatewayError extends Error {
  constructor(public code: "QUOTA_EXCEEDED" | "BUDGET_EXCEEDED" | "VALIDATION_FAILED" | "PROVIDER_ERROR" | "AI_DISABLED") {
    super(code);
  }
}

function inputHash(parts: unknown[]): string {
  return createHash("sha256").update(JSON.stringify(parts)).digest("hex");
}

async function checkQuota(userId: string) {
  if (!process.env.GEMINI_API_KEY) throw new AiGatewayError("AI_DISABLED");

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [userCount, globalCount] = await Promise.all([
    prisma.aiJob.count({
      where: { userId, taskType: { in: ["PRODUCT_METADATA", "PRODUCT_SEO", "PRODUCT_QUALITY"] }, createdAt: { gte: startOfDay } },
    }),
    prisma.aiJob.count({
      where: { taskType: { in: ["PRODUCT_METADATA", "PRODUCT_SEO", "PRODUCT_QUALITY"] }, createdAt: { gte: startOfDay } },
    }),
  ]);

  if (userCount >= PER_USER_DAILY_LIMIT) throw new AiGatewayError("QUOTA_EXCEEDED");
  if (globalCount >= GLOBAL_DAILY_BUDGET_JOBS) throw new AiGatewayError("BUDGET_EXCEEDED");
}

export async function runAiTask<T extends z.ZodTypeAny>(params: {
  task: {
    taskType: "PRODUCT_METADATA" | "PRODUCT_SEO" | "PRODUCT_QUALITY";
    schema: T;
    responseSchema: object;
    systemPrompt: string;
    userPrompt: (ctx: never) => string;
  };
  promptContext: unknown;
  files?: InlineFile[];
  entityType: string;
  entityId: string;
  userId: string;
}): Promise<{ output: z.infer<T>; cached: boolean; confidence: number | null }> {
  const { task } = params;
  const iHash = inputHash([task.taskType, params.promptContext, PROMPT_VERSION]);

  // Cache — ห้าม regenerate สิ่งเดิมโดยไม่จำเป็น (PRD §26)
  const cached = await prisma.aiJob.findFirst({
    where: { inputHash: iHash, taskType: task.taskType, status: "COMPLETED", promptVersion: PROMPT_VERSION },
    orderBy: { createdAt: "desc" },
  });
  if (cached?.outputJson) {
    const parsed = task.schema.safeParse(cached.outputJson);
    if (parsed.success) {
      return { output: parsed.data, cached: true, confidence: cached.confidence };
    }
  }

  await checkQuota(params.userId);

  const job = await prisma.aiJob.create({
    data: {
      taskType: task.taskType,
      entityType: params.entityType,
      entityId: params.entityId,
      userId: params.userId,
      provider: provider.name,
      model: process.env.GEMINI_MODEL ?? "gemini-3.6-flash",
      promptVersion: PROMPT_VERSION,
      inputHash: iHash,
      status: "PROCESSING",
    },
  });

  try {
    const result = await provider.generateStructured({
      systemPrompt: task.systemPrompt,
      userPrompt: (task.userPrompt as (ctx: never) => string)(params.promptContext as never),
      files: params.files,
      model: process.env.GEMINI_MODEL ?? "gemini-3.6-flash",
      responseSchema: task.responseSchema,
    });

    const parsed = task.schema.safeParse(result.output);
    if (!parsed.success) {
      await prisma.aiJob.update({
        where: { id: job.id },
        data: {
          status: "FAILED",
          error: `VALIDATION: ${parsed.error.issues.map((i) => i.path.join(".")).join(",").slice(0, 200)}`,
          inputTokens: result.inputTokens,
          outputTokens: result.outputTokens,
          latencyMs: result.latencyMs,
          completedAt: new Date(),
        },
      });
      throw new AiGatewayError("VALIDATION_FAILED");
    }

    const cost =
      (result.inputTokens / 1_000_000) * COST_PER_MTOKEN_INPUT +
      (result.outputTokens / 1_000_000) * COST_PER_MTOKEN_OUTPUT;

    await prisma.aiJob.update({
      where: { id: job.id },
      data: {
        status: "COMPLETED",
        outputJson: parsed.data as object,
        confidence: (parsed.data as { confidence?: number }).confidence ?? null,
        inputTokens: result.inputTokens,
        outputTokens: result.outputTokens,
        estimatedCost: cost,
        latencyMs: result.latencyMs,
        completedAt: new Date(),
      },
    });

    logger.info("ai_job_completed", { jobId: job.id, task: task.taskType, latencyMs: result.latencyMs, cached: false });
    return { output: parsed.data, cached: false, confidence: (parsed.data as { confidence?: number }).confidence ?? null };
  } catch (error) {
    if (error instanceof AiGatewayError) {
      await prisma.aiJob.update({ where: { id: job.id }, data: { status: "FAILED", error: error.code, completedAt: new Date() } }).catch(() => {});
      throw error;
    }
    logger.error("ai_job_failed", { jobId: job.id, error: String(error).slice(0, 200) });
    await prisma.aiJob
      .update({ where: { id: job.id }, data: { status: "FAILED", error: String(error).slice(0, 300), completedAt: new Date() } })
      .catch(() => {});
    throw new AiGatewayError("PROVIDER_ERROR");
  }
}
