import { MaterialIcon } from "@/components/material-icon";
import { requirePermission } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "รายงานปัญหา" };

const REASON_LABEL: Record<string, string> = {
  COPYRIGHT: "ละเมิดลิขสิทธิ์",
  MISLEADING: "ข้อมูลหลอกลวง",
  BROKEN_FILE: "ไฟล์เสีย",
  INAPPROPRIATE: "เนื้อหาไม่เหมาะสม",
  SPAM: "สแปม",
  DUPLICATE: "สินค้าซ้ำ",
  OTHER: "อื่น ๆ",
};

// TASK-055: report queue — ผู้ใช้แจ้งรายงานจากหน้าสินค้า (เชื่อมใน Phase 6)
export default async function AdminReportsPage() {
  await requirePermission("moderation:review");
  const reports = await prisma.report.findMany({
    where: { status: { in: ["OPEN", "REVIEWING"] } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="font-headline text-2xl font-bold mb-1">รายงานปัญหา</h1>
      <p className="text-sm text-text-muted mb-8">รายงานที่รอการตรวจสอบ ({reports.length} รายการ)</p>

      {reports.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
          <MaterialIcon name="flag" className="text-5xl text-gray-200 mb-4" />
          <p className="font-headline font-medium text-lg">ไม่มีรายงานเปิดอยู่</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <div key={report.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{REASON_LABEL[report.reason] ?? report.reason}</span>
                <span className="text-xs text-text-muted">
                  {report.entityType} #{report.entityId.slice(0, 8)}
                </span>
              </div>
              {report.description && <p className="text-sm text-text-muted mt-2">{report.description}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
