"use client";

import { useRouter } from "next/navigation";
import { useRef } from "react";

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
    return () => clearInterval(timer);
  }, []);

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

      <div className="mt-16 flex items-center gap-2 text-white/50 text-sm">
        <MaterialIcon name="school" className="text-xl" filled />
        ครูซื้อจากครู — สื่อการสอนคุณภาพจากครูตัวจริง
      </div>
    </div>
  );
}
