"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/session";
import { getCreatorByUserId } from "@/lib/creators";
import { requestPayout } from "@/lib/finance";

export async function requestPayoutAction(formData: FormData) {
  const session = await requirePermission("payout:request");
  const profile = await getCreatorByUserId(session.user.id);
  if (!profile) redirect("/sell/start");

  const amount = Number(formData.get("amount") ?? 0);
  try {
    await requestPayout(session.user.id, amount);
  } catch {
    redirect("/dashboard/earnings?error=insufficient");
  }
  revalidatePath("/dashboard/earnings");
  redirect("/dashboard/earnings?requested=1");
}
