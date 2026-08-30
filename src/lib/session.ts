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
 * Guests → /login; authenticated users lacking permission → /account?denied=1
 * (server actions ที่ต้องการ throw ให้เรียก assertPermission แทน)
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
    redirect("/account?denied=1");
  }
  return session;
}

/** สำหรับ server actions — throw แทน redirect */
export async function assertPermission(permission: Permission) {
  const session = await getSession();
  if (!session?.user) {
    throw new Error("UNAUTHORIZED");
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, status: true, deletedAt: true },
  });
  if (!user || user.status !== "ACTIVE" || user.deletedAt) {
    throw new Error("UNAUTHORIZED");
  }
  if (!can(user.role, permission)) {
    throw new Error(`Forbidden: ${permission}`);
  }
  return session;
}
