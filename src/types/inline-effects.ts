export type InlineEffectKind = "stat_adjustment" | "special_ability" | "dingus";

export type InlineEffect =
  | {
      type: "stat_adjustment";
      title: string;
      stat: string;
      value: number;
      condition?: string;
      applyToTotal?: boolean;
    }
  | {
      type: "special_ability";
      title: string;
      note?: string;
    }
  | {
      type: "dingus";
      title: string;
      note?: string;
    };

export const INLINE_EFFECT_KINDS: { value: InlineEffectKind; label: string }[] = [
  { value: "stat_adjustment", label: "Stat Adjustment" },
  { value: "special_ability", label: "Special Ability" },
  { value: "dingus", label: "Dingus" },
];

export function getInlineEffectsFromJson(json: unknown): InlineEffect[] {
  if (!json || typeof json !== "object") return [];
  const obj = json as Record<string, unknown>;
  const effects = obj.effects;
  if (!Array.isArray(effects)) return [];
  return effects
    .map((e): InlineEffect | null => {
      if (!e || typeof e !== "object") return null;
      const effect = e as Record<string, unknown>;
      const type = effect.type as string | undefined;
      const title = typeof effect.title === "string" ? effect.title.trim() : "";

      if (type === "stat_adjustment") {
        const stat = (effect.stat as string) || (effect.target as string) || "Tough";
        return {
          type: "stat_adjustment",
          title: title || "Stat adjustment",
          stat,
          value: Number(effect.value) || 0,
          condition: effect.condition as string | undefined,
          applyToTotal: effect.applyToTotal as boolean | undefined,
        };
      }
      if (type === "special_ability") {
        return {
          type: "special_ability",
          title: title || "Special ability",
          note: effect.note as string | undefined,
        };
      }
      if (type === "dingus") {
        return {
          type: "dingus",
          title: title || "Dingus",
          note: effect.note as string | undefined,
        };
      }

      const legacyType = (type || "").toLowerCase();
      if (legacyType === "stat_bonus") {
        const stat = (effect.stat as string) || (effect.target as string) || "Tough";
        return {
          type: "stat_adjustment",
          title: title || "Stat adjustment",
          stat,
          value: Number(effect.value) || 0,
          condition: effect.condition as string | undefined,
          applyToTotal: effect.applyToTotal as boolean | undefined,
        };
      }
      if (title || effect.note) {
        return {
          type: "dingus",
          title: title || String(effect.note || "Effect"),
          note: effect.note as string | undefined,
        };
      }
      return null;
    })
    .filter((x): x is InlineEffect => x !== null);
}

export function createInlineEffectsJson(effects: InlineEffect[]): {
  effects: InlineEffect[];
} {
  return { effects };
}

export function getDingusTitlesFromInlineEffects(json: unknown): string[] {
  return getDingusItemsFromInlineEffects(json).map((item) => item.title);
}

export type DingusDisplayItem = { title: string; note?: string };

function formatStatAdjustmentSubtitle(e: InlineEffect & { type: "stat_adjustment" }): string {
  const sign = e.value >= 0 ? "+" : "";
  const cond = e.condition?.trim();
  const stat = (e.stat ?? "Tough").trim();
  if (cond) {
    const s = stat.toLowerCase();
    const isAttAcc =
      s.includes("attack") || s.includes("accuracy") || s.includes("att") || s.includes("acc");
    return isAttAcc ? `${sign}${e.value} Att/Acc w/ ${cond}` : `${sign}${e.value} ${stat} vs ${cond}`;
  }
  return `${sign}${e.value} ${stat}`;
}

export function getDingusItemsFromInlineEffects(json: unknown): DingusDisplayItem[] {
  const effects = getInlineEffectsFromJson(json);
  const seen = new Set<string>();
  const items: DingusDisplayItem[] = [];
  for (const e of effects) {
    if (e.type === "special_ability") continue;
    let note: string | undefined;
    if (e.type === "dingus") {
      note = (e as { note?: string }).note;
    } else if (e.type === "stat_adjustment") {
      note = formatStatAdjustmentSubtitle(e);
    }
    const title = e.title.trim() || (note && note.trim()) || "Effect";
    if (!title.trim()) continue;
    const key = title + "|" + (note || "");
    if (seen.has(key)) continue;
    seen.add(key);
    items.push({
      title: title.trim(),
      note: note && note.trim() && note.trim() !== title.trim() ? note.trim() : undefined,
    });
  }
  return items.sort((a, b) => a.title.localeCompare(b.title));
}

export function getSpecialAbilitiesFromInlineEffects(
  json: unknown
): (InlineEffect & { type: "special_ability" })[] {
  return getInlineEffectsFromJson(json).filter(
    (e): e is InlineEffect & { type: "special_ability" } => e.type === "special_ability"
  );
}
