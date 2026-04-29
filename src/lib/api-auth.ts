import type { Role } from "@prisma/client";

const ADMIN_ROLES = new Set<Role | "ADMIN" | "SUPERADMIN">([
  "ADMIN",
  "SUPERADMIN",
]);

export function isAdminRole(role?: Role | string | null): boolean {
  if (!role) return false;
  return ADMIN_ROLES.has(role as Role | "ADMIN" | "SUPERADMIN");
}
