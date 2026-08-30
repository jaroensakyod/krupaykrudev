import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { can, type Permission, type Role } from "@/lib/rbac";

/** Returns the current session, or null for guests. */
export async function getSession() {
  return auth();
}

/**
 * Server-side authorization guard for pages/actions.
 * Throws for authenticated users lacking permission; redirects guests to login.
 */
export async function requirePermission(permission: Permission) {
  const session = await getSession();
  if (!session?.user) {
    redirect("/login");
  }
  const role = session.user.role as Role;
  if (!can(role, permission)) {
    throw new Error(`Forbidden: ${permission}`);
  }
  return session;
}
