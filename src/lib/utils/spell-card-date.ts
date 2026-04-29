type SpellTimestamps = {
  createdAt?: string | Date | null;
  reworkedAt?: string | Date | null;
};

function seasonFromMonth(monthIndex: number): "Winter" | "Spring" | "Summer" | "Fall" {
  if (monthIndex === 11 || monthIndex <= 1) {
    return "Winter";
  }
  if (monthIndex <= 4) {
    return "Spring";
  }
  if (monthIndex <= 7) {
    return "Summer";
  }
  return "Fall";
}

export function formatSpellCardSeasonYear(
  value: string | Date | undefined | null
): string {
  if (value == null) {
    return "—";
  }
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) {
    return "—";
  }
  const season = seasonFromMonth(d.getMonth());
  const yy = String(d.getFullYear()).slice(-2);
  return `${season} ${yy}`;
}

export function mostRecentSpellCardSeasonYear(spell: SpellTimestamps): string | null {
  const ms: number[] = [];
  for (const value of [spell.createdAt, spell.reworkedAt]) {
    if (value == null) {
      continue;
    }
    const d = typeof value === "string" ? new Date(value) : value;
    const t = d.getTime();
    if (!Number.isNaN(t)) {
      ms.push(t);
    }
  }
  if (ms.length === 0) {
    return null;
  }
  const formatted = formatSpellCardSeasonYear(new Date(Math.max(...ms)));
  return formatted === "—" ? null : formatted;
}
