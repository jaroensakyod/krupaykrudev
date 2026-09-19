import Link from "next/link";
import { MaterialIcon } from "@/components/material-icon";
import { ProductGridCard } from "@/components/product-grid-card";
import { coverUrlOf, getRatingsMap } from "@/lib/catalog";
import { prisma } from "@/lib/prisma";

// เรนเดอร์ตอน request — หน้าอ่านข้อมูลจาก DB แบบเรียลไทม์
export const dynamic = "force-dynamic";

// หน้าแรก — layout ตาม design เป้าหมาย (hero + right rail) · สถิติ/ยอดขายจาก DB จริง
// ไม่แสดงสถิติปลอมหรือ feature ที่ยังไม่มี (บทเรียนจาก KruPass banner)
export default async function HomePage() {
  const [latest, productCount, creatorCount, downloadCount, topCreators, subjects, grades] =
    await Promise.all([
      prisma.product.findMany({
        where: { status: "PUBLISHED", visibility: "PUBLIC", deletedAt: null },
        orderBy: { publishedAt: "desc" },
        take: 8,
        include: {
          creator: { select: { displayName: true, slug: true } },
          productType: true,
          subject: true,
          grade: true,
          files: { where: { fileRole: { in: ["ORIGINAL", "COVER"] } }, include: { preview: true }, take: 1 },
        },
      }),
      prisma.product.count({ where: { status: "PUBLISHED", visibility: "PUBLIC", deletedAt: null } }),
      prisma.creatorProfile.count({ where: { deletedAt: null } }),
      prisma.downloadEvent.count(),
      prisma.ledgerEntry.groupBy({
        by: ["accountId"],
        where: { accountType: "CREATOR", entryType: "CREATOR_EARNING" },
        _count: { accountId: true },
        _sum: { amount: true },
        orderBy: { _sum: { amount: "desc" } },
        take: 6,
      }),
      prisma.subject.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" }, take: 8, select: { code: true, nameTh: true } }),
      prisma.grade.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" }, select: { code: true, nameTh: true } }),
    ]);

  // ครูยอดนิยมจากยอดขายจริง (จำนวนรายการรับเงิน)
  const creatorIds = topCreators.map((t) => t.accountId);
  const creatorProfiles = creatorIds.length
    ? await prisma.creatorProfile.findMany({
        where: { userId: { in: creatorIds }, deletedAt: null },
        select: { userId: true, displayName: true, slug: true },
      })
    : [];
  const salesByUser = new Map(topCreators.map((t) => [t.accountId, t._count.accountId]));
  const popularCreators = creatorProfiles
    .map((c) => ({ ...c, sales: salesByUser.get(c.userId) ?? 0 }))
    .sort((a, b) => b.sales - a.sales);

  const ratings = await getRatingsMap(latest.map((p) => p.id));

  const stats = [
    { icon: "description", label: "สื่อการสอน", value: productCount.toLocaleString() + " ชิ้น" },
    { icon: "school", label: "ครูผู้ขาย", value: creatorCount.toLocaleString() + " คน" },
    { icon: "download", label: "ดาวน์โหลด", value: downloadCount.toLocaleString() + " ครั้ง" },
  ];

  return (
    <>
      {/* Hero + Right Rail */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* Left: hero banner */}
          <div className="bg-gradient-to-br from-primary-50 via-white to-accent/10 rounded-2xl border border-gray-100 p-8 md:p-10 flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1 space-y-5">
              <h1 className="font-headline text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-text-main">
                แหล่งรวมสื่อการศึกษา
                <span className="text-primary">สำหรับผู้สอนและผู้สร้างไทย</span>
              </h1>
              <p className="text-base md:text-lg text-text-muted">
                ซื้อ-ขายใบงาน ชุดเรียน และสื่อดิจิทัลสำหรับอนุบาลถึง ม.6 ค้นหาง่าย และ AI ช่วยผู้สร้างจัดเตรียมสินค้า
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/search"
                  className="bg-primary text-white px-6 py-3 rounded-full font-headline font-semibold hover:bg-primary-dark shadow-md"
                >
                  ค้นหาสื่อการสอน
                </Link>
                <Link
                  href="/sell"
                  className="border-2 border-primary text-primary px-6 py-3 rounded-full font-headline font-semibold hover:bg-primary/5"
                >
                  เริ่มขายสื่อของคุณ
                </Link>
              </div>
              {/* สถิติจริงจากระบบ */}
              <div className="flex flex-wrap gap-x-6 gap-y-3 pt-2">
                {stats.map((s) => (
                  <span key={s.label} className="flex items-center gap-1.5 text-sm text-text-muted">
                    <MaterialIcon name={s.icon} className="text-primary text-lg" />
                    <b className="text-text-main">{s.value}</b> {s.label}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {subjects.slice(0, 5).map((subject) => (
                  <Link
                    key={subject.code}
                    href={`/search?q=${encodeURIComponent(subject.nameTh)}`}
                    className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs text-text-muted hover:border-primary hover:text-primary shadow-sm"
                  >
                    {subject.nameTh}
                  </Link>
                ))}
              </div>
            </div>
            <div className="w-full md:w-64 lg:w-72 shrink-0">
              <div className="rounded-2xl overflow-hidden shadow-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img alt="ครูไทยกับสื่อการสอน" src="/images/hero-illustration.png" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>

          {/* Right rail */}
          <div className="space-y-6">
            {/* AI ผู้ช่วยครีเอเตอร์ */}
            <div className="bg-primary-50 border border-primary-100 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <MaterialIcon name="auto_awesome" className="text-primary" filled />
                <h2 className="font-headline font-bold">AI ผู้ช่วยครีเอเตอร์</h2>
                <span className="text-[10px] bg-accent text-white font-bold px-1.5 rounded">ใหม่</span>
              </div>
              <p className="text-xs text-text-muted mb-3">
                อัปโหลดไฟล์แล้ว AI วิเคราะห์เนื้อหาเพื่อกรอกข้อมูลให้
              </p>
              <Link
                href="/sell"
                className="inline-block bg-primary text-white text-sm font-medium px-5 py-2 rounded-full hover:bg-primary-dark"
              >
                ลองใช้ฟรี
              </Link>
            </div>

            {/* หมวดหมู่ยอดนิยม */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-headline font-bold text-sm">หมวดหมู่ยอดนิยม</h2>
                <Link href="/categories" className="text-xs text-primary hover:underline">
                  ดูทั้งหมด
                </Link>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {subjects.map((subject) => (
                  <Link
                    key={subject.code}
                    href={`/search?q=${encodeURIComponent(subject.nameTh)}`}
                    className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-primary-50 transition-colors text-center"
                  >
                    <span className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                      <MaterialIcon name="auto_stories" className="text-primary text-xl" />
                    </span>
                    <span className="text-[10px] leading-tight text-gray-600">{subject.nameTh}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* สนใจขาย CTA */}
            <div className="bg-accent/10 border border-accent/30 rounded-2xl p-5">
              <h2 className="font-headline font-bold mb-1">สนใจขายสื่อการสอน?</h2>
              <p className="text-xs text-text-muted mb-3">
                เปิดร้านฟรี ไม่มีค่ารายเดือน — หักเฉพาะเมื่อขายได้
              </p>
              <Link
                href="/sell"
                className="inline-block bg-accent text-white text-sm font-medium px-5 py-2 rounded-full hover:bg-accent/90"
              >
                เปิดร้านค้า
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ระดับชั้น */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <h2 className="font-headline text-2xl font-bold mb-5 text-text-main">เลือกตามระดับชั้น</h2>
        <div className="flex overflow-x-auto pb-3 gap-3">
          {grades.map((grade) => (
            <Link
              key={grade.code}
              href={`/search?grade=${encodeURIComponent(grade.code)}`}
              className="flex-shrink-0 px-6 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-medium hover:border-primary hover:text-primary shadow-sm whitespace-nowrap"
            >
              {grade.nameTh}
            </Link>
          ))}
        </div>
      </section>

      {/* สินค้าใหม่ล่าสุด */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="font-headline text-2xl md:text-3xl font-bold text-text-main mb-1">สินค้าใหม่ล่าสุด</h2>
            <p className="text-text-muted text-sm">อัปเดตสื่อการสอนสดใหม่ทุกวัน สนับสนุนครูผู้สร้างสรรค์</p>
          </div>
          <Link href="/search?sort=new" className="text-primary font-medium hover:underline text-sm flex items-center">
            ดูทั้งหมด <MaterialIcon name="arrow_forward" className="text-sm ml-1" />
          </Link>
        </div>
        {latest.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
            <MaterialIcon name="inventory_2" className="text-5xl text-gray-200 mb-4" />
            <p className="text-sm text-text-muted">ยังไม่มีสื่อที่เผยแพร่ — เร็ว ๆ นี้</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {latest.map((p) => (
                <ProductGridCard
                  key={p.id}
                  id={p.slug}
                  title={p.title}
                  coverUrl={coverUrlOf(p)}
                  storeName={p.creator.displayName}
                  rating={null}
                  reviewCount={0}
                  price={p.price.toNumber()}
                  badge="ใหม่"
                />
            ))}
          </div>
        )}
      </section>

      {/* ครูยอดนิยม (จากยอดขายจริง) */}
      {popularCreators.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 mb-12">
          <h2 className="font-headline text-2xl font-bold mb-6 text-text-main text-center">ครูยอดนิยม</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {popularCreators.map((c, i) => (
              <Link
                key={c.slug}
                href={`/creator/${c.slug}`}
                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-md transition-shadow"
              >
                <div className="relative mb-3">
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center font-headline font-bold text-2xl border-4 ${
                      i < 2 ? "bg-amber-50 text-badge-gold border-amber-100" : "bg-primary-50 text-primary border-primary-100"
                    }`}
                  >
                    {c.displayName.charAt(0)}
                  </div>
                  <div className="absolute -bottom-1 right-0 bg-white rounded-full shadow-sm">
                    <MaterialIcon name="workspace_premium" className="text-badge-gold text-sm" filled />
                  </div>
                </div>
                <p className="font-headline font-bold text-sm truncate w-full">{c.displayName}</p>
                <p className="text-[11px] text-text-muted mt-1">ยอดขาย {c.sales} รายการ</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
