"use client";

import { useActionState } from "react";
import { MaterialIcon } from "@/components/material-icon";
import { launchSiteAction } from "./actions";

/** สวิตช์เปิดเว็บ — ใส่รหัสถูกแล้วกดปุ่มเดียว เว็บเปลี่ยนทั่วโลก */
export function LaunchFields() {
  const [state, formAction, pending] = useActionState(launchSiteAction, {});

  return (
    <form action={formAction} className="w-full max-w-sm space-y-4">
      {state.error && (
        <p className="rounded-lg bg-red-500/20 border border-red-400/40 px-4 py-3 text-sm text-red-100">
          {state.error}
        </p>
      )}
      <div>
        <label className="block text-sm text-white/80 mb-2" htmlFor="code">
          รหัสเปิดเว็บ
        </label>
        <input
          autoComplete="off"
          className="w-full px-4 py-3 text-center font-mono text-lg tracking-[0.4em] rounded-xl bg-white/10 border border-white/25 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-accent"
          id="code"
          name="code"
          placeholder="••••••"
          required
          type="password"
        />
      </div>
      <button
        className="w-full bg-accent hover:bg-accent/90 text-white font-headline font-black text-2xl py-5 rounded-2xl shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.99] disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? "กำลังเปิด..." : "🚀 เปิดเว็บเลย"}
      </button>
    </form>
  );
}
