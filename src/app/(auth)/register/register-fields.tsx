"use client";

import { useActionState } from "react";
import { registerAction, type AuthFormState } from "../actions";

const initialState: AuthFormState = {};

export function RegisterFields() {
  const [state, formAction, pending] = useActionState(
    registerAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.error ? (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      <label className="flex flex-col gap-1 text-sm">
        ชื่อที่แสดง
        <input
          name="displayName"
          type="text"
          required
          minLength={2}
          maxLength={60}
          className="rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        อีเมล
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        รหัสผ่าน
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-brand-600 px-4 py-2.5 font-medium text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {pending ? "กำลังสมัครสมาชิก..." : "สมัครสมาชิก"}
      </button>
    </form>
  );
}
