import { NextResponse, type NextRequest } from "next/server";

/** Next.js 16 request boundary: pseudonymous analytics plus first-touch referral/UTM capture. */
export function proxy(request: NextRequest) {
  const response = NextResponse.next();
  if (!request.cookies.get("kp_sid")) response.cookies.set("kp_sid", crypto.randomUUID(), { httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 90 });
  const url = request.nextUrl;
  if (!request.cookies.get("kp_ref") && url.searchParams.get("ref")) response.cookies.set("kp_ref", url.searchParams.get("ref")!, { httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 90 });
  for (const key of ["utm_source", "utm_medium", "utm_campaign"] as const) {
    if (!request.cookies.get(`kp_${key}`) && url.searchParams.get(key)) response.cookies.set(`kp_${key}`, url.searchParams.get(key)!, { httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 90 });
  }
  return response;
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
