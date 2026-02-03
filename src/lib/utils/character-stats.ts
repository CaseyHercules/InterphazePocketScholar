import {
  getSkillEffects,
  getEffectsFromJson,
  isStatBonusEffect,
  isSkillModifierEffect,
  type SkillEffect,
  type StatBonusEffect,
  type SkillModifierEffect,
} from "@/types/skill-effects";

function getStatFromClass(classStat: any, level: number): number {
  if (!classStat) return 0;

  // Array format (preferred): [level1, level2, level3, ...]
  if (Array.isArray(classStat)) {
    const index = level - 1; // Convert 1-based level to 0-based index
    return index >= 0 && index < classStat.length && classStat[index] != null
      ? parseInt(classStat[index].toString())
      : 0;
  }

  // Object format (legacy): {1: value, 2: value, ...}
  if (typeof classStat === "object") {
    return classStat[level.toString()]
      ? parseInt(classStat[level.toString()])
      : 0;
  }

  // Flat value (not level-dependent)
  if (typeof classStat === "string" || typeof classStat === "number") {
    return parseInt(classStat.toString());
  }

  return 0;
}

function hasValidSecondaryClass(character: any): boolean {
  return !!(
    character.secondaryClass &&
    character.secondaryClassLvl > 0 &&
    !String(character.secondaryClass.Title || "").toLowerCase().includes("none")
  );
}

function getStatValues(
  character: any,
  statName: string
): { primary: number; secondary: number } {
  let primary = 0;
  let secondary = 0;

  if (character.primaryClass?.[statName]) {
    primary = getStatFromClass(
      character.primaryClass[statName],
      character.primaryClassLvl
    );
  }

  if (
    hasValidSecondaryClass(character) &&
    character.secondaryClass?.[statName]
  ) {
    const secondaryValue =
      getStatFromClass(
        character.secondaryClass[statName],
        character.secondaryClassLvl
      ) - getStatFromClass(character.secondaryClass[statName], 1);
    secondary = Math.ceil(secondaryValue / 2);
  }

  return { primary, secondary };
}

export type StatAdjustmentBreakdown = {
  title: string;
  value: number;
  condition?: string;
};

export type StatBreakdown = {
  primary: number;
  secondary: number;
  adjustments: StatAdjustmentBreakdown[];
  conditionalAdjustments: StatAdjustmentBreakdown[];
  total: number;
};

export type EPBreakdown = {
  primary: number;
  secondary: number;
  adjustments: StatAdjustmentBreakdown[];
  conditionalAdjustments: StatAdjustmentBreakdown[];
  skillBonuses: StatAdjustmentBreakdown[];
  conditionalSkillBonuses: StatAdjustmentBreakdown[];
  skillReductions: {
    primary: number;
    secondary: number;
    total: number;
  };
  total: number;
};

export function calculateStatValue(character: any, statName: string): number {
  const normalizedStat = statName.trim().toLowerCase();
  const adjustmentValue = getAdjustmentStatBonus(character, normalizedStat).total;
  const skillBonusValue = getSkillStatBonuses(character, normalizedStat).total;
  const { primary, secondary } = getStatValues(
    character,
    statName
  );

  if (statName === "EP") {
    return primary + adjustmentValue + skillBonusValue;
  }
  return primary + secondary + adjustmentValue + skillBonusValue;
}

export function getEPValues(character: any): {
  primary: number;
  secondary: number;
} {
  const primaryEP = character.primaryClass?.EP
    ? getStatFromClass(character.primaryClass.EP, character.primaryClassLvl)
    : 0;

  const secondaryEP =
    hasValidSecondaryClass(character) && character.secondaryClass?.EP
      ? getStatFromClass(
          character.secondaryClass.EP,
          character.secondaryClassLvl
        )
      : 0;

  return { primary: primaryEP, secondary: secondaryEP };
}

export function getSkillEpReductions(character: any): {
  primary: number;
  secondary: number;
  total: number;
} {
  const primarySkills = Array.isArray(character?.primarySkills)
    ? character.primarySkills
    : [];
  const secondarySkills = Array.isArray(character?.secondarySkills)
    ? character.secondarySkills
    : [];

  const sumReduction = (skills: any[]) =>
    skills.reduce((sum, skill) => {
      const value = Number(skill?.permenentEpReduction);
      if (!Number.isFinite(value) || value <= 0) return sum;
      return sum + value;
    }, 0);

  const primary = sumReduction(primarySkills);
  const secondary = sumReduction(secondarySkills);

  return {
    primary,
    secondary,
    total: primary + secondary,
  };
}

