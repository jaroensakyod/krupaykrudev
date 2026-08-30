import Link from "next/link";
import { requirePermission } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Audit Log" };

// §54: audit log viewer — ตรวจสอบ critical actions ย้อนหลัง
export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string }>;
}) {
  await requirePermission("audit:view");
  const { action } = await searchParams;

  const logs = await prisma.auditLog.findMany({
    where: action ? { action: { contains: action } } : {},
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <h1 className="font-headline text-2xl font-bold mb-1">Audit Log</h1>
      <p className="text-sm text-text-muted mb-6">การกระทำสำคัญทั้งหมด (moderation/finance/taxonomy/trust)</p>

      <form action="/admin/audit" className="mb-4 flex gap-2">
        <input className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" defaultValue={action} name="action" placeholder="กรองด้วย action เช่น moderation, finance..." type="text" />
        <button className="bg-primary text-white text-sm px-4 rounded-lg" type="submit">
          กรอง
        </button>
      </form>

      {logs.length === 0 ? (
        <p className="text-sm text-text-muted bg-white rounded-xl border border-gray-100 p-8 text-center">ไม่พบรายการ</p>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <div key={log.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-sm">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="font-mono text-xs font-bold text-primary">{log.action}</span>
                <span className="text-xs text-text-muted">
                  {log.entityType} #{log.entityId.slice(0, 8)}
                </span>
                <span className="text-xs text-text-muted ml-auto">
                  actor #{log.actorId?.slice(0, 8) ?? "system"} · {log.createdAt.toLocaleString("th-TH")}
                </span>
              </div>
              {(log.beforeJson || log.afterJson) && (
                <details>
                  <summary className="text-xs text-primary cursor-pointer">before/after</summary>
                  <pre className="mt-1 text-[10px] bg-gray-50 rounded p-2 overflow-x-auto">
                    {JSON.stringify({ before: log.beforeJson, after: log.afterJson, metadata: log.metadataJson }, null, 1)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="mt-6 text-xs text-text-muted">
        ต้องการดูรายการอื่นเพิ่ม? <Link href="/admin/audit" className="text-primary hover:underline">ล้างตัวกรอง</Link>
      </p>
    </div>
  );
}
