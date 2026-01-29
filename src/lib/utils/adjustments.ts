type AdjustmentLike = {
  title?: unknown;
  tags?: unknown;
};

type TagRecord = Record<string, unknown>;

export function normalizeRace(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed.toLowerCase() : null;
}

export function getCharacterRace(attributes: unknown): string | null {
  if (!attributes || typeof attributes !== "object") return null;
  const raceValue = (attributes as TagRecord).race;
  if (typeof raceValue !== "string") return null;
  return raceValue.trim().length > 0 ? raceValue.trim() : null;
}

export function adjustmentMatchesRace(
  adjustment: AdjustmentLike | null | undefined,
  race: string
): boolean {
  const normalizedRace = normalizeRace(race);
  if (!normalizedRace || !adjustment) return false;

  const titleMatch = normalizeRace(adjustment.title) === normalizedRace;
  if (titleMatch) return true;

  const tags = adjustment.tags;
  if (Array.isArray(tags)) {
    return tags.some((value) => normalizeRace(value) === normalizedRace);
  }

  if (!tags || typeof tags !== "object") return false;

  const tagRecord = tags as TagRecord;
  const raceTag = normalizeRace(tagRecord.race);
  if (raceTag === normalizedRace) return true;

  const raceIdTag = normalizeRace(tagRecord.raceId);
  if (raceIdTag === normalizedRace) return true;

  const racesTag = tagRecord.races;
  if (Array.isArray(racesTag)) {
    return racesTag.some((value) => normalizeRace(value) === normalizedRace);
  }

  return false;
}
