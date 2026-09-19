"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { createReview, ReviewError, toggleWishlist } from "@/lib/reviews";
import { trackEvent } from "@/lib/analytics";
import { markAllRead } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";

export async function createReviewAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  try {
    await createReview({
      buyerId: session.user.id,
      orderItemId: String(formData.get("orderItemId") ?? ""),
      rating: Number(formData.get("rating") ?? 0),
      title: String(formData.get("title") ?? "") || undefined,
      body: String(formData.get("body") ?? "") || undefined,
    });
    void trackEvent({ eventType: "REVIEW_SUBMIT", userId: session.user.id });
  } catch (error) {
    if (error instanceof ReviewError && error.code === "ALREADY_REVIEWED") {
      redirect("/orders?error=already_reviewed");
    }
    redirect("/orders?error=review_failed");
  }
  revalidatePath("/orders");
  redirect("/orders?reviewed=1");
}

export async function toggleWishlistAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const productId = String(formData.get("productId") ?? "");
  const result = await toggleWishlist(session.user.id, productId);
  if (result === "added") {
    void trackEvent({ eventType: "WISHLIST_ADD", userId: session.user.id, productId });
  }
  revalidatePath(`/products/${formData.get("slug") ?? ""}`);
  redirect(`/products/${formData.get("slug") ?? ""}?wish=${result}`);
}

export async function requestRefundAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const orderId = String(formData.get("orderId") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();
  if (!reason) redirect("/orders?error=refund_reason");

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.buyerId !== session.user.id || order.status !== "PAID") {
    redirect("/orders?error=refund_not_allowed");
  }
  // §40: ขอได้ภายใน 7 วัน + ยังไม่มีคำขอค้างอยู่
  const existing = await prisma.refund.findFirst({ where: { orderId, status: "REQUESTED" } });
  const within7 = Date.now() - order.createdAt.getTime() < 7 * 24 * 60 * 60 * 1000;
  if (existing || !within7) redirect("/orders?error=refund_not_allowed");

  await prisma.refund.create({
    data: {
      orderId,
      amount: order.total,
      reason,
      requestedBy: session.user.id,
      status: "REQUESTED",
    },
  });
  redirect("/orders?refund_requested=1");
}

export async function markAllReadAction() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  await markAllRead(session.user.id);
  revalidatePath("/account/notifications");
}
