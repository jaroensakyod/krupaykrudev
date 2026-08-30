import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { can, type Permission, type Role } from "@/lib/rbac";

/** Returns the current session, or null for guests. */
export async function getSession() {
  return auth();
}

/**
 * Server-side authorization guard for pages/actions.
 * Role is read from the database (source of truth) — the JWT role may be stale
 * after role upgrades (e.g. buyer becomes creator).
 * Throws for authenticated users lacking permission; redirects guests to login.
 */
export async function requirePermission(permission: Permission) {
  const session = await getSession();
  if (!session?.user) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, status: true, deletedAt: true },
  });
  if (!user || user.status !== "ACTIVE" || user.deletedAt) {
    redirect("/login");
  }

  if (!can(user.role, permission)) {
    throw new Error(`Forbidden: ${permission}`);
  }
  return session;
}
