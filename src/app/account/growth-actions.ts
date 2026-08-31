"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { toggleCreatorFollow, toggleTopicFollow } from "@/lib/growth";
import { trackEvent } from "@/lib/analytics";

export async function toggleCreatorFollowAction(formData: FormData) {
  const session = await auth(); if (!session?.user) redirect("/login");
  const creatorId = String(formData.get("creatorId") ?? "");
  const result = await toggleCreatorFollow(session.user.id, creatorId);
  if (result === "added") void trackEvent({ eventType: "FOLLOW_CREATOR", userId: session.user.id, creatorId });
  revalidatePath(`/creator/${String(formData.get("slug") ?? "")}`);
}

export async function toggleTopicFollowAction(formData: FormData) {
  const session = await auth(); if (!session?.user) redirect("/login");
  const subjectId = Number(formData.get("subjectId")); const gradeId = Number(formData.get("gradeId"));
  if (!Number.isInteger(subjectId) || !Number.isInteger(gradeId)) return;
  const result = await toggleTopicFollow(session.user.id, subjectId, gradeId);
  if (result === "added") void trackEvent({ eventType: "FOLLOW_TOPIC", userId: session.user.id });
  revalidatePath("/search");
}
