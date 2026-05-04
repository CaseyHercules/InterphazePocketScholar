import type { Role } from "@prisma/client";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";

const ADMIN_ROLES = new Set<Role | "ADMIN" | "SUPERADMIN">([
  "ADMIN",
  "SUPERADMIN",
]);

export function isAdminRole(role?: Role | string | null): boolean {
  if (!role) return false;
  return ADMIN_ROLES.has(role as Role | "ADMIN" | "SUPERADMIN");
}

export function isSuperAdminRole(role?: Role | string | null): boolean {
  return role === "SUPERADMIN";
}

export async function requireAdminUser() {
  const session = await getAuthSession();
  if (!session?.user?.id || !isAdminRole(session.user.role)) {
    return null;
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, name: true, role: true },
  });

  return user && isAdminRole(user.role) ? user : null;
}

export async function requireSuperAdminUser() {
  const session = await getAuthSession();
  if (!session?.user?.id || !isSuperAdminRole(session.user.role)) {
    return null;
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, name: true, role: true },
  });

  return user && isSuperAdminRole(user.role) ? user : null;
}
