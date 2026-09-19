"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/session";
import { getCreatorByUserId } from "@/lib/creators";
import { createCoupon, deactivateCoupon } from "@/lib/coupons";

export async function createCouponAction(formData: FormData) {
  const session = await requirePermission("product:create");
  const profile = await getCreatorByUserId(session.user.id);
  if (!profile) redirect("/sell/start");

  const code = String(formData.get("code") ?? "");
  const discountPct = Number(formData.get("discountPct") ?? 0);
  const expires = String(formData.get("expiresAt") ?? "");

  try {
    await createCoupon(
      profile.id,
      code,
      discountPct,
      expires ? new Date(expires) : undefined,
    );
  } catch {
    redirect("/dashboard/coupons?error=dup");
  }
  revalidatePath("/dashboard/coupons");
  redirect("/dashboard/coupons?created=1");
}

export async function deactivateCouponAction(formData: FormData) {
  const session = await requirePermission("product:create");
  const profile = await getCreatorByUserId(session.user.id);
  if (!profile) redirect("/sell/start");
  await deactivateCoupon(profile.id, String(formData.get("couponId") ?? ""));
  revalidatePath("/dashboard/coupons");
}
