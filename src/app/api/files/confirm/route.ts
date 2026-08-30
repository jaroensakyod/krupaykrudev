import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { getCreatorByUserId } from "@/lib/creators";
import { confirmUpload, FileError } from "@/lib/files";

const schema = z.object({
  productId: z.string().uuid(),
  key: z.string().min(1),
  filename: z.string().min(1),
  mimeType: z.string(),
  role: z.enum(["ORIGINAL", "BONUS", "ANSWER", "SUPPORTING", "COVER"]),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const creator = await getCreatorByUserId(session.user.id);
  if (!creator) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID" }, { status: 400 });
  }

  try {
    const result = await confirmUpload({ creatorId: creator.id, ...parsed.data });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof FileError) {
      return NextResponse.json({ error: error.code }, { status: 400 });
    }
    return NextResponse.json({ error: "INTERNAL" }, { status: 500 });
  }
}
