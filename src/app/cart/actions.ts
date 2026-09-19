"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { addToCart, removeFromCart, removeBundleFromCart, checkout } from "@/lib/commerce";
import { trackEvent } from "@/lib/analytics";
import { addBundleToCart } from "@/lib/bundles";

export async function addBundleToCartAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  try {
    await addBundleToCart(session.user.id, String(formData.get("bundleId") ?? ""));
    void trackEvent({ eventType: "BUNDLE_ADD_TO_CART", userId: session.user.id });
  } catch { redirect("/cart?error=unavailable"); }
  redirect("/cart?added=1");
}

export async function addToCartAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const productId = String(formData.get("productId") ?? "");
  try {
    await addToCart(session.user.id, productId);
    void trackEvent({ eventType: "ADD_TO_CART", userId: session.user.id, productId }); // TASK-105
  } catch (error) {
    if (String(error).includes("OWN_PRODUCT")) redirect("/cart?error=own");
    if (String(error).includes("ALREADY_OWNED")) redirect("/cart?error=owned");
    redirect("/cart?error=unavailable");
  }
  redirect("/cart?added=1");
}

export async function removeFromCartAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const productId = String(formData.get("productId") ?? "");
  if (formData.get("isBundle") === "1") await removeBundleFromCart(session.user.id, productId); else await removeFromCart(session.user.id, productId);
  void trackEvent({ eventType: "REMOVE_FROM_CART", userId: session.user.id, productId });
  redirect("/cart");
}

export async function checkoutAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const couponCode = String(formData.get("couponCode") ?? "").trim() || undefined;
  try {
    const { payment, order } = await checkout(session.user.id, couponCode);
    void trackEvent({ eventType: "CHECKOUT_START", userId: session.user.id, properties: { orderId: order.id } }); // TASK-106
    redirect(`/checkout/pay/${payment.id}`);
  } catch (error) {
    if (String(error).includes("EMPTY_CART") || String(error).includes("PRODUCT_UNAVAILABLE")) {
      redirect("/cart?error=unavailable");
    }
    if (String(error).includes("COUPON_INVALID")) {
      redirect("/cart?error=coupon");
    }
    throw error;
  }
}
