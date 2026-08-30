/**
 * RBAC — permission sets are explicit per role; higher roles are supersets.
 * All authorization is enforced server-side; UI hiding is cosmetic only.
 */

export type Role = "BUYER" | "CREATOR" | "MODERATOR" | "ADMIN";

export type Permission = string; // validated against the known set in can()

const BUYER_PERMISSIONS = [
  "product:view",
  "cart:manage",
  "checkout:create",
  "download:own",
  "review:create:own",
  "report:create",
] as const;

const CREATOR_ONLY_PERMISSIONS = [
  "product:create",
  "product:update:own",
  "product:submit:own",
  "ai:use",
  "sales:view:own",
  "balance:view:own",
  "payout:request",
] as const;

const MODERATOR_ONLY_PERMISSIONS = [
  "moderation:review",
  "moderation:decide",
  "report:handle",
  "user:view",
  "product:view:all",
] as const;

const ADMIN_ONLY_PERMISSIONS = [
  "user:manage",
  "creator:manage",
  "taxonomy:manage",
  "order:view:all",
  "payment:view:all",
  "payout:process",
  "ledger:adjust",
  "admin:dashboard",
  "audit:view",
  "ai:usage:view",
] as const;

const ALL_PERMISSIONS = new Set<string>([
  ...BUYER_PERMISSIONS,
  ...CREATOR_ONLY_PERMISSIONS,
  ...MODERATOR_ONLY_PERMISSIONS,
  ...ADMIN_ONLY_PERMISSIONS,
]);

const ROLE_PERMISSIONS: Record<Role, ReadonlySet<string>> = {
  BUYER: new Set(BUYER_PERMISSIONS),
  CREATOR: new Set([...BUYER_PERMISSIONS, ...CREATOR_ONLY_PERMISSIONS]),
  MODERATOR: new Set([...BUYER_PERMISSIONS, ...MODERATOR_ONLY_PERMISSIONS]),
  ADMIN: ALL_PERMISSIONS,
};

export function can(role: Role, permission: string): boolean {
  if (!ALL_PERMISSIONS.has(permission)) {
    throw new Error(`Unknown permission: ${permission}`);
  }
  return ROLE_PERMISSIONS[role].has(permission);
}

/** Assert server-side; throws on denial so unauthorized actions never proceed. */
export function assertCan(role: Role, permission: string): void {
  if (!can(role, permission)) {
    throw new Error(`Forbidden: role ${role} cannot ${permission}`);
  }
}
