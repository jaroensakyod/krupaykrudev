"use server";
import { requestPasswordResetAction } from "@/lib/auth-flows";

export async function forgotPasswordAction(
  _prev: { error?: string; sent?: boolean },
  formData: FormData,
) {
  return requestPasswordResetAction(_prev, formData);
}
