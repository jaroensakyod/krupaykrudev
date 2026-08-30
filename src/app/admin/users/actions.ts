"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/trust";

const schema = z.object({
  userId: z.string().uuid(),
  role: z.enum(["BUYER", "CREATOR", "MODERATOR", "ADMIN"]),
  status: z.enum(["ACTIVE", "SUSPENDED", "BANNED"]),
});

export async function updateUserAction(formData: FormData) {
  const session = await requirePermission("user:manage");
  const parsed = schema.safeParse({
    userId: formData.get("userId"),
    role: formData.get("role"),
    status: formData.get("status"),
  });
  if (!parsed.success) redirect("/admin/users?error=1");
  if (parsed.data.userId === session.user.id) redirect("/admin/users?error=self");

  const before = await prisma.user.findUniqueOrThrow({
    where: { id: parsed.data.userId },
    select: { role: true, status: true },
  });
  await prisma.user.update({
    where: { id: parsed.data.userId },
    data: { role: parsed.data.role, status: parsed.data.status },
  });
  await writeAudit(session.user.id, "admin.user_updated", "user", parsed.data.userId, {
    before: { role: before.role, status: before.status },
    after: { role: parsed.data.role, status: parsed.data.status },
  });
  revalidatePath("/admin/users");
  redirect("/admin/users?done=1");
}
