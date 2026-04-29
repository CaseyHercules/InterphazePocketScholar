import { Role } from "@prisma/client";
import { prisma } from "@/lib/db";
import {
  CreateSpellInput,
} from "@/types/spell";
import { resolveCreatePublicationStatus } from "@/lib/spell-status";

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

  const reviewer = options.actingAsReviewer;
  const publicationDecision = resolveCreatePublicationStatus({
    requestedStatus: publicationStatus,
    actingAsReviewer: reviewer,
  });
  if (!publicationDecision.ok) {
    return publicationDecision;
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
      publicationStatus: publicationDecision.publicationStatus,
    },
  });

  return { ok: true, spell };
}
