import { ProductGridCard } from "@/components/product-grid-card";
import { coverUrlOf, searchProducts } from "@/lib/catalog";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

// §58/§60: indexable taxonomy pages — /grades/{code}
export default async function GradePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const grade = await prisma.grade.findFirst({
    where: { code: decodeURIComponent(slug).toUpperCase(), isActive: true },
  });
  if (!grade) notFound();

  const result = await searchProducts({ q: "", gradeCode: grade.code, sort: "new", page: 1 });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <nav className="text-sm text-text-muted mb-4">
        <Link href="/categories" className="hover:text-primary">หมวดหมู่</Link> › {grade.nameTh}
      </nav>
      <h1 className="font-headline text-3xl font-bold mb-2">สื่อการสอน {grade.nameTh}</h1>
      <p className="text-sm text-text-muted mb-8">พบ {result.total} รายการ</p>

      {result.products.length === 0 ? (
        <p className="text-sm text-text-muted bg-white rounded-xl border border-gray-100 p-10 text-center">
          ยังไม่มีสื่อในระดับชั้นนี้ — <Link href="/search" className="text-primary hover:underline">ดูสื่อทั้งหมด</Link>
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {result.products.map((p) => (
            <ProductGridCard
              key={p.id}
              id={p.slug}
              title={p.title}
              coverUrl={coverUrlOf(p)}
              storeName={p.creator.displayName}
              rating={null}
              reviewCount={0}
              price={p.price.toNumber()}
            />
          ))}
        </div>
      )}
    </div>
  );
}
