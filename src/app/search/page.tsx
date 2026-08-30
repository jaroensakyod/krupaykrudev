import Link from "next/link";
import type { Metadata } from "next";
import { MaterialIcon } from "@/components/material-icon";
import { searchProducts } from "@/lib/catalog";
import { normalizeQuery } from "@/lib/search/normalize";
import { prisma } from "@/lib/prisma";
import { ProductGridCard } from "@/components/product-grid-card";
import { SearchFilters } from "./search-filters";
import { trackSearch, trackEvent } from "@/lib/analytics";
import { getSession } from "@/lib/session";

type Params = {
  q?: string;
  subject?: string;
  grade?: string;
  type?: string;
  exam?: string;
  min?: string;
  max?: string;
  rating?: string;
  sort?: string;
  page?: string;
};

// TASK-063: zero-result search pages = NOINDEX (PRD §59)
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Params>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  if (!q) return { title: "ค้นหาสื่อการสอน" };
  return {
    title: `ค้นหา "${q}"`,
    robots: { index: false }, // search result pages ไม่ index ตาม PRD §59
  };
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<Params> }) {
  const sp = await searchParams;
  const q = sp.q ?? "";
  const norm = normalizeQuery(q);

  const subjectCode = sp.subject ?? norm.subjectCode;
  const gradeCode = sp.grade ?? norm.gradeCode;
  const typeCode = sp.type;
  const examCode = sp.exam;
  const minPrice = sp.min ? Number(sp.min) : undefined;
  const maxPrice = sp.max ? Number(sp.max) : undefined;
  const ratingMin = sp.rating ? Number(sp.rating) : undefined;
  const sort = (sp.sort as "relevance" | "new" | "price-asc" | "price-desc" | undefined) ?? "relevance";
  const page = Number(sp.page ?? "1") || 1;

  const session = await getSession();
  const [result, subjects, grades, types] = await Promise.all([
    searchProducts({
    q,
    cleanedText: norm.cleanedText,
    subjectCode,
    gradeCode,
    typeCode,
    examCode,
    minPrice,
    maxPrice,
    ratingMin,
    sort,
    page,
  }),
    prisma.subject.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    prisma.grade.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    prisma.productType.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
  ]);

  // TASK-102: เก็บทุก search — result_count=0 คือ demand gap signal (PRD §29)
  void trackSearch({
    userId: session?.user?.id,
    rawQuery: q,
    normalizedQuery: norm.cleanedText,
    filters: { subject: subjectCode, grade: gradeCode, type: typeCode },
    resultCount: result.total,
  });
  // TASK-103: impressions
  for (const p of result.products) {
    void trackEvent({ eventType: "PRODUCT_IMPRESSION", userId: session?.user?.id, productId: p.id, creatorId: p.creatorId });
  }

  const activeSubject = subjects.find((s) => s.code === subjectCode);
  const activeGrade = grades.find((g) => g.code === gradeCode);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="font-headline text-2xl font-bold mb-1">
        {q ? `ผลการค้นหา "${q}"` : "สื่อการสอนทั้งหมด"}
      </h1>
      <p className="text-sm text-text-muted mb-8">
        พบ {result.total} รายการ
        {activeSubject ? ` · ${activeSubject.nameTh}` : ""}
        {activeGrade ? ` · ${activeGrade.nameTh}` : ""}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">
        {/* Filters (TASK-065 — collapsible บนมือถือ) */}
        <SearchFilters
          q={q}
          subjects={subjects.map((x) => ({ code: x.code, nameTh: x.nameTh }))}
          grades={grades.map((x) => ({ code: x.code, nameTh: x.nameTh }))}
          types={types.map((x) => ({ code: x.code, nameTh: x.nameTh }))}
          subjectCode={subjectCode}
          gradeCode={gradeCode}
          typeCode={typeCode}
          examCode={examCode}
          minPrice={sp.min}
          maxPrice={sp.max}
          ratingMin={sp.rating}
        />

        {/* Results */}
        <div>
          {/* Sort */}
          <div className="flex gap-2 mb-6 text-sm overflow-x-auto">
            {[
              { key: "new", label: "ใหม่สุด" },
              { key: "price-asc", label: "ราคาต่ำ → สูง" },
              { key: "price-desc", label: "ราคาสูง → ต่ำ" },
            ].map((s) => {
              const params = new URLSearchParams();
              if (q) params.set("q", q);
              if (subjectCode) params.set("subject", subjectCode);
              if (gradeCode) params.set("grade", gradeCode);
              if (typeCode) params.set("type", typeCode);
              params.set("sort", s.key);
              const active = sort === s.key;
              return (
                <Link
                  key={s.key}
                  href={`/search?${params.toString()}`}
                  className={`px-4 py-2 rounded-full whitespace-nowrap border ${
                    active ? "bg-primary text-white border-primary" : "bg-white border-gray-200 hover:border-primary"
                  }`}
                >
                  {s.label}
                </Link>
              );
            })}
          </div>

          {result.products.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
              <MaterialIcon name="search_off" className="text-5xl text-gray-200 mb-4" />
              <p className="font-headline font-medium text-lg mb-1">ไม่พบสื่อที่ตรงกับคำค้นหา</p>
              <p className="text-sm text-text-muted mb-4">ลองคำค้นอื่น หรือล้างตัวกรอง</p>
              <Link href="/search" className="text-primary text-sm font-medium hover:underline">
                ดูสื่อทั้งหมด
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {result.products.map((p) => (
                  <ProductGridCard
                    key={p.id}
                    id={p.slug}
                    title={p.title}
                    coverUrl={
                      p.files.find((f) => f.preview)?.preview
                        ? `/api/files/${p.files.find((f) => f.preview)!.id}/preview`
                        : null
                    }
                    storeName={p.creator.displayName}
                    rating={null}
                    reviewCount={0}
                    price={p.price.toNumber()}
                  />
                ))}
              </div>

              {/* Pagination */}
              {result.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-10">
                  {Array.from({ length: result.totalPages }, (_, i) => i + 1).map((p) => {
                    const params = new URLSearchParams();
                    if (q) params.set("q", q);
                    if (subjectCode) params.set("subject", subjectCode);
                    if (gradeCode) params.set("grade", gradeCode);
                    if (typeCode) params.set("type", typeCode);
                    params.set("sort", sort);
                    params.set("page", String(p));
                    return (
                      <Link
                        key={p}
                        href={`/search?${params.toString()}`}
                        className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm ${
                          p === page ? "bg-primary text-white" : "bg-white border border-gray-200 hover:border-primary"
                        }`}
                      >
                        {p}
                      </Link>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
