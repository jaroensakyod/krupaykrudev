import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

// TASK-069: sitemap — เฉพาะหน้าที่มี inventory จริง (PRD §59: ห้าม thin pages)
// สร้างตอน request (ไม่ใช่ตอน build) + ทนต่อ DB ล่ม เพื่อไม่ให้ deploy พัง
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://krupaykru.com";

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/search`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/categories`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/sell`, changeFrequency: "monthly", priority: 0.6 },
  ];

  try {
    const [products, creators, grades, subjects] = await Promise.all([
      prisma.product.findMany({
        where: { status: "PUBLISHED", visibility: "PUBLIC", deletedAt: null },
        select: { slug: true, updatedAt: true },
      }),
      prisma.creatorProfile.findMany({
        where: { deletedAt: null },
        select: { slug: true, updatedAt: true },
      }),
      prisma.grade.findMany({ where: { isActive: true }, select: { code: true } }),
      prisma.subject.findMany({ where: { isActive: true }, select: { code: true } }),
    ]);

    // /learn/{grade}/{subject} — เฉพาะคู่ที่มีสินค้าจริง (ไม่สร้าง thin pages)
    const counts = await prisma.product.groupBy({
      by: ["primaryGradeId", "subjectId"],
      where: { status: "PUBLISHED", visibility: "PUBLIC", deletedAt: null },
      _count: { id: true },
    });
    const gradeById = new Map(
      (await prisma.grade.findMany({ select: { id: true, code: true } })).map((g) => [g.id, g.code]),
    );
    const subjectById = new Map(
      (await prisma.subject.findMany({ select: { id: true, code: true } })).map((s) => [s.id, s.code]),
    );
    const landingPages: MetadataRoute.Sitemap = counts
      .filter((c) => c._count.id > 0 && gradeById.has(c.primaryGradeId) && subjectById.has(c.subjectId))
      .map((c) => ({
        url: `${base}/learn/${gradeById.get(c.primaryGradeId)}/${subjectById.get(c.subjectId)}`,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }));

    return [
      ...staticRoutes,
      ...products.map((p) => ({
        url: `${base}/products/${p.slug}`,
        lastModified: p.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
      ...creators.map((c) => ({
        url: `${base}/creator/${c.slug}`,
        lastModified: c.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.5,
      })),
      ...landingPages,
    ];
  } catch {
    // DB ยังไม่พร้อม (เช่น build ไม่มี DATABASE_URL) — คืนเฉพาะหน้า static
    return staticRoutes;
  }
}
