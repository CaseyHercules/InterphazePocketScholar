import { SPELL_PUBLICATION_STATUSES, SPELL_PUBLICATION_STATUS } from "@/types/spell";
import type { SpellPublicationStatus } from "@/types/spell";

export function parseSpellPublicationStatus(
  value?: string
): SpellPublicationStatus | undefined {
  if (!value) return undefined;
  if ((SPELL_PUBLICATION_STATUSES as readonly string[]).includes(value)) {
    return value as SpellPublicationStatus;
  }
  return undefined;
}

export function resolveCreatePublicationStatus(options: {
  requestedStatus?: string;
  actingAsReviewer: boolean;
}):
  | { ok: true; publicationStatus: SpellPublicationStatus }
  | { ok: false; status: number; error: string } {
  const requestedStatus = parseSpellPublicationStatus(options.requestedStatus);
  if (options.requestedStatus && !requestedStatus) {
    return { ok: false, status: 400, error: "Invalid publication status" };
  }

  if (
    !options.actingAsReviewer &&
    requestedStatus &&
    requestedStatus !== SPELL_PUBLICATION_STATUS.IN_REVIEW
  ) {
    return { ok: false, status: 403, error: "You are not allowed to publish spells" };
  }

  return {
    ok: true,
    publicationStatus:
      requestedStatus ??
      (options.actingAsReviewer
        ? SPELL_PUBLICATION_STATUS.PUBLISHED
        : SPELL_PUBLICATION_STATUS.IN_REVIEW),
  };
}

export function isApprovalPublicationStatus(
  status?: SpellPublicationStatus
): status is
  | typeof SPELL_PUBLICATION_STATUS.PUBLISHED
  | typeof SPELL_PUBLICATION_STATUS.PUBLISHED_IN_LIBRARY {
  return (
    status === SPELL_PUBLICATION_STATUS.PUBLISHED ||
    status === SPELL_PUBLICATION_STATUS.PUBLISHED_IN_LIBRARY
  );
}
