"use server";
import { resetPasswordAction } from "@/lib/auth-flows";

export async function resetPasswordActionWrapper(
  _prev: { error?: string; done?: boolean },
  formData: FormData,
) {
  return resetPasswordAction(_prev, formData);
}
