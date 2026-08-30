"use client";

import { useActionState } from "react";
import Link from "next/link";
import { resetPasswordActionWrapper } from "./actions";

export function ResetFields({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(resetPasswordActionWrapper, {});

  if (state.done) {
    return (
      <div className="space-y-4">
        <p className="rounded-lg bg-green-50 border border-green-200 p-4 text-sm text-green-800">
          ตั้งรหัสผ่านใหม่เรียบร้อย — เข้าสู่ระบบด้วยรหัสผ่านใหม่ได้เลย
        </p>
        <Link href="/login" className="block w-full bg-primary text-white text-center font-medium py-3 rounded-lg text-sm">
          เข้าสู่ระบบ
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {state.error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>}
      <input name="token" type="hidden" value={token} />
      <input
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm"
        name="password"
        placeholder="รหัสผ่านใหม่ (อย่างน้อย 8 ตัวอักษร)"
        required
        minLength={8}
        type="password"
      />
      <button
        className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 rounded-lg text-sm disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? "กำลังบันทึก..." : "บันทึกรหัสผ่านใหม่"}
      </button>
    </form>
  );
}
