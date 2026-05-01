/**
 * Shared staff approval convention for spells today; reuse for Item.data.staffApproval,
 * purchase rows, and Request resolution metadata when those flows exist.
 * Deferred: a polymorphic AuditLog table — add only if reporting needs outgrow columns/JSON.
 */

import type { SpellPublicationStatus } from "@/types/spell";
import { isApprovalPublicationStatus } from "@/lib/spell-status";

export type StaffApprovalPayload = {
  userId: string;
  at: string;
  note?: string;
};

export function buildStaffApproval(
  actorUserId: string,
  note?: string
): StaffApprovalPayload {
  return {
    userId: actorUserId,
    at: new Date().toISOString(),
    ...(note ? { note } : {}),
  };
}

export function prismaSpellReviewColumns(actorUserId: string): {
  reviewedByUserId: string;
  reviewedAt: Date;
} {
  return {
    reviewedByUserId: actorUserId,
    reviewedAt: new Date(),
  };
}

export function spellStatusShouldRecordReviewer(
  status: SpellPublicationStatus | undefined
): boolean {
  return isApprovalPublicationStatus(status);
}
