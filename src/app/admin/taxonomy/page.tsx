import { MaterialIcon } from "@/components/material-icon";
import { requirePermission } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { taxonomyAction } from "./actions";
import { TaxonomyAddForm, TaxonomyToggleForm } from "./actions-ui";

export const metadata = { title: "Taxonomy Manager" };

// TASK-118: taxonomy manager — เพิ่ม/ปิดใช้งาน subjects, grades, types, exams, curricula
export default async function TaxonomyPage({
  searchParams,
}: {
  searchParams: Promise<{ done?: string }>;
}) {
  await requirePermission("taxonomy:manage");
  const { done } = await searchParams;

  const [subjects, grades, types, exams, curricula] = await Promise.all([
    prisma.subject.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.grade.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.productType.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.exam.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.curriculum.findMany({ orderBy: { id: "asc" } }),
  ]);

  const sections = [
    { key: "subject", label: "กลุ่มสาระ (Subjects)", rows: subjects },
    { key: "grade", label: "ระดับชั้น (Grades)", rows: grades },
    { key: "type", label: "ประเภทสื่อ (Types)", rows: types },
    { key: "exam", label: "การสอบ (Exams)", rows: exams },
  ] as const;

  return (
    <div>
      <h1 className="font-headline text-2xl font-bold mb-1">Taxonomy Manager</h1>
      <p className="text-sm text-text-muted mb-8">
        เพิ่มหมวดหมู่ใหม่หรือปิดใช้งาน — UI ทั้งเว็บอ่านจากตารางเหล่านี้เสมอ (PRD §10-11)
      </p>
      {done && <p className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">บันทึกแล้ว</p>}

      <div className="space-y-8">
        {sections.map((sec) => (
          <div key={sec.key} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-headline font-bold text-lg mb-4">{sec.label}</h2>

            {/* เพิ่มใหม่ */}
            <TaxonomyAddForm action={taxonomyAction} kind={sec.key} />

            <div className="mt-4 space-y-2">
              {sec.rows.map((row) => (
                <div key={row.id} className="flex items-center gap-3 text-sm">
                  <span className="font-mono text-xs text-text-muted w-28 shrink-0">{row.code}</span>
                  <span className={`flex-1 ${row.isActive ? "" : "text-gray-400 line-through"}`}>{row.nameTh}</span>
                  <TaxonomyToggleForm action={taxonomyAction} kind={sec.key} id={row.id} active={row.isActive} />
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Curricula (เพิ่มได้อย่างเดียว V1) */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-headline font-bold text-lg mb-4">หลักสูตร (Curricula)</h2>
          <ul className="text-sm list-disc pl-5 space-y-1">
            {curricula.map((c) => (
              <li key={c.id}>{c.nameTh}</li>
            ))}
          </ul>
        </div>

        {/* Topics overview (อ่านอย่างเดียว V1 — จัดลำดับชั้นผ่าน seed) */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-headline font-bold text-lg mb-4 flex items-center gap-2">
            หัวข้อ (Topics)
            <span className="text-xs text-text-muted font-normal">ลำดับชั้น — จัดการแบบละเอียดในเฟสถัดไป</span>
          </h2>
          <TopicsOverview />
        </div>
      </div>
    </div>
  );
}

async function TopicsOverview() {
  const topics = await prisma.topic.findMany({
    where: { parentId: null },
    include: { subject: true, children: true },
    orderBy: { sortOrder: "asc" },
  });
  if (topics.length === 0) return <p className="text-sm text-text-muted">ยังไม่มีข้อมูลหัวข้อ</p>;
  return (
    <div className="space-y-3 text-sm">
      {topics.map((t) => (
        <div key={t.id}>
          <span className="font-medium">
            {t.subject.nameTh} › {t.nameTh}
          </span>
          {t.children.length > 0 && (
            <span className="text-text-muted"> ({t.children.map((c) => c.nameTh).join(", ")})</span>
          )}
        </div>
      ))}
    </div>
  );
}
