"use server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getCreatorByUserId } from "@/lib/creators";
import { createBundle } from "@/lib/bundles";

export async function createBundleAction(formData: FormData) {
  const session = await auth(); if (!session?.user) redirect("/login");
  const creator = await getCreatorByUserId(session.user.id); if (!creator) redirect("/sell/start");
  try { const bundle = await createBundle(creator.id, String(formData.get("title") ?? ""), String(formData.get("description") ?? ""), Number(formData.get("price")), formData.getAll("productIds").map(String)); redirect(`/bundles/${bundle.slug}`); }
  catch { redirect("/dashboard/bundles?error=invalid"); }
}
