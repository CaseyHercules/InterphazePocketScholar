import { Role } from "@prisma/client";

export const PUBLIC_VISIBILITY_FILTER = {
  visibilityRoles: { isEmpty: true },
};

export function getVisibilityWhere(role?: Role | null) {
  if (!role || role === Role.USER || role === Role.MODERATOR) {
    return PUBLIC_VISIBILITY_FILTER;
  }

  if (role === Role.SPELLWRIGHT) {
    return {
      OR: [PUBLIC_VISIBILITY_FILTER, { visibilityRoles: { has: Role.SPELLWRIGHT } }],
    };
  }

  return {};
}

export function getSkillVisibilityWhere(role?: Role | null) {
  if (!role || role === Role.USER || role === Role.MODERATOR) {
    return {
      visibilityRoles: { isEmpty: true },
      playerVisable: true,
    };
  }

  if (role === Role.SPELLWRIGHT) {
    return {
      OR: [
        { visibilityRoles: { isEmpty: true }, playerVisable: true },
        { visibilityRoles: { has: Role.SPELLWRIGHT } },
      ],
    };
  }

  return {};
}
