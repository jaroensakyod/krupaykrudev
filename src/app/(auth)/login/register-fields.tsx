"use client";

import { useActionState } from "react";
import { MaterialIcon } from "@/components/material-icon";
import { registerAction, type AuthFormState } from "../actions";

const initialState: AuthFormState = {};

export function RegisterFields() {
  const [state, formAction, pending] = useActionState(registerAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      {state.error ? (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>
      ) : null}

      {/* Role Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-text-main mb-2">
          คุณต้องการใช้งานในฐานะ?
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="relative flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-primary bg-white transition-colors has-checked:border-primary">
            <input
              defaultChecked
              className="h-4 w-4 text-primary border-gray-300"
              name="role"
              type="radio"
              value="buyer"
            />
            <span className="ml-3 flex items-center gap-1 text-sm font-medium text-text-main">
              <MaterialIcon name="shopping_bag" className="text-[18px] text-primary" />
              ครูซื้อสื่อ
            </span>
          </label>
          <label className="relative flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-accent bg-white transition-colors has-checked:border-accent">
            <input
              className="h-4 w-4 text-accent border-gray-300"
              name="role"
              type="radio"
              value="seller"
            />
            <span className="ml-3 flex items-center gap-1 text-sm font-medium text-text-main">
              <MaterialIcon name="storefront" className="text-[18px] text-accent" />
              ขายสื่อ
            </span>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-main mb-1" htmlFor="reg-name">
          ชื่อที่แสดง
        </label>
        <input
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm"
          id="reg-name"
          name="displayName"
          placeholder="เช่น ครูใจดี"
          required
          minLength={2}
          maxLength={60}
          type="text"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-text-main mb-1" htmlFor="reg-email">
          อีเมล
        </label>
        <input
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm"
          id="reg-email"
          name="email"
          placeholder="example@school.ac.th"
          required
          type="email"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-text-main mb-1" htmlFor="reg-password">
          รหัสผ่าน
        </label>
        <input
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm"
          id="reg-password"
          name="password"
          placeholder="อย่างน้อย 8 ตัวอักษร"
          required
          minLength={8}
          type="password"
        />
      </div>

      {/* PDPA Checkbox */}
      <div className="flex items-start pt-2">
        <div className="flex items-center h-5">
          <input
            className="w-4 h-4 text-primary bg-white border-gray-300 rounded"
            id="pdpa"
            name="pdpa"
            required
            type="checkbox"
          />
        </div>
        <div className="ml-3 text-xs text-text-muted leading-tight">
          <label htmlFor="pdpa">
            ฉันยอมรับ{" "}
            <a className="text-primary hover:underline font-medium" href="/terms">
              เงื่อนไขการให้บริการ
            </a>{" "}
            และ{" "}
            <a className="text-primary hover:underline font-medium" href="/privacy">
              นโยบายความเป็นส่วนตัว (PDPA)
            </a>{" "}
            ของ KruPayKru
          </label>
        </div>
      </div>

      <button
        className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2.5 px-4 rounded-lg transition-colors shadow-sm mt-4 disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? "กำลังสมัครสมาชิก..." : "สมัครสมาชิก"}
      </button>
    </form>
  );
}
