import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** สถานะเปิดเว็บ — middleware อ่านค่านี้ (cache สั้น ๆ ฝั่ง middleware เอง) */
export async function GET() {
  const flag = await prisma.launchFlag.findUnique({ where: { key: "site" } });
  return NextResponse.json(
    { live: flag?.live ?? false },
    { headers: { "Cache-Control": "no-store" } },
  );
}
