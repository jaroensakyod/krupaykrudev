"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/trust";

const schema = z.object({
  creatorId: z.string().uuid(),
  verificationStatus: z.enum(["UNVERIFIED", "BASIC", "VERIFIED", "RESTRICTED"]),
});

export async function updateCreatorAction(formData: FormData) {
  const session = await requirePermission("creator:manage");
  const parsed = schema.safeParse({
    creatorId: formData.get("creatorId"),
    verificationStatus: formData.get("verificationStatus"),
  });
  if (!parsed.success) redirect("/admin/creators?error=1");

  const before = await prisma.creatorProfile.findUniqueOrThrow({
    where: { id: parsed.data.creatorId },
    select: { verificationStatus: true },
  });
  await prisma.creatorProfile.update({
    where: { id: parsed.data.creatorId },
    data: { verificationStatus: parsed.data.verificationStatus },
  });
  await writeAudit(session.user.id, "admin.creator_verification", "creator", parsed.data.creatorId, {
    before: before,
    after: { verificationStatus: parsed.data.verificationStatus },
  });
  revalidatePath("/admin/creators");
  redirect("/admin/creators?done=1");
}
