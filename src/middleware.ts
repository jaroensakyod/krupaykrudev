import { NextResponse, type NextRequest } from "next/server";

/**
 * TASK-101: pseudonymous session id (PRD §67 — ไม่มี PII ใน analytics)
 * + Pre-launch gate: redirect ทุกหน้าสาธารณะไป /coming-soon จนกว่าจะเปิดตัว
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  if (!request.cookies.get("kp_sid")) {
    response.cookies.set("kp_sid", crypto.randomUUID(), {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 90,
    });
  }

  // Pre-launch gate — เจ้าของ/แอดมินเข้าพื้นที่ทำงานได้, คนทั่วไปเห็น countdown
  const { pathname } = request.nextUrl;
  const exempt =
    pathname === "/coming-soon" ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/dashboard") ||
    pathname === "/login" ||
    pathname === "/icon.svg" ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico";

  if (!exempt && !pathname.startsWith("/coming-soon")) {
    const url = request.nextUrl.clone();
    url.pathname = "/coming-soon";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
