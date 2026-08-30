"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/session";
import { completePayout, processRefund, reconcilePlatform } from "@/lib/finance";

export async function completePayoutAction(formData: FormData) {
  const session = await requirePermission("payout:process");
  const payoutId = String(formData.get("payoutId") ?? "");
  const reference = String(formData.get("reference") ?? "") || undefined;
  await completePayout(session.user.id, payoutId, reference);
  revalidatePath("/admin/finance");
  redirect("/admin/finance?payout=done");
}

export async function refundAction(formData: FormData) {
  const session = await requirePermission("payout:process");
  const orderId = String(formData.get("orderId") ?? "");
  const reason = String(formData.get("reason") ?? "ไม่ระบุ");
  try {
    await processRefund(session.user.id, orderId, reason);
  } catch {
    redirect("/admin/finance?error=not_refundable");
  }
  revalidatePath("/admin/finance");
  redirect("/admin/finance?refund=done");
}

export async function reconcileAction() {
  await requirePermission("payout:process");
  const result = await reconcilePlatform();
  revalidatePath("/admin/finance");
  redirect(`/admin/finance?reconcile=${result.ok ? "ok" : "drift"}`);
}
