"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { requirePermission } from "@/lib/session";
import { getCreatorByUserId } from "@/lib/creators";
import {
  createDraftProduct,
  getOwnProduct,
  ProductError,
  submitForReview,
  updateDraftProduct,
} from "@/lib/products";

async function currentCreatorId() {
  const session = await requirePermission("product:create");
  const profile = await getCreatorByUserId(session.user.id);
  if (!profile) redirect("/sell/start");
  return profile.id;
}

export async function createDraftAction(formData: FormData) {
  const creatorId = await currentCreatorId();
  const title = String(formData.get("title") ?? "").trim();
  try {
    const product = await createDraftProduct(creatorId, (await auth())!.user.id, title);
    redirect(`/dashboard/products/${product.id}`);
  } catch (error) {
    if (error instanceof ProductError) {
      redirect("/dashboard/products/new?error=invalid");
    }
    throw error;
  }
}

const updateSchema = z.object({
  title: z.string().min(3).max(200),
  shortDescription: z.string().max(200).optional(),
  description: z.string().max(5000).optional(),
  productTypeId: z.coerce.number().int().positive(),
  subjectId: z.coerce.number().int().positive(),
  primaryGradeId: z.coerce.number().int().positive(),
  curriculumId: z.coerce.number().int().positive().nullable(),
  topicId: z.coerce.number().int().positive().nullable(),
  examId: z.coerce.number().int().positive().nullable(),
  price: z.coerce.number().min(0).max(100000),
  tags: z.array(z.string()).default([]),
});

export async function saveDraftAction(
  _prev: { error?: string; saved?: boolean },
  formData: FormData,
): Promise<{ error?: string; saved?: boolean }> {
  const creatorId = await currentCreatorId();
  const productId = String(formData.get("productId") ?? "");

  const curriculumRaw = formData.get("curriculumId");
  const parsed = updateSchema.safeParse({
    title: formData.get("title"),
    shortDescription: formData.get("shortDescription") || undefined,
    description: formData.get("description") || undefined,
    productTypeId: formData.get("productTypeId"),
    subjectId: formData.get("subjectId"),
    primaryGradeId: formData.get("primaryGradeId"),
    curriculumId: curriculumRaw ? Number(curriculumRaw) : null,
    topicId: formData.get("topicId") ? Number(formData.get("topicId")) : null,
    examId: formData.get("examId") ? Number(formData.get("examId")) : null,
    price: formData.get("price"),
    tags: String(formData.get("tagsInput") ?? "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
  });
  if (!parsed.success) {
    return { error: "กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง" };
  }

  try {
    // ตรวจว่าเป็นเจ้าของก่อน
    await getOwnProduct(creatorId, productId);
    await updateDraftProduct(creatorId, productId, parsed.data);
    return { saved: true };
  } catch (error) {
    if (error instanceof ProductError && error.code === "INVALID_STATUS") {
      return { error: "สินค้าสถานะนี้แก้ไขไม่ได้" };
    }
    return { error: "บันทึกไม่สำเร็จ กรุณาลองใหม่" };
  }
}

export async function submitForReviewAction(formData: FormData) {
  const creatorId = await currentCreatorId();
  const productId = String(formData.get("productId") ?? "");
  const declarationAccepted = formData.get("declaration") === "on";
  try {
    await submitForReview(creatorId, productId, declarationAccepted);
  } catch (error) {
    if (error instanceof ProductError && error.code === "INCOMPLETE_SUBMISSION") {
      redirect(`/dashboard/products/${productId}?error=incomplete`);
    }
    if (error instanceof ProductError && error.code === "INVALID_STATUS") {
      redirect(`/dashboard/products/${productId}?error=invalid_status`);
    }
    throw error;
  }
  redirect("/dashboard/products?submitted=1");
}
