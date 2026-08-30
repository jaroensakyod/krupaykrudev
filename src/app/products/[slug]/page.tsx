import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MaterialIcon } from "@/components/material-icon";
import { getPublishedProduct, getRelatedProducts, coverUrlOf } from "@/lib/catalog";
import { ProductGridCard } from "@/components/product-grid-card";
import { addToCartAction } from "@/app/cart/actions";
import { trackEvent } from "@/lib/analytics";
import { getSession } from "@/lib/session";

// TASK-061: product detail page (PRD §32) — ห้าม expose original storage URL
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
  const product = await getPublishedProduct(slug);
  if (!product) return { title: "ไม่พบสินค้า" };
  return {
    title: product.title,
    description: product.shortDescription ?? product.description?.slice(0, 160) ?? undefined,
    alternates: { canonical: `/products/${product.slug}` }, // TASK-068
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
  const product = await getPublishedProduct(slug);
  if (!product) notFound();

  // TASK-104
  const viewSession = await getSession();
  void trackEvent({ eventType: "PRODUCT_VIEW", userId: viewSession?.user?.id, productId: product.id, creatorId: product.creatorId });
  const related = await getRelatedProducts(product.id, product.subjectId, product.primaryGradeId);
  const cover = coverUrlOf(product);
  const mainFile = product.files.find((f) => f.fileRole === "ORIGINAL");

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <nav className="text-sm text-text-muted mb-6 flex items-center gap-1.5">
        <Link href="/" className="hover:text-primary">หน้าแรก</Link>
        <MaterialIcon name="chevron_right" className="text-base" />
        <Link href={`/search?subject=${product.subject.code}`} className="hover:text-primary">
          {product.subject.nameTh}
        </Link>
        <MaterialIcon name="chevron_right" className="text-base" />
        <span className="truncate">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-10">
        {/* Preview */}
        <div>
          <div className="aspect-[4/3] rounded-2xl bg-gray-100 border border-gray-100 overflow-hidden shadow-sm">
            {cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img alt={product.title} src={cover} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <MaterialIcon name="image" className="text-6xl text-gray-300" />
              </div>
            )}
          </div>
          <p className="mt-3 text-xs text-text-muted flex items-center gap-1.5">
            <MaterialIcon name="shield" className="text-sm" />
            ตัวอย่างมีลายน้ำ — ไฟล์ต้นฉบับคุณภาพเต็มจะได้รับหลังชำระเงิน
          </p>
        </div>

        {/* Info */}
        <div>
          <span className="inline-block text-xs px-2.5 py-1 bg-primary-50 text-primary rounded-full mb-3">
            {product.productType.nameTh}
          </span>
          <h1 className="font-headline text-2xl md:text-3xl font-bold leading-snug mb-4">{product.title}</h1>

          {/* Creator */}
          <Link href={`/creator/${product.creator.slug}`} className="flex items-center gap-3 mb-6 group w-fit">
            <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center font-headline font-bold text-primary">
              {product.creator.displayName.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-medium group-hover:text-primary flex items-center gap-1">
                {product.creator.displayName}
                {product.creator.verificationStatus === "VERIFIED" && (
                  <MaterialIcon name="verified" className="text-badge-blue text-sm" filled />
                )}
              </p>
              <p className="text-xs text-text-muted">เข้าชมร้านค้า</p>
            </div>
          </Link>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
            <p className="font-headline text-3xl font-bold text-primary mb-4">
              {product.price.toNumber() === 0 ? "ฟรี" : `฿${product.price.toNumber().toLocaleString()}`}
            </p>
            {mainFile ? (
              <p className="text-xs text-text-muted mb-4">
                ไฟล์: {mainFile.mimeType.replace("application/", "").toUpperCase()} ·{" "}
                {(mainFile.fileSize / 1024 / 1024).toFixed(1)} MB
              </p>
            ) : (
              <p className="text-xs text-amber-700 bg-amber-50 rounded px-2 py-1 mb-4 inline-block">
                ผู้ขายยังไม่แนบไฟล์
              </p>
            )}
            <form action={addToCartAction}>
              <input name="productId" type="hidden" value={product.id} />
              <button
                className="w-full bg-primary hover:bg-primary-dark text-white font-headline font-semibold text-lg py-3.5 rounded-xl transition-colors shadow-md disabled:opacity-50"
                type="submit"
              >
                {product.price.toNumber() === 0 ? "รับฟรี" : "ใส่ตะกร้า"}
              </button>
            </form>
            <p className="mt-3 text-xs text-text-muted text-center">
              ดาวน์โหลดทันทีหลังชำระเงิน · โหลดซ้ำได้ตลอดจากคลังสื่อ
            </p>
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Link href={`/search?subject=${product.subject.code}`} className="px-3 py-1 bg-gray-50 border border-gray-200 rounded-full text-xs hover:border-primary">
              {product.subject.nameTh}
            </Link>
            <Link href={`/search?grade=${product.grade.code}`} className="px-3 py-1 bg-gray-50 border border-gray-200 rounded-full text-xs hover:border-primary">
              {product.grade.nameTh}
            </Link>
            {product.curriculum && (
              <span className="px-3 py-1 bg-gray-50 border border-gray-200 rounded-full text-xs">{product.curriculum.nameTh}</span>
            )}
            {product.tags.map(({ tag }) => (
              <Link key={tag.id} href={`/search?q=${encodeURIComponent(tag.name)}`} className="px-3 py-1 bg-gray-50 border border-gray-200 rounded-full text-xs hover:border-primary">
                #{tag.name}
              </Link>
            ))}
          </div>

          {/* Description */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-headline font-bold mb-3">รายละเอียด</h2>
            <p className="text-sm whitespace-pre-wrap leading-relaxed">
              {product.description || product.shortDescription || "ผู้ขายยังไม่ได้ใส่รายละเอียด"}
            </p>
          </div>
        </div>
      </div>

      {/* Related (TASK-067 rule-based) */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="font-headline text-xl font-bold mb-6">สื่อที่เกี่ยวข้อง</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map((p) => (
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
        </section>
      )}
    </div>
  );
}
