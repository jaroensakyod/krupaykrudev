"use client";

import { useActionState } from "react";
import { forgotPasswordAction } from "./actions";

export function ForgotFields() {
  const [state, formAction, pending] = useActionState(forgotPasswordAction, {});

  if (state.sent) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800">
        หากอีเมลนี้มีในระบบ ลิงก์ตั้งรหัสผ่านใหม่ได้ถูกส่งแล้ว — ตรวจสอบอีเมลหรือการแจ้งเตือนในบัญชี
        (ระหว่าง dev: ดูลิงก์ได้จาก server log หรือหน้าการแจ้งเตือน)
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {state.error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>}
      <input
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
        name="email"
        placeholder="อีเมลของคุณ"
        required
        type="email"
      />
      <button
        className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 rounded-lg text-sm disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? "กำลังส่ง..." : "ส่งลิงก์ตั้งรหัสผ่านใหม่"}
      </button>
    </form>
  );
}
