import Link from "next/link";
import { MaterialIcon } from "@/components/material-icon";
import { CATEGORIES, GRADE_LEVELS } from "@/lib/mock/home-data";
import { prisma } from "@/lib/prisma";

// เรนเดอร์ตอน request — หน้าอ่านข้อมูลจาก DB แบบเรียลไทม์
export const dynamic = "force-dynamic";

export const metadata = {
  title: "หมวดหมู่สื่อการสอน",
  description: "เลือกดูสื่อการเรียนการสอนตามหมวดหมู่และระดับชั้น",
  alternates: { canonical: "/categories" },
};

// §58: indexable category page + จำนวนสินค้าจริงต่อหมวด
export default async function CategoriesPage() {
  const subjects = await prisma.subject.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: { where: { status: "PUBLISHED", visibility: "PUBLIC", deletedAt: null } } } } },
  });

  const categoryCounts = new Map<string, number>();
  for (const cat of CATEGORIES) {
    const subject = subjects.find((s) => cat.name.includes(s.nameTh.split(" ")[0]));
    categoryCounts.set(cat.name, subject?._count.products ?? 0);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <nav className="text-sm text-text-muted mb-4">
        <Link href="/" className="hover:text-primary">หน้าแรก</Link> › หมวดหมู่
      </nav>
      <h1 className="font-headline text-3xl font-bold mb-2">หมวดหมู่สื่อการสอน</h1>
      <p className="text-sm text-text-muted mb-10">9 หมวดสื่อ — ครบทุกที่มีครูไทยสร้างมาให้</p>

      {/* Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-14">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.name}
            href={`/search?q=${encodeURIComponent(cat.name)}`}
            className={`rounded-[20px] p-6 relative overflow-hidden group hover:shadow-md transition-shadow h-full min-h-[140px] bg-gradient-to-br ${cat.gradient}`}
          >
            <div className="absolute -right-2 -bottom-2 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-300">
              <MaterialIcon name={cat.icon} style={{ fontSize: "80px" }} />
            </div>
            <div className="flex items-center justify-between mb-1">
              <span className="w-10 h-10 rounded-xl bg-white/70 flex items-center justify-center">
                <MaterialIcon name={cat.icon} className="text-primary text-xl" />
              </span>
              <span className="text-[10px] text-text-muted bg-white/70 px-2 py-0.5 rounded-full">
                {(categoryCounts.get(cat.name) ?? 0).toLocaleString()} รายการ
              </span>
            </div>
            <h2 className={`font-headline font-bold text-lg mb-1 mt-2 ${cat.text}`}>{cat.name}</h2>
            <p className="text-sm text-text-muted">{cat.description}</p>
          </Link>
        ))}
      </div>

      {/* ระดับชั้น */}
      <section>
        <h2 className="font-headline text-2xl font-bold mb-5">เลือกตามระดับชั้น</h2>
        <div className="flex flex-wrap gap-3">
          {GRADE_LEVELS.map((grade) => (
            <Link
              key={grade}
              href={`/search?grade=${encodeURIComponent(grade)}`}
              className="px-6 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-medium hover:border-primary hover:text-primary shadow-sm"
            >
              {grade}
            </Link>
          ))}
        </div>
      </section>

      {/* กลุ่มสาระ (จาก taxonomy) */}
      <section className="mt-14">
        <h2 className="font-headline text-2xl font-bold mb-5">ตามกลุ่มสาระการเรียนรู้</h2>
        <div className="flex flex-wrap gap-3">
          {subjects.map((s) => (
            <Link
              key={s.id}
              href={`/subjects/${s.code}`}
              className="px-5 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-medium hover:border-primary hover:text-primary shadow-sm"
            >
              {s.nameTh} <span className="text-xs text-text-muted">({s._count.products})</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
