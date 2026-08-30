"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { becomeCreator, CreatorError } from "@/lib/creators";

export type BecomeCreatorState = { error?: string; field?: string };

const schema = z.object({
  displayName: z.string().min(2).max(60),
  slug: z.string().min(3).max(40),
  bio: z.string().max(500).optional(),
  subjects: z.array(z.string()).default([]),
});

export async function becomeCreatorAction(
  _prev: BecomeCreatorState,
  formData: FormData,
): Promise<BecomeCreatorState> {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const subjects = formData.getAll("subjects").map(String).filter(Boolean);
  const parsed = schema.safeParse({
    displayName: formData.get("displayName"),
    slug: formData.get("slug"),
    bio: formData.get("bio") || undefined,
    subjects,
  });
  if (!parsed.success) {
    return { error: "กรุณากรอกข้อมูลให้ถูกต้อง (ชื่อร้านและ URL ต้องมีอย่างน้อย 3 ตัวอักษร)" };
  }
  if (!formData.get("terms")) {
    return { error: "กรุณายอมรับเงื่อนไขการเป็นผู้ขายก่อนเปิดร้าน" };
  }

  try {
    await becomeCreator(session.user.id, parsed.data);
  } catch (error) {
    if (error instanceof CreatorError) {
      switch (error.code) {
        case "SLUG_TAKEN":
          return { error: "URL ร้านค้านี้ถูกใช้แล้ว กรุณาเลือกใหม่", field: "slug" };
        case "ALREADY_CREATOR":
          redirect("/dashboard");
          break;
        case "INVALID_SLUG":
          return {
            error: "URL ใช้ได้เฉพาะตัวอักษรอังกฤษเล็ก ตัวเลข และขีด (-) ยาว 3-40 ตัว",
            field: "slug",
          };
        default:
          return { error: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง" };
      }
    }
    return { error: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง" };
  }

  redirect("/dashboard");
}