export function getEPAvailableValues(character: any): {
  primary: number;
  secondary: number;
} {
  const base = getEPValues(character);
  const reductions = getSkillEpReductions(character);

  return {
    primary: Math.max(0, base.primary - reductions.primary),
    secondary: Math.max(0, base.secondary - reductions.secondary),
  };
}

type AdjustmentEffect = {
  type?: unknown;
  target?: unknown;
  value?: unknown;
  stat?: unknown;
  condition?: unknown;
  applyToTotal?: unknown;
};

function normalizeStatName(stat: string): string {
  return stat.toLowerCase().trim().replace(/\\s+/g, " ");
}

export type StatBreakdownExtended = StatBreakdown & {
  skillBonuses: StatAdjustmentBreakdown[];
  conditionalSkillBonuses: StatAdjustmentBreakdown[];
};

export function getStatBreakdown(
  character: any,
  statName: string
): StatBreakdownExtended {
  const normalizedStat = statName.trim().toLowerCase();
  const adjustments = getAdjustmentStatBonus(character, normalizedStat);
  const skillBonuses = getSkillStatBonuses(character, normalizedStat);
  const { primary, secondary } = getStatValues(
    character,
    statName
  );
  const total = primary + secondary + adjustments.total + skillBonuses.total;

  return {
    primary,
    secondary,
    adjustments: adjustments.items,
    conditionalAdjustments: adjustments.conditionalItems,
    skillBonuses: skillBonuses.items,
    conditionalSkillBonuses: skillBonuses.conditionalItems,
    total,
  };
}

export function getEPBreakdown(character: any): EPBreakdown {
  const { primary, secondary } = getEPValues(character);
  const adjustments = getAdjustmentStatBonus(character, "ep");
  const skillBonuses = getSkillStatBonuses(character, "ep");
  const skillReductions = getSkillEpReductions(character);
  const total = primary + secondary + adjustments.total + skillBonuses.total - skillReductions.total;

  return {
    primary,
    secondary,
    adjustments: adjustments.items,
    conditionalAdjustments: adjustments.conditionalItems,
    skillBonuses: skillBonuses.items,
    conditionalSkillBonuses: skillBonuses.conditionalItems,
    skillReductions,
    total,
  };
}

function getAdjustmentStatBonus(
  character: any,
  normalizedStat: string
): {
  total: number;
  items: StatAdjustmentBreakdown[];
  conditionalItems: StatAdjustmentBreakdown[];
} {
  const adjustments = Array.isArray(character?.adjustments)
    ? character.adjustments
    : [];

  let total = 0;
  const items: StatAdjustmentBreakdown[] = [];
  const conditionalItems: StatAdjustmentBreakdown[] = [];

  for (const entry of adjustments) {
    const adjustment = entry?.adjustment ?? entry;
    const effects = (adjustment?.effectsJson as { effects?: unknown })?.effects;
    if (!Array.isArray(effects)) continue;

    for (const effect of effects as AdjustmentEffect[]) {
      if (!effect || typeof effect !== "object") continue;
      const type =
        typeof effect.type === "string" ? effect.type.toLowerCase() : "";
      if (type !== "stat_bonus") continue;

      const statRaw = typeof effect.stat === "string" ? effect.stat.trim() : "";
      if (!statRaw) continue;

      const stat = normalizeStatName(statRaw);
      if (!stat || stat !== normalizedStat) continue;

      const value = Number(effect.value);
      if (!Number.isFinite(value)) continue;

      const condition =
        typeof effect.condition === "string" && effect.condition.trim()
          ? effect.condition.trim()
          : undefined;
      const applyToTotal =
        typeof effect.applyToTotal === "boolean" ? effect.applyToTotal : true;

      const breakdownItem = {
        title:
          typeof adjustment?.title === "string" && adjustment.title.trim()
            ? adjustment.title.trim()
            : "Adjustment",
        value,
        condition,
      };

      if (condition || !applyToTotal) {
        conditionalItems.push(breakdownItem);
      } else {
        total += value;
        items.push(breakdownItem);
      }
    }
  }

  return { total, items, conditionalItems };
}

/**
 * Gets stat bonuses from learned skills' additionalInfo.effects
 */
