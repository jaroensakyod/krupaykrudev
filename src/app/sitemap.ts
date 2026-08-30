import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

// TASK-069: sitemap — เฉพาะหน้าที่มี inventory จริง (PRD §59: ห้าม thin pages)
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3210";

  const [products, creators] = await Promise.all([
    prisma.product.findMany({
      where: { status: "PUBLISHED", visibility: "PUBLIC", deletedAt: null },
      select: { slug: true, updatedAt: true },
    }),
    prisma.creatorProfile.findMany({
      where: { deletedAt: null },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  return [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/search`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/categories`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/sell`, changeFrequency: "monthly", priority: 0.6 },
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
  ];
}
