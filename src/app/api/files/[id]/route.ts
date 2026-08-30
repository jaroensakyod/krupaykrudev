import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getCreatorByUserId } from "@/lib/creators";
import { deleteOwnFile, FileError } from "@/lib/files";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const creator = await getCreatorByUserId(session.user.id);
  if (!creator) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  try {
    await deleteOwnFile(creator.id, id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof FileError) {
      const status = error.code === "NOT_FOUND" ? 404 : error.code === "FORBIDDEN" ? 403 : 400;
      return NextResponse.json({ error: error.code }, { status });
    }
    return NextResponse.json({ error: "INTERNAL" }, { status: 500 });
  }
}