function getSkillStatBonuses(
  character: any,
  normalizedStat: string
): {
  total: number;
  items: StatAdjustmentBreakdown[];
  conditionalItems: StatAdjustmentBreakdown[];
} {
  const primarySkills = Array.isArray(character?.primarySkills)
    ? character.primarySkills
    : [];
  const secondarySkills = Array.isArray(character?.secondarySkills)
    ? character.secondarySkills
    : [];
  const allSkills = [...primarySkills, ...secondarySkills];

  let total = 0;
  const items: StatAdjustmentBreakdown[] = [];
  const conditionalItems: StatAdjustmentBreakdown[] = [];

  for (const skill of allSkills) {
    const effects = getSkillEffects(skill?.additionalInfo);

    for (const effect of effects) {
      if (!isStatBonusEffect(effect)) continue;

      const statRaw = typeof effect.stat === "string" ? effect.stat.trim() : "";
      if (!statRaw) continue;

      const stat = normalizeStatName(statRaw);
      if (!stat || stat !== normalizedStat) continue;

      const value = Number(effect.value);
      if (!Number.isFinite(value)) continue;

      const condition =
        typeof effect.condition === "string" && effect.condition.trim()
          ? effect.condition.trim()
          : undefined;
      const applyToTotal =
        typeof effect.applyToTotal === "boolean" ? effect.applyToTotal : true;

      const breakdownItem = {
        title:
          typeof skill?.title === "string" && skill.title.trim()
            ? `Skill: ${skill.title.trim()}`
            : "Skill",
        value,
        condition,
      };

      if (condition || !applyToTotal) {
        conditionalItems.push(breakdownItem);
      } else {
        total += value;
        items.push(breakdownItem);
      }
    }
  }

  return { total, items, conditionalItems };
}

function applySkillModifier(
  modifiedValue: string | number,
  effect: SkillModifierEffect,
  field: "epCost" | "permenentEpReduction" | "activation" | "duration"
): string | number {
  if (field === "permenentEpReduction") {
    const numericBase = Number(modifiedValue) || 0;
    const numericModifier = Number(effect.modifier) || 0;
    return Math.max(0, numericBase + numericModifier);
  }
  if (field === "epCost") {
    const numericBase = Number(modifiedValue);
    const numericModifier = Number(effect.modifier);
    if (!isNaN(numericBase) && !isNaN(numericModifier)) {
      return String(Math.max(0, numericBase + numericModifier));
    }
    if (typeof effect.modifier === "string") {
      return effect.modifier;
    }
  }
  if (field === "activation" || field === "duration") {
    if (typeof effect.modifier === "string") {
      return effect.modifier;
    }
  }
  return modifiedValue;
}

/**
 * Gets effective skill value after applying modifiers from learned skills and adjustments.
 * Use this when displaying skill epCost, permenentEpReduction, etc.
 */
export function getEffectiveSkillValue(
  skill: any,
  character: any,
  field: "epCost" | "permenentEpReduction" | "activation" | "duration"
): string | number {
  const baseValue = skill?.[field];
  
  if (baseValue == null) {
    return field === "permenentEpReduction" ? 0 : "";
  }

  const primarySkills = Array.isArray(character?.primarySkills)
    ? character.primarySkills
    : [];
  const secondarySkills = Array.isArray(character?.secondarySkills)
    ? character.secondarySkills
    : [];
  const allSkills = [...primarySkills, ...secondarySkills];

  let modifiedValue = baseValue;
  const skillId = skill?.id;

  if (!skillId) return modifiedValue;

  // Apply skill_modifier effects from learned skills
  for (const sourceSkill of allSkills) {
    if (sourceSkill?.id === skillId) continue;
    const effects = getSkillEffects(sourceSkill?.additionalInfo);
    for (const effect of effects) {
      if (!isSkillModifierEffect(effect)) continue;
      if (effect.targetSkillId !== skillId || effect.targetField !== field) continue;
      modifiedValue = applySkillModifier(modifiedValue, effect, field);
    }
  }

  // Apply skill_modifier effects from adjustments
  const adjustments = Array.isArray(character?.adjustments) ? character.adjustments : [];
  for (const entry of adjustments) {
    const adjustment = entry?.adjustment ?? entry;
    const effects = getEffectsFromJson(adjustment?.effectsJson);
    for (const effect of effects) {
      if (!isSkillModifierEffect(effect)) continue;
      if (effect.targetSkillId !== skillId || effect.targetField !== field) continue;
      modifiedValue = applySkillModifier(modifiedValue, effect, field);
    }
  }

  return modifiedValue;
}
