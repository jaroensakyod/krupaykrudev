import Link from "next/link";
import { redirect } from "next/navigation";
import { MaterialIcon } from "@/components/material-icon";
import { getSession } from "@/lib/session";
import { listEntitlements } from "@/lib/commerce";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "คลังสื่อของฉัน" };

// TASK-079: downloads page — โหลดซ้ำได้ตลอดตาม entitlement (PRD §57)
export default async function DownloadsPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");
  const entitlements = await listEntitlements(session.user.id);

  // หาไฟล์หลัก (ORIGINAL) ของแต่ละ product สำหรับปุ่มดาวน์โหลด
  const fileMap = new Map<string, string | null>();
  for (const ent of entitlements) {
    const file = await prisma.productFile.findFirst({
      where: { productId: ent.productId, fileRole: "ORIGINAL" },
      orderBy: { createdAt: "asc" },
    });
    fileMap.set(ent.productId, file?.id ?? null);
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="font-headline text-2xl font-bold mb-1">คลังสื่อของฉัน</h1>
      <p className="text-sm text-text-muted mb-8">สื่อที่คุณซื้อแล้ว — ดาวน์โหลดได้ตลอด</p>

      {entitlements.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
          <MaterialIcon name="inventory_2" className="text-5xl text-gray-200 mb-4" />
          <p className="font-headline font-medium text-lg mb-1">ยังไม่มีสื่อในคลัง</p>
          <Link href="/search" className="text-primary text-sm font-medium hover:underline">
            เลือกซื้อสื่อการสอน
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {entitlements.map((ent) => {
            const fileId = fileMap.get(ent.productId);
            return (
              <div key={ent.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                  <MaterialIcon name="download_done" className="text-primary text-xl" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-headline font-medium truncate">{ent.orderItem.title}</p>
                  <p className="text-xs text-text-muted mt-0.5">
                    ซื้อเมื่อ {ent.grantedAt.toLocaleDateString("th-TH")} · ใบอนุญาต: ส่วนบุคคล
                  </p>
                </div>
                {fileId ? (
                  <a
                    href={`/api/files/${fileId}/download`}
                    className="bg-primary text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-primary-dark whitespace-nowrap"
                  >
                    ดาวน์โหลด
                  </a>
                ) : (
                  <span className="text-xs text-text-muted">ไฟล์กำลังจัดเตรียม</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
