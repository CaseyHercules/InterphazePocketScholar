import { getCharacterRace } from "./adjustments";

type AdjustmentEffect = {
  type?: string;
  stat?: string;
  value?: number;
  condition?: string;
  applyToTotal?: boolean;
  note?: string;
  optional?: boolean;
  targetSkillId?: string;
  targetField?: string;
  modifier?: number | string;
  classId?: string;
  maxTier?: number;
};

type AdjustmentEntry = {
  id?: string;
  title?: string;
  effectsJson?: { effects?: AdjustmentEffect[] };
};

export type StatDisplayItem = {
  label: string;
  value: number;
  formatted: string;
  optional: boolean;
};

export type AbilityDisplayItem = {
  text: string;
  optional: boolean;
};

export type RacialAdjustmentData = {
  race: string | null;
  statItems: StatDisplayItem[];
  abilityItems: AbilityDisplayItem[];
  hasContent: boolean;
};

function isOptionalEffect(effect: AdjustmentEffect): boolean {
  if (typeof effect.optional === "boolean") return effect.optional;
  const note = effect.note?.trim() ?? "";
  const stat = String(effect.stat ?? "").trim();
  return (
    (note.length >= 4 && note.startsWith("^^") && note.endsWith("^^")) ||
    (stat.length >= 4 && stat.startsWith("^^") && stat.endsWith("^^"))
  );
}

function stripOptionalMarkers(text: string): string {
  return text.replace(/^\^\^|\^\^$/g, "").trim();
}

function formatStatBonus(effect: AdjustmentEffect): string {
  const stat = String(effect.stat ?? "Stat").trim();
  const value =
    typeof effect.value === "number"
      ? effect.value >= 0
        ? `+${effect.value}`
        : `${effect.value}`
      : "+0";
  const condition = effect.condition?.trim();
  if (condition) {
    const s = stat.toLowerCase();
    const isAttAcc =
      s.includes("attack") || s.includes("accuracy") || s.includes("att") || s.includes("acc");
    return isAttAcc ? `${value} Att/Acc w/ ${condition}` : `${value} ${stat} vs ${condition}`;
  }
  return `${value} ${stat}`;
}

function formatAbilityEffect(effect: AdjustmentEffect): string {
  if (effect.note && String(effect.note).trim()) {
    return stripOptionalMarkers(String(effect.note).trim());
  }
  if (effect.type === "skill_modifier") {
    const field = effect.targetField ?? "skill";
    const mod =
      typeof effect.modifier === "number"
        ? effect.modifier >= 0
          ? `+${effect.modifier}`
          : `${effect.modifier}`
        : effect.modifier ?? "";
    return `Modify skill ${field}: ${mod}`;
  }
  if (effect.type === "grant_skill") {
    const tier = effect.maxTier;
    return tier ? `Grant skills up to Tier ${tier}` : "Grant skill access";
  }
  if (effect.type === "pick_skill_by_tier") {
    const tier = effect.maxTier;
    return tier
      ? `Pick any skill up to Tier ${tier} from your class(es)`
      : "Pick skill by tier";
  }
  return effect.type ? String(effect.type) : "Effect";
}

export function getRacialAdjustmentData(character: {
  Attributes?: unknown;
  adjustments?: Array<{ adjustment?: AdjustmentEntry } | AdjustmentEntry>;
}): RacialAdjustmentData {
  const statItems: StatDisplayItem[] = [];
  const abilityItems: AbilityDisplayItem[] = [];

  const entries = Array.isArray(character?.adjustments)
    ? character.adjustments
        .map((entry: { adjustment?: AdjustmentEntry } | AdjustmentEntry) =>
          "adjustment" in entry ? entry.adjustment : entry
        )
        .filter(Boolean) as AdjustmentEntry[]
    : [];

  const race =
    getCharacterRace(character?.Attributes) ??
    (entries.length > 0 && typeof entries[0]?.title === "string" && entries[0].title.trim()
      ? entries[0].title.trim()
      : null);

  for (const adjustment of entries) {
    const effects = adjustment.effectsJson?.effects ?? [];
    if (!Array.isArray(effects)) continue;

    for (const effect of effects) {
      const optional = isOptionalEffect(effect);

      if (effect.type === "stat_bonus") {
        const value = typeof effect.value === "number" ? effect.value : 0;
        const stat = String(effect.stat ?? "Stat").trim();
        const condition = effect.condition?.trim();
        const label = condition
          ? `Att/Acc w/ ${condition}`
          : stat.includes("HP")
            ? "HP"
            : stat.includes("Energy")
              ? "Energy Point"
              : stat;
        statItems.push({
          label,
          value,
          formatted: formatStatBonus(effect),
          optional,
        });
        continue;
      }

      const abilityText = formatAbilityEffect(effect);
      if (abilityText && abilityText !== "Effect") {
        abilityItems.push({ text: abilityText, optional });
      }
    }
  }

  return {
    race,
    statItems,
    abilityItems,
    hasContent: statItems.length > 0 || abilityItems.length > 0,
  };
}
