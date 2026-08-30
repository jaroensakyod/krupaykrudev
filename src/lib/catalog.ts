import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { NormalizedQuery } from "./search/normalize";

export type SearchParams = {
  q: string;
  /** คำค้นหลัง normalize (ตัด grade/subject token ออก) — search page ส่งมา */
  cleanedText?: string;
  subjectCode?: string;
  gradeCode?: string;
  typeCode?: string;
  examCode?: string;
  minPrice?: number;
  maxPrice?: number;
  ratingMin?: number; // 4, 3, ... (มีรีวิวเฉลี่ย >= ค่านี้)
  sort?: "relevance" | "new" | "price-asc" | "price-desc";
  page?: number;
};

const PAGE_SIZE = 12;

const relInclude = {
  creator: { select: { displayName: true, slug: true } },
  productType: true,
  subject: true,
  grade: true,
  files: { where: { fileRole: { in: ["ORIGINAL", "COVER"] as const } }, include: { preview: true }, take: 1 },
} satisfies Prisma.ProductInclude;

/** TASK-063/065/066: search + filters + sorting — เฉพาะ PUBLISHED + PUBLIC */
export async function searchProducts(params: SearchParams) {
  const page = Math.max(1, params.page ?? 1);
  const where: Prisma.ProductWhereInput = {
    status: "PUBLISHED",
    visibility: "PUBLIC",
    deletedAt: null,
  };

  if (params.subjectCode) where.subject = { code: params.subjectCode };
  if (params.gradeCode) where.grade = { code: params.gradeCode };
  if (params.typeCode) where.productType = { code: params.typeCode };

  const textQuery = (params.cleanedText ?? params.q).trim();
  if (textQuery) {
    where.OR = [
      { title: { contains: textQuery, mode: "insensitive" } },
      { shortDescription: { contains: textQuery, mode: "insensitive" } },
      { tags: { some: { tag: { name: { contains: textQuery, mode: "insensitive" } } } } },
    ];
  }

  const orderBy: Prisma.ProductOrderByWithRelationInput[] =
    params.sort === "price-asc"
      ? [{ price: "asc" }, { createdAt: "desc" }]
      : params.sort === "price-desc"
        ? [{ price: "desc" }, { createdAt: "desc" }]
        : [{ createdAt: "desc" }]; // "new" / relevance fallback ด้านล่าง

  // §27 Relevance sort: title ตรงมาก่อน แล้วคนอื่น (ใช้ V1 rule-based)
  if (params.sort === "relevance" && textQuery) {
    const products = await prisma.product.findMany({ where: { ...where }, orderBy, take: 48, include: relInclude });
    const titleHit = products.filter((p) => p.title.toLowerCase().includes(textQuery.toLowerCase()));
    const rest = products.filter((p) => !titleHit.includes(p));
    const merged = [...titleHit, ...rest];
    return {
      total: await prisma.product.count({ where }),
      page,
      totalPages: Math.max(1, Math.ceil((await prisma.product.count({ where })) / PAGE_SIZE)),
      products: merged.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    };
  }

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        creator: { select: { displayName: true, slug: true } },
        productType: true,
        subject: true,
        grade: true,
        files: { where: { fileRole: { in: ["ORIGINAL", "COVER"] } }, include: { preview: true }, take: 1 },
      },
    }),
  ]);

  return {
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    products,
  };
}

export type SearchProduct = Awaited<ReturnType<typeof searchProducts>>["products"][number];

/** TASK-067: related products — rule-based (same subject/grade/type + popularity fallback) ไม่ใช้ ML */
export async function getRelatedProducts(productId: string, subjectId: number, primaryGradeId: number, limit = 4) {
  const sameSubjectGrade = await prisma.product.findMany({
    where: {
      id: { not: productId },
      status: "PUBLISHED",
      visibility: "PUBLIC",
      deletedAt: null,
      OR: [{ subjectId }, { primaryGradeId }],
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      creator: { select: { displayName: true, slug: true } },
      productType: true,
      subject: true,
      grade: true,
      files: { where: { fileRole: { in: ["ORIGINAL", "COVER"] } }, include: { preview: true }, take: 1 },
    },
  });
  return sameSubjectGrade;
}

/** TASK-061: public product by slug (published only) */
export async function getPublishedProduct(slug: string) {
  return prisma.product.findFirst({
    where: { slug, status: "PUBLISHED", visibility: "PUBLIC", deletedAt: null },
    include: {
      creator: { select: { displayName: true, slug: true, verificationStatus: true, bio: true } },
      productType: true,
      subject: true,
      grade: true,
      curriculum: true,
      topic: true,
      exam: true,
      tags: { include: { tag: true } },
      files: { include: { preview: true }, orderBy: { createdAt: "asc" } },
    },
  });
}

export function coverUrlOf(product: { files: Array<{ id: string; fileRole: string; preview: { id: string } | null }> }): string | null {
  const withPreview = product.files.find((f) => f.preview);
  return withPreview?.preview ? `/api/files/${withPreview.id}/preview` : null;
}
