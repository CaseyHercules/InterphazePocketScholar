type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

const WINDOW_MS = 60_000;

function maxPerWindow(): number {
  const raw = process.env.SPELL_IMPORT_RATE_LIMIT_PER_MINUTE;
  if (raw === undefined || raw === "") return 30;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : 30;
}

export function checkSpellImportRateLimit(clientKey: string): boolean {
  const max = maxPerWindow();
  const now = Date.now();
  const existing = buckets.get(clientKey);
  if (!existing || now >= existing.resetAt) {
    buckets.set(clientKey, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (existing.count >= max) {
    return false;
  }
  existing.count += 1;
  return true;
}
