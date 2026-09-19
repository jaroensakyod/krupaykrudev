"use client";

import { useRouter } from "next/navigation";
import { useRef } from "react";
import Link from "next/link";

import { useEffect, useState } from "react";
import { MaterialIcon } from "@/components/material-icon";

/** เปิดตัว 20 กันยายน 2569 · 13:00 น. (เวลาไทย) */
const LAUNCH_AT = new Date("2026-09-20T13:00:00+07:00").getTime();

function left() {
  const diff = Math.max(0, LAUNCH_AT - Date.now());
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
    done: diff === 0,
  };
}

export default function ComingSoonPage() {
  const [t, setT] = useState(left());
  const [wlEmail, setWlEmail] = useState("");
  const [wlRole, setWlRole] = useState<"teacher" | "buyer">("teacher");
  const [wlState, setWlState] = useState<"idle" | "sending" | "done">("idle");
  const [wlCount, setWlCount] = useState<number | null>(null);
  const router = useRouter();
  const taps = useRef(0);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // ทางเข้าลับ: แตะโลโก้ 5 ครั้ง → ไปหน้า /launch (ใส่รหัสเปิดเว็บ)
  function secretTap() {
    taps.current += 1;
    if (tapTimer.current) clearTimeout(tapTimer.current);
    if (taps.current >= 5) {
      taps.current = 0;
      router.push("/launch");
      return;
    }
    tapTimer.current = setTimeout(() => { taps.current = 0; }, 1500);
  }
  useEffect(() => {
    const timer = setInterval(() => setT(left()), 1000);
    fetch("/api/waitlist").then((r) => r.json()).then((d) => setWlCount(d.count ?? 0)).catch(() => {});
    return () => clearInterval(timer);
  }, []);

  async function joinWaitlist() {
    if (!wlEmail.includes("@") || wlState === "sending") return;
    setWlState("sending");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: wlEmail, role: wlRole }),
      });
      const data = await res.json();
      if (data.ok) {
        setWlState("done");
        setWlCount(data.count ?? null);
      } else {
        setWlState("idle");
      }
    } catch {
      setWlState("idle");
    }
  }

  const boxes = [
    { v: t.days, label: "วัน" },
    { v: t.hours, label: "ชั่วโมง" },
    { v: t.minutes, label: "นาที" },
    { v: t.seconds, label: "วินาที" },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary-sidebar via-primary-dark to-primary text-white px-6 text-center">
      {/* โลโก้ */}
      <div className="mb-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <button type="button" onClick={secretTap} aria-label="ครูเปย์ครู" className="cursor-default">
          <img alt="ครูเปย์ครู" src="/images/logo-mark.svg" className="h-20 w-20 mx-auto drop-shadow-xl" />
        </button>
      </div>
      <h1 className="font-headline text-4xl md:text-6xl font-black tracking-wide mb-3">
        ครูเปย์ครู
      </h1>
      <p className="text-lg md:text-xl text-white/85 max-w-xl leading-relaxed mb-10">
        แหล่งรวมสื่อการเรียนการสอนสำหรับครูไทย
        <br />
        ครูสร้าง ครูใช้ — เปิดตัวเร็ว ๆ นี้
      </p>

      {/* Countdown */}
      <div className="grid grid-cols-4 gap-3 md:gap-5 mb-10">
        {boxes.map((b) => (
          <div
            key={b.label}
            className="bg-white/10 backdrop-blur rounded-2xl px-4 py-4 md:px-7 md:py-6 min-w-[72px] md:min-w-[96px] border border-white/15"
          >
            <p className="font-headline text-3xl md:text-5xl font-black tabular-nums">
              {String(b.v).padStart(2, "0")}
            </p>
            <p className="text-xs md:text-sm text-white/75 mt-1">{b.label}</p>
          </div>
        ))}
      </div>

      {t.done ? (
        <div className="flex flex-col items-center gap-4">
          <p className="font-headline text-2xl font-bold text-accent-light">
            ✨ เปิดตัวแล้ววันนี้! ✨
          </p>
          <a
            href="/"
            className="bg-white text-primary px-8 py-3 rounded-full font-headline font-bold hover:bg-gray-50 transition-colors shadow-lg"
          >
            เข้าสู่เว็บไซต์
          </a>
        </div>
      ) : (
        <p className="text-white/70 text-sm flex items-center gap-2">
          <MaterialIcon name="event" className="text-lg" />
          20 กันยายน 2569 · 13:00 น.
        </p>
      )}

      {/* Waitlist — เก็บ leads ครู/ผู้ซื้อรุ่นแรก (PRD §91) */}
      <div className="w-full max-w-xl bg-white/10 backdrop-blur rounded-2xl border border-white/15 p-6 mb-12">
        <p className="font-headline font-bold text-lg mb-1">
          อยากใช้ก่อนใคร? ลงทะเบียนรอเลย
        </p>
        {wlCount != null && wlCount > 0 && (
          <p className="text-xs text-accent-light mb-3">
            🔥 มีผู้ลงทะเบียนรอแล้ว {wlCount.toLocaleString()} คน
          </p>
        )}
        {wlState === "done" ? (
          <p className="text-sm text-accent-light">
            ✓ ลงทะเบียนสำเร็จ — เราจะอีเมลแจ้งตอนเปิดใช้งานจริง
          </p>
        ) : (
          <div className="space-y-3">
            <div className="flex gap-2 justify-center text-xs">
              {([["teacher", "ฉันเป็นครู/อยากขายสื่อ"], ["buyer", "ฉันอยากซื้อสื่อ"]] as const).map(([v, label]) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setWlRole(v)}
                  className={`px-4 py-1.5 rounded-full border transition-colors ${
                    wlRole === v ? "bg-white text-primary border-white font-bold" : "border-white/40 text-white/80"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                className="flex-1 px-4 py-2.5 rounded-lg text-sm text-text-main"
                onChange={(e) => setWlEmail(e.target.value)}
                placeholder="อีเมลของคุณ"
                type="email"
                value={wlEmail}
              />
              <button
                className="bg-accent hover:bg-accent/90 text-white text-sm font-bold px-5 py-2.5 rounded-lg whitespace-nowrap disabled:opacity-60"
                disabled={wlState === "sending"}
                onClick={() => void joinWaitlist()}
                type="button"
              >
                ลงทะเบียน
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center gap-2 text-white/50 text-sm">
        <MaterialIcon name="school" className="text-xl" filled />
        ครูซื้อจากครู — สื่อการสอนคุณภาพจากครูตัวจริง
      </div>

      {/* ทางเข้าเจ้าของเว็บ */}
      <Link
        href="/launch"
        aria-label="จัดการระบบ"
        className="fixed bottom-3 right-3 w-6 h-6 rounded-full border border-white/20 text-white/30 hover:text-white hover:border-white text-[10px] flex items-center justify-center transition-colors"
        title="จัดการระบบ"
      >
        •
      </Link>
    </div>
  );
}
