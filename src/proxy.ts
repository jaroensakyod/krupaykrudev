import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Next.js 16 request boundary (proxy):
 * - TASK-101: pseudonymous session id + first-touch referral/UTM capture (PRD §67)
 * - Pre-launch gate: คนทั่วไปเห็น /coming-soon จนกว่าจะกดสวิตช์เปิดเว็บ (LaunchFlag)
 * - อุปกรณ์พิธี (cookie launch_admin) เห็นเว็บจริงทันที
 */

// cache สถานะสั้น ๆ กันยิง DB ทุก request
// อ่าน LaunchFlag จาก DB ตรง ๆ (proxy รันบน Node.js runtime ใน Next 16)
// เดิม fetch `${origin}/api/launch-status` วิ่งออกเน็ตแล้ววนกลับผ่าน Cloudflare
// ทำให้เกิด request "node" หลายร้อยครั้ง/วัน และเสี่ยงโดน Bot Fight Mode บล็อก
// จนทุกคนถูกส่งไป /coming-soon
let cached: { live: boolean; at: number } | null = null;
const CACHE_MS = 30_000;

async function isLive(): Promise<boolean> {
  const now = Date.now();
  if (cached && now - cached.at < CACHE_MS) return cached.live;
  try {
    const flag = await prisma.launchFlag.findUnique({ where: { key: "site" } });
    cached = { live: flag?.live ?? false, at: now };
  } catch {
    if (cached) return cached.live;
    cached = { live: false, at: now };
  }
  return cached.live;
}

export async function proxy(request: NextRequest) {
  const response = NextResponse.next();

  // pseudonymous session + referral/UTM first-touch
  if (!request.cookies.get("kp_sid")) {
    response.cookies.set("kp_sid", crypto.randomUUID(), {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 90,
    });
  }
  const url = request.nextUrl;
  if (!request.cookies.get("kp_ref") && url.searchParams.get("ref")) {
    response.cookies.set("kp_ref", url.searchParams.get("ref")!, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 90,
    });
  }
  for (const key of ["utm_source", "utm_medium", "utm_campaign"] as const) {
    if (!request.cookies.get(`kp_${key}`) && url.searchParams.get(key)) {
      response.cookies.set(`kp_${key}`, url.searchParams.get(key)!, {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 90,
      });
    }
  }

  // Pre-launch gate
  const { pathname } = url;
  const exempt =
    pathname === "/coming-soon" ||
    pathname === "/launch" ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/dashboard") ||
    pathname === "/login" ||
    pathname === "/icon.svg" ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname.endsWith(".pdf");

  if (!exempt && !pathname.startsWith("/coming-soon")) {
    if (!request.cookies.get("launch_admin")) {
      const live = await isLive();
      if (!live) {
        const launchUrl = request.nextUrl.clone();
        launchUrl.pathname = "/coming-soon";
        launchUrl.search = "";
        return NextResponse.redirect(launchUrl);
      }
    }
  }

  return response;
}
