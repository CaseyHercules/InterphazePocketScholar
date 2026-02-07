export const ALIGNMENT_MIN = 1;
export const ALIGNMENT_MAX = 5;
export const ALIGNMENT_MAX_TICKS = 4;

export type AlignmentData = [number, number, number];

function inRange(
  value: number,
  min: number,
  max: number
): value is number {
  return Number.isInteger(value) && value >= min && value <= max;
}

export function parseAlignmentFromJson(json: unknown): AlignmentData | null {
  if (!Array.isArray(json) || json.length !== 3) return null;
  const [alignment, upTicks, downTicks] = json as [unknown, unknown, unknown];
  if (
    !inRange(Number(alignment), ALIGNMENT_MIN, ALIGNMENT_MAX) ||
    !inRange(Number(upTicks), 0, ALIGNMENT_MAX_TICKS) ||
    !inRange(Number(downTicks), 0, ALIGNMENT_MAX_TICKS)
  ) {
    return null;
  }
  return [
    Number(alignment),
    Number(upTicks),
    Number(downTicks),
  ];
}

export function isValidAlignmentData(
  data: [number, number, number]
): data is AlignmentData {
  return (
    inRange(data[0], ALIGNMENT_MIN, ALIGNMENT_MAX) &&
    inRange(data[1], 0, ALIGNMENT_MAX_TICKS) &&
    inRange(data[2], 0, ALIGNMENT_MAX_TICKS)
  );
}
