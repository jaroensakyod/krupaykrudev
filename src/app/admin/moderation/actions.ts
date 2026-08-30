"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/session";
import { moderateProduct } from "@/lib/trust";

const decisionSchema = z.object({
  productId: z.string().uuid(),
  decision: z.enum(["APPROVE", "REJECT", "NEEDS_CHANGES", "SUSPEND"]),
  note: z.string().max(1000).optional(),
});

export async function moderateAction(formData: FormData) {
  const session = await requirePermission("moderation:decide");
  const parsed = decisionSchema.safeParse({
    productId: formData.get("productId"),
    decision: formData.get("decision"),
    note: formData.get("note") || undefined,
  });
  if (!parsed.success) {
    redirect("/admin/moderation?error=invalid");
  }

  await moderateProduct(session.user.id, parsed.data.productId, parsed.data.decision, parsed.data.note);
  revalidatePath("/admin/moderation");
  redirect("/admin/moderation?done=1");
}
