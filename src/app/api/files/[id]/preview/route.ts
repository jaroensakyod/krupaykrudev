import { NextResponse } from "next/server";
import { storage } from "@/lib/storage";
import { getPreviewForRead } from "@/lib/files";

/** Public preview stream — เฉพาะไฟล์ preview ที่ผ่าน watermark เท่านั้น (original ห้าม) */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const preview = await getPreviewForRead(id);
  if (!preview) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }
  const buffer = await storage.getBuffer(preview.storageKey);
  if (!buffer) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": preview.mimeType,
      "Cache-Control": "public, max-age=86400, immutable",
    },
  });
}
