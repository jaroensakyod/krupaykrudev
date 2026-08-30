"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { addToCart, removeFromCart, checkout } from "@/lib/commerce";

export async function addToCartAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const productId = String(formData.get("productId") ?? "");
  try {
    await addToCart(session.user.id, productId);
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
  await removeFromCart(session.user.id, String(formData.get("productId") ?? ""));
  redirect("/cart");
}

export async function checkoutAction() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  try {
    const { payment } = await checkout(session.user.id);
    redirect(`/checkout/pay/${payment.id}`);
  } catch (error) {
    if (String(error).includes("EMPTY_CART") || String(error).includes("PRODUCT_UNAVAILABLE")) {
      redirect("/cart?error=unavailable");
    }
    throw error;
  }
}
