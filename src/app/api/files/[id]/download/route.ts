import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { storage } from "@/lib/storage";
import { authorizeDownload, FileError } from "@/lib/files";

/** TASK-037: authenticated signed download — original file ไม่เปิด public (PRD §42) */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  try {
    const file = await authorizeDownload(id, session?.user?.id ?? null);
    const filename = encodeURIComponent(file.originalFilename);

    if (storage.driver === "r2") {
      const url = await storage.presignDownload(file.storageKey);
      if (url) {
        return NextResponse.redirect(url);
      }
    }
    const buffer = await storage.getBuffer(file.storageKey);
    if (!buffer) {
      return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    }
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": file.mimeType,
        "Content-Disposition": `attachment; filename*=UTF-8''${filename}`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    if (error instanceof FileError) {
      const status = error.code === "NOT_FOUND" ? 404 : error.code === "FORBIDDEN" ? 403 : 400;
      return NextResponse.json({ error: error.code }, { status });
    }
    return NextResponse.json({ error: "INTERNAL" }, { status: 500 });
  }
}
