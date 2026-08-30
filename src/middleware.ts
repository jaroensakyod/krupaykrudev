import { NextResponse, type NextRequest } from "next/server";

/**
 * TASK-101: pseudonymous session id (PRD §67 — ไม่มี PII ใน analytics)
 * ตั้ง cookie kp_sid ให้ visitor ที่ยังไม่มี
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  if (!request.cookies.get("kp_sid")) {
    response.cookies.set("kp_sid", crypto.randomUUID(), {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 90, // 90 วัน
    });
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
