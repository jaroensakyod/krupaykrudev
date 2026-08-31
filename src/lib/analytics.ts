import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { logger } from "@/lib/logger";
import { cookies } from "next/headers";

/**
 * TASK-100: analytics event service — fire-and-forget, ไม่เด้ง UI ถ้าเก็บพลาด
 * Analytics ไม่ใส่ email/phone/payment info (PRD §67)
 */

export async function getSessionId(): Promise<string | null> {
  try {
    const store = await cookies();
    return store.get("kp_sid")?.value ?? null;
  } catch {
    return null;
  }
}

export async function trackSearch(input: {
  userId?: string | null;
  rawQuery: string;
  normalizedQuery: string;
  filters?: Record<string, unknown>;
  resultCount: number;
}) {
  const sessionId = await getSessionId();
  try {
    await prisma.searchEvent.create({
      data: {
        sessionId: sessionId ?? "anonymous",
        userId: input.userId ?? null,
        rawQuery: input.rawQuery,
        normalizedQuery: input.normalizedQuery,
        filtersJson: input.filters && Object.keys(input.filters).length ? (input.filters as Prisma.InputJsonValue) : undefined,
        resultCount: input.resultCount, // 0 = demand gap signal เก็บเสมอ (PRD §29)
      },
    });
  } catch (e) {
    logger.warn("search_event_failed", { error: String(e).slice(0, 100) });
  }
}

export async function trackEvent(input: {
  eventType:
    | "PRODUCT_IMPRESSION"
    | "PRODUCT_VIEW"
    | "ADD_TO_CART"
    | "REMOVE_FROM_CART"
    | "CHECKOUT_START"
    | "PURCHASE"
    | "DOWNLOAD"
    | "REVIEW_SUBMIT"
    | "WISHLIST_ADD"
    | "PREVIEW_OPEN"
    | "BUNDLE_VIEW"
    | "BUNDLE_ADD_TO_CART"
    | "FOLLOW_CREATOR"
    | "FOLLOW_TOPIC"
    | "REFERRAL_SIGNUP"
    | "REFERRAL_CONVERSION"
    | "CAMPAIGN_VIEW";
  userId?: string | null;
  productId?: string | null;
  creatorId?: string | null;
  properties?: Record<string, unknown>;
  source?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
}) {
  const sessionId = await getSessionId();
  try {
    await prisma.analyticsEvent.create({
      data: {
        eventType: input.eventType,
        sessionId: sessionId ?? "anonymous",
        userId: input.userId ?? null,
        productId: input.productId ?? null,
        creatorId: input.creatorId ?? null,
        properties: input.properties ? (input.properties as Prisma.InputJsonValue) : undefined,
        source: input.source ?? null,
        utmSource: input.utmSource ?? null,
        utmMedium: input.utmMedium ?? null,
        utmCampaign: input.utmCampaign ?? null,
      },
    });
  } catch (e) {
    logger.warn("analytics_event_failed", { error: String(e).slice(0, 100) });
  }
}

/** TASK-108: สรุปยอดต่อ creator จาก events */
export async function getCreatorAnalytics(creatorId: string) {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [impressions, views, addToCarts, purchases] = await Promise.all([
    prisma.analyticsEvent.count({ where: { creatorId, eventType: "PRODUCT_IMPRESSION", createdAt: { gte: since } } }),
    prisma.analyticsEvent.count({ where: { creatorId, eventType: "PRODUCT_VIEW", createdAt: { gte: since } } }),
    prisma.analyticsEvent.count({ where: { creatorId, eventType: "ADD_TO_CART", createdAt: { gte: since } } }),
    prisma.analyticsEvent.count({ where: { creatorId, eventType: "PURCHASE", createdAt: { gte: since } } }),
  ]);
  const topProducts = await prisma.analyticsEvent.groupBy({
    by: ["productId"],
    where: { creatorId, eventType: "PRODUCT_VIEW", createdAt: { gte: since }, productId: { not: null } },
    _count: { productId: true },
    orderBy: { _count: { productId: "desc" } },
    take: 5,
  });
  const productNames = new Map<string, string>();
  if (topProducts.length) {
    const products = await prisma.product.findMany({
      where: { id: { in: topProducts.map((t) => t.productId!) } },
      select: { id: true, title: true },
    });
    for (const p of products) productNames.set(p.id, p.title);
  }
  return {
    impressions,
    views,
    addToCarts,
    purchases,
    conversion: views > 0 ? Math.round((purchases / views) * 1000) / 10 : 0,
    topProducts: topProducts.map((t) => ({
      productId: t.productId!,
      title: productNames.get(t.productId!) ?? "(ลบแล้ว)",
      views: t._count.productId,
    })),
  };
}

/** TASK-109: funnel ภาพรวมสำหรับ founder */
export async function getFunnelOverview() {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [searches, zeroResults, impressions, views, addToCarts, checkoutStarts, purchases, sources, users, creators, publishedProducts, refunded] = await Promise.all([
    prisma.searchEvent.count({ where: { createdAt: { gte: since } } }),
    prisma.searchEvent.count({ where: { createdAt: { gte: since }, resultCount: 0 } }),
    prisma.analyticsEvent.count({ where: { eventType: "PRODUCT_IMPRESSION", createdAt: { gte: since } } }),
    prisma.analyticsEvent.count({ where: { eventType: "PRODUCT_VIEW", createdAt: { gte: since } } }),
    prisma.analyticsEvent.count({ where: { eventType: "ADD_TO_CART", createdAt: { gte: since } } }),
    prisma.analyticsEvent.count({ where: { eventType: "CHECKOUT_START", createdAt: { gte: since } } }),
    prisma.analyticsEvent.count({ where: { eventType: "PURCHASE", createdAt: { gte: since } } }),
    prisma.analyticsEvent.groupBy({ by: ["source"], where: { createdAt: { gte: since } }, _count: { source: true }, orderBy: { _count: { source: "desc" } }, take: 8 }),
    prisma.user.count({ where: { createdAt: { gte: since } } }),
    prisma.creatorProfile.count({ where: { createdAt: { gte: since } } }),
    prisma.product.count({ where: { status: "PUBLISHED", visibility: "PUBLIC", deletedAt: null } }),
    prisma.order.count({ where: { status: "REFUNDED", createdAt: { gte: since } } }),
  ]);

  const topZeroResults = await prisma.searchEvent.groupBy({
    by: ["rawQuery"],
    where: { createdAt: { gte: since }, resultCount: 0 },
    _count: { rawQuery: true },
    orderBy: { _count: { rawQuery: "desc" } },
    take: 10,
  });

  const [gmvAgg, orderCount] = await Promise.all([
    prisma.order.aggregate({ where: { status: "PAID" }, _sum: { total: true } }),
    prisma.order.count({ where: { status: "PAID" } }),
  ]);

  return {
    searches,
    zeroResults,
    impressions,
    views,
    addToCarts,
    checkoutStarts,
    purchases,
    gmv: gmvAgg._sum.total?.toNumber() ?? 0,
    paidOrders: orderCount,
    registrations: users,
    newCreators: creators,
    publishedProducts,
    refundRate: orderCount + refunded > 0 ? Math.round((refunded / (orderCount + refunded)) * 1000) / 10 : 0,
    aov: orderCount ? Math.round((gmvAgg._sum.total?.toNumber() ?? 0) / orderCount * 100) / 100 : 0,
    sources: sources.map((source) => ({ source: source.source ?? "direct/unknown", events: source._count.source })),
    topZeroResults: topZeroResults.map((t) => ({ query: t.rawQuery, count: t._count.rawQuery })),
  };
}
