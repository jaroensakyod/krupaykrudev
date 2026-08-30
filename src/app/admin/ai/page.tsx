import { requirePermission } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "AI Usage" };

// TASK-119: AI usage dashboard (§112: cost/usage log)
export default async function AdminAiPage() {
  await requirePermission("ai:usage:view");

  const [byTask, recent, failed] = await Promise.all([
    prisma.aiJob.groupBy({
      by: ["taskType"],
      _count: { taskType: true },
      _sum: { inputTokens: true, outputTokens: true, estimatedCost: true },
    }),
    prisma.aiJob.findMany({ orderBy: { createdAt: "desc" }, take: 30 }),
    prisma.aiJob.count({ where: { status: "FAILED" } }),
  ]);

  const totalCost = byTask.reduce((s, t) => s + (t._sum.estimatedCost?.toNumber() ?? 0), 0);
  const totalTokens = byTask.reduce((s, t) => s + (t._sum.inputTokens ?? 0) + (t._sum.outputTokens ?? 0), 0);

  return (
    <div>
      <h1 className="font-headline text-2xl font-bold mb-1">AI Usage</h1>
      <p className="text-sm text-text-muted mb-8">
        ต้นทุนรวมประมาณ <b className="text-primary">${totalCost.toFixed(4)}</b> · {totalTokens.toLocaleString()} tokens · พบากรณ์ล้มเหลว {failed} ครั้ง
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {byTask.map((t) => (
          <div key={t.taskType} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs text-text-muted mb-1">{t.taskType}</p>
            <p className="font-headline text-xl font-bold">{t._count.taskType} calls</p>
            <p className="text-xs text-text-muted">
              ${(t._sum.estimatedCost?.toNumber() ?? 0).toFixed(4)} ·{" "}
              {(t._sum.inputTokens ?? 0).toLocaleString()} in / {(t._sum.outputTokens ?? 0).toLocaleString()} out
            </p>
          </div>
        ))}
      </div>

      <h2 className="font-headline font-bold text-lg mb-3">30 jobs ล่าสุด</h2>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-100 text-sm">
        {recent.map((j) => (
          <div key={j.id} className="p-3 flex flex-wrap items-center gap-3">
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                j.status === "COMPLETED"
                  ? "bg-green-50 text-green-700"
                  : j.status === "FAILED"
                    ? "bg-red-50 text-red-700"
                    : "bg-amber-50 text-amber-700"
              }`}
            >
              {j.status}
            </span>
            <span className="text-xs font-medium">{j.taskType}</span>
            <span className="text-xs text-text-muted">{j.entityType} #{j.entityId.slice(0, 8)}</span>
            <span className="text-xs text-text-muted">{j.model}</span>
            <span className="ml-auto text-xs text-text-muted">
              {j.latencyMs ?? "—"}ms · ${j.estimatedCost.toNumber().toFixed(5)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
