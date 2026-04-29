import { Role } from "@prisma/client";
import { prisma } from "@/lib/db";
import {
  CreateSpellInput,
  SPELL_PUBLICATION_STATUS,
  SPELL_PUBLICATION_STATUSES,
  type SpellPublicationStatus,
} from "@/types/spell";

export function parseSpellPublicationStatus(
  value?: string
): SpellPublicationStatus | undefined {
  if (!value) return undefined;
  if ((SPELL_PUBLICATION_STATUSES as readonly string[]).includes(value)) {
    return value as SpellPublicationStatus;
  }
  return undefined;
}

export type CreateSpellRecordOptions = {
  actingAsReviewer: boolean;
};

export type CreateSpellRecordFailure = {
  ok: false;
  status: number;
  error: string;
};

export type CreateSpellRecordSuccess = {
  ok: true;
  spell: Awaited<ReturnType<typeof prisma.spell.create>>;
};

export async function createSpellRecord(
  body: CreateSpellInput,
  options: CreateSpellRecordOptions
): Promise<CreateSpellRecordSuccess | CreateSpellRecordFailure> {
  const {
    title,
    type,
    data,
    description,
    level,
    characterId,
    visibilityRoles,
    author,
    publicationStatus,
    supersedesSpellId,
    reworkedAt,
  } = body;

  if (!title || level === undefined) {
    return {
      ok: false,
      status: 400,
      error: "Title and level are required",
    };
  }

  const requestedStatus = parseSpellPublicationStatus(publicationStatus);
  if (publicationStatus && !requestedStatus) {
    return {
      ok: false,
      status: 400,
      error: "Invalid publication status",
    };
  }

  const reviewer = options.actingAsReviewer;
  if (
    !reviewer &&
    requestedStatus &&
    requestedStatus !== SPELL_PUBLICATION_STATUS.IN_REVIEW
  ) {
    return {
      ok: false,
      status: 403,
      error: "You are not allowed to publish spells",
    };
  }

  const spell = await prisma.spell.create({
    data: {
      title,
      type,
      data: data ? JSON.parse(JSON.stringify(data)) : undefined,
      description,
      level,
      author: author || null,
      characterId: characterId || null,
      supersedesSpellId: supersedesSpellId || null,
      reworkedAt: reworkedAt ? new Date(reworkedAt) : null,
      visibilityRoles: (visibilityRoles ?? []) as Role[],
      publicationStatus:
        requestedStatus ??
        (reviewer
          ? SPELL_PUBLICATION_STATUS.PUBLISHED
          : SPELL_PUBLICATION_STATUS.IN_REVIEW),
    },
  });

  return { ok: true, spell };
}
