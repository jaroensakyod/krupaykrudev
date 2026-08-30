"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/trust";

const addSchema = z.object({
  kind: z.enum(["subject", "grade", "type", "exam"]),
  code: z
    .string()
    .min(2)
    .max(30)
    .regex(/^[A-Z0-9_]+$/, "CODE ใช้ A-Z ตัวใหญ่ ตัวเลข และ _ เท่านั้น"),
  nameTh: z.string().min(1).max(60),
});

const toggleSchema = z.object({
  kind: z.enum(["subject", "grade", "type", "exam"]),
  id: z.coerce.number().int().positive(),
  active: z.string(),
});

export async function taxonomyAction(formData: FormData) {
  const session = await requirePermission("taxonomy:manage");
  const mode = String(formData.get("mode") ?? "");

  if (mode === "add") {
    const parsed = addSchema.safeParse({
      kind: formData.get("kind"),
      code: formData.get("code"),
      nameTh: formData.get("nameTh"),
    });
    if (!parsed.success) redirect("/admin/taxonomy?error=1");
    const { kind, code, nameTh } = parsed.data;
    if (kind === "subject") {
      await prisma.subject.upsert({
        where: { code },
        update: { nameTh },
        create: { code, nameTh, sortOrder: 99 },
      });
    } else if (kind === "grade") {
      await prisma.grade.upsert({
        where: { code },
        update: { nameTh },
        create: { code, nameTh, sortOrder: 99 },
      });
    } else if (kind === "type") {
      await prisma.productType.upsert({
        where: { code },
        update: { nameTh },
        create: { code, nameTh, sortOrder: 99 },
      });
    } else {
      await prisma.exam.upsert({
        where: { code },
        update: { nameTh },
        create: { code, nameTh, sortOrder: 99 },
      });
    }
    await writeAudit(session.user.id, `admin.taxonomy_${kind}_added`, kind, code, {
      metadata: { code, nameTh },
    });
  } else if (mode === "toggle") {
    const parsed = toggleSchema.safeParse({
      kind: formData.get("kind"),
      id: formData.get("id"),
      active: formData.get("active"),
    });
    if (!parsed.success) redirect("/admin/taxonomy?error=1");
    const active = parsed.data.active === "1";
    const id = parsed.data.id;
    if (parsed.data.kind === "subject") {
      await prisma.subject.update({ where: { id }, data: { isActive: active } });
    } else if (parsed.data.kind === "grade") {
      await prisma.grade.update({ where: { id }, data: { isActive: active } });
    } else if (parsed.data.kind === "type") {
      await prisma.productType.update({ where: { id }, data: { isActive: active } });
    } else {
      await prisma.exam.update({ where: { id }, data: { isActive: active } });
    }
    await writeAudit(session.user.id, "admin.taxonomy_toggled", parsed.data.kind, String(id), {
      metadata: { active },
    });
  }

  revalidatePath("/admin/taxonomy");
  redirect("/admin/taxonomy?done=1");
}
