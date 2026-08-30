"use client";

import { useActionState } from "react";
import { MaterialIcon } from "@/components/material-icon";
import { loginAction, type AuthFormState } from "../actions";

const initialState: AuthFormState = {};

export function LoginFields() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      {state.error ? (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>
      ) : null}
      <div>
        <label className="block text-sm font-medium text-text-main mb-1" htmlFor="login-email">
          อีเมล
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MaterialIcon name="mail" className="text-gray-400 text-[20px]" />
          </div>
          <input
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm"
            id="login-email"
            name="email"
            placeholder="กรอกอีเมลของคุณ"
            required
            type="email"
          />
        </div>
      </div>
      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="block text-sm font-medium text-text-main" htmlFor="login-password">
            รหัสผ่าน
          </label>
          <a className="text-xs font-medium text-primary hover:underline" href="/help">
            ลืมรหัสผ่าน?
          </a>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MaterialIcon name="lock" className="text-gray-400 text-[20px]" />
          </div>
          <input
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm"
            id="login-password"
            name="password"
            placeholder="กรอกรหัสผ่าน"
            required
            type="password"
          />
        </div>
      </div>
      <div className="flex items-center">
        <input
          className="w-4 h-4 text-primary bg-white border-gray-300 rounded"
          id="remember-me"
          name="rememberMe"
          type="checkbox"
        />
        <label className="ml-2 text-sm text-text-muted" htmlFor="remember-me">
          จดจำฉันไว้ในระบบ
        </label>
      </div>
      <button
        className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2.5 px-4 rounded-lg transition-colors shadow-sm disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
      </button>
    </form>
  );
}
