import { prisma } from "@/lib/prisma";
export const bundleSavings = (regularPrice: number, bundlePrice: number) => Math.max(0, Math.round((regularPrice - bundlePrice) * 100) / 100);

export async function createBundle(creatorId: string, title: string, description: string, price: number, productIds: string[]) {
  const ids = [...new Set(productIds)];
  const products = await prisma.product.findMany({ where: { id: { in: ids }, creatorId, status: "PUBLISHED", visibility: "PUBLIC", deletedAt: null }, select: { id: true } });
  if (title.trim().length < 3 || price < 0 || products.length < 2 || products.length !== ids.length) throw new Error("INVALID_BUNDLE");
  const base = title.toLowerCase().trim().replace(/[\s_]+/g, "-").replace(/[^\p{L}\p{N}-]+/gu, "").slice(0, 60) || "bundle";
  let slug = base; let n = 2; while (await prisma.bundle.findUnique({ where: { slug } })) slug = `${base}-${n++}`;
  return prisma.bundle.create({ data: { creatorId, title: title.trim(), description: description.trim() || null, price, slug, status: "PUBLISHED", visibility: "PUBLIC", publishedAt: new Date(), items: { create: products.map((product, index) => ({ productId: product.id, sortOrder: index })) } } });
}

export async function getPublicBundle(slug: string) {
  return prisma.bundle.findFirst({ where: { slug, status: "PUBLISHED", visibility: "PUBLIC" }, include: { creator: true, items: { orderBy: { sortOrder: "asc" }, include: { product: { include: { subject: true, grade: true } } } } } });
}

export async function addBundleToCart(userId: string, bundleId: string) {
  const bundle = await prisma.bundle.findFirst({ where: { id: bundleId, status: "PUBLISHED", visibility: "PUBLIC" }, include: { items: true } });
  if (!bundle || bundle.items.length < 2) throw new Error("BUNDLE_NOT_AVAILABLE");
  const owner = await prisma.creatorProfile.findUnique({ where: { userId } });
  if (owner?.id === bundle.creatorId) throw new Error("OWN_PRODUCT");
  const owned = await prisma.entitlement.count({ where: { buyerId: userId, productId: { in: bundle.items.map((item) => item.productId) }, revokedAt: null } });
  if (owned) throw new Error("ALREADY_OWNED");
  const cart = await prisma.cart.upsert({ where: { userId }, update: {}, create: { userId } });
  await prisma.cartItem.upsert({ where: { bundleId }, update: {}, create: { cartId: cart.id, bundleId } });
}
