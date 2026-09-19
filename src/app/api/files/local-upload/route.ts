import { NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { verifyLocalToken } from "@/lib/storage";

/**
 * Dev-only local storage upload target (จะถูกแทนด้วย R2 presigned PUT เมื่อใส่ค่า keys)
 * POST multipart ไม่ใช้ — รับ raw body PUT พร้อม token ใน query
 */
export async function PUT(request: Request) {
  if (process.env.NODE_ENV === "production" && process.env.R2_ACCESS_KEY_ID) {
    return NextResponse.json({ error: "LOCAL_DRIVER_DISABLED" }, { status: 403 });
  }

  const url = new URL(request.url);
  const key = url.searchParams.get("key");
  const contentType = url.searchParams.get("contentType") ?? "application/octet-stream";
  const token = url.searchParams.get("token") ?? "";
  if (!key || !token.includes(":")) {
    return NextResponse.json({ error: "INVALID" }, { status: 400 });
  }
  const [expStr, sig] = token.split(":");
  if (!verifyLocalToken(key, contentType, Number(expStr), sig)) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }
  // key ห้ามออกนอก .storage
  if (key.includes("..")) {
    return NextResponse.json({ error: "INVALID" }, { status: 400 });
  }

  const ROOT = path.join(process.cwd(), ".storage");
  const full = path.join(ROOT, key);
  await mkdir(path.dirname(full), { recursive: true });
  const MAX = 100 * 1024 * 1024;
  const declared = Number(request.headers.get("content-length") ?? "0");
  if (!declared || declared > MAX) {
    return NextResponse.json({ error: "TOO_LARGE" }, { status: 413 });
  }
  const body = Buffer.from(await request.arrayBuffer());
  if (body.length > MAX) {
    return NextResponse.json({ error: "TOO_LARGE" }, { status: 413 });
  }
  await writeFile(full, body);
  return NextResponse.json({ ok: true, size: body.length });
}
