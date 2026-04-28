import { Prisma, Role } from "@prisma/client";
import { getVisibilityWhere } from "@/lib/visibility";
import { SPELL_PUBLICATION_STATUS } from "@/types/spell";

export const SPELL_REVIEWER_ROLES = [
  Role.SPELLWRIGHT,
  Role.ADMIN,
  Role.SUPERADMIN,
] as const;

export function canReviewSpells(role?: Role | null): boolean {
  return (
    role === Role.SPELLWRIGHT ||
    role === Role.ADMIN ||
    role === Role.SUPERADMIN
  );
}

export function getSpellBrowseWhere(role?: Role | null): Prisma.SpellWhereInput {
  return {
    AND: [
      getVisibilityWhere(role),
      { publicationStatus: { not: SPELL_PUBLICATION_STATUS.IN_REVIEW } },
    ],
  };
}

export function getSpellLibraryWhere(role?: Role | null): Prisma.SpellWhereInput {
  return {
    AND: [
      getVisibilityWhere(role),
      {
        publicationStatus: {
          in: [
            SPELL_PUBLICATION_STATUS.PUBLISHED_IN_LIBRARY,
            SPELL_PUBLICATION_STATUS.ARCHIVED_PUBLIC_LEGACY,
          ],
        },
      },
    ],
  };
}
