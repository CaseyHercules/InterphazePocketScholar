import test from "node:test";
import assert from "node:assert/strict";
import { SPELL_PUBLICATION_STATUS } from "@/types/spell";
import {
  isApprovalPublicationStatus,
  parseSpellPublicationStatus,
  resolveCreatePublicationStatus,
} from "@/lib/spell-status";

test("parseSpellPublicationStatus accepts known statuses", () => {
  assert.equal(
    parseSpellPublicationStatus(SPELL_PUBLICATION_STATUS.PUBLISHED),
    SPELL_PUBLICATION_STATUS.PUBLISHED
  );
  assert.equal(parseSpellPublicationStatus("INVALID_STATUS"), undefined);
});

test("resolveCreatePublicationStatus enforces reviewer rules", () => {
  const nonReviewer = resolveCreatePublicationStatus({
    requestedStatus: SPELL_PUBLICATION_STATUS.PUBLISHED,
    actingAsReviewer: false,
  });
  assert.equal(nonReviewer.ok, false);

  const reviewer = resolveCreatePublicationStatus({
    requestedStatus: SPELL_PUBLICATION_STATUS.PUBLISHED,
    actingAsReviewer: true,
  });
  assert.equal(reviewer.ok, true);
  if (reviewer.ok) {
    assert.equal(reviewer.publicationStatus, SPELL_PUBLICATION_STATUS.PUBLISHED);
  }
});

test("isApprovalPublicationStatus only allows approval targets", () => {
  assert.equal(isApprovalPublicationStatus(SPELL_PUBLICATION_STATUS.PUBLISHED), true);
  assert.equal(
    isApprovalPublicationStatus(SPELL_PUBLICATION_STATUS.PUBLISHED_IN_LIBRARY),
    true
  );
  assert.equal(isApprovalPublicationStatus(SPELL_PUBLICATION_STATUS.IN_REVIEW), false);
});
