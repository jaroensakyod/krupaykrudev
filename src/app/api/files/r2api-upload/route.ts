import { NextResponse } from "next/server";
import { verifyLocalToken, STORAGE_DRIVER } from "@/lib/storage";

/**
 * R2 API driver upload target (cfat token) — รับ PUT จาก client ด้วย HMAC-signed ticket
 * แล้ว forward เข้า Cloudflare R2 ผ่าน Account API (token อยู่ฝั่ง server เท่านั้น)
 */
export async function PUT(request: Request) {
  if (STORAGE_DRIVER !== "r2api") {
    return NextResponse.json({ error: "DRIVER_NOT_ACTIVE" }, { status: 403 });
  }

  const url = new URL(request.url);
  const key = url.searchParams.get("key");
  const contentType = url.searchParams.get("contentType") ?? "application/octet-stream";
  const token = url.searchParams.get("token") ?? "";
  if (!key || !token.includes(":") || key.includes("..")) {
    return NextResponse.json({ error: "INVALID" }, { status: 400 });
  }
  const [expStr, sig] = token.split(":");
  if (!verifyLocalToken(key, contentType, Number(expStr), sig)) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const base = `https://api.cloudflare.com/client/v4/accounts/${process.env.R2_ACCOUNT_ID}/r2/buckets/${process.env.R2_BUCKET}/objects`;
  const body = Buffer.from(await request.arrayBuffer());
  const res = await fetch(`${base}/${key}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${process.env.R2_API_TOKEN}`, "Content-Type": contentType },
    body: new Uint8Array(body),
  });

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json({ error: "R2API_PUT_FAILED", detail: text.slice(0, 200) }, { status: 502 });
  }
  return NextResponse.json({ ok: true, size: body.length });
}
