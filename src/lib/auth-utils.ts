import { Role } from "@prisma/client";
import { Session } from "next-auth";

export function hasRole(session: Session | null, role: Role): boolean {
  return session?.user?.role === role;
}

export function hasAnyRole(session: Session | null, roles: Role[]): boolean {
  return !!session?.user?.role && roles.includes(session.user.role);
}

export function isAdmin(session: Session | null): boolean {
  return session?.user?.isAdmin ?? false;
}

export function isRoot(session: Session | null): boolean {
  return session?.user?.isRoot ?? false;
}

export function isSpellWright(session: Session | null): boolean {
  return session?.user?.isSpellWright ?? false;
}

export function isModerator(session: Session | null): boolean {
  return session?.user?.isModerator ?? false;
}

export function canEditContent(session: Session | null): boolean {
  return isAdmin(session) || isRoot(session);
}

export function canModerateContent(session: Session | null): boolean {
  return isModerator(session) || isAdmin(session) || isRoot(session);
}

export function canEditSpells(session: Session | null): boolean {
  return isSpellWright(session) || isAdmin(session) || isRoot(session);
}
