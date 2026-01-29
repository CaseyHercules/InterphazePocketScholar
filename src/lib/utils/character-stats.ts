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
  skillReductions: {
    primary: number;
    secondary: number;
    total: number;
  };
  total: number;
};

export function calculateStatValue(character: any, statName: string): number {
  let value = 0;

  const normalizedStat = statName.trim().toLowerCase();
  const adjustmentValue = getAdjustmentStatBonus(character, normalizedStat).total;

  // Primary class - full value
  if (character.primaryClass?.[statName]) {
    value += getStatFromClass(
      character.primaryClass[statName],
      character.primaryClassLvl
    );
  }

  // EP is handled separately - don't combine primary and secondary
  if (statName === "EP") {
    return value + adjustmentValue;
  }

  // Secondary class - half value (multiclass penalty), rounded up
  if (
    character.secondaryClass?.[statName] &&
    character.secondaryClassLvl > 0 &&
    !character.secondaryClass.Title?.toLowerCase().includes("none")
  ) {
    const secondaryValue =
      getStatFromClass(
        character.secondaryClass[statName],
        character.secondaryClassLvl
      ) - getStatFromClass(character.secondaryClass[statName], 1);
    value += Math.ceil(secondaryValue / 2);
  }
  return value + adjustmentValue;
}

export function getEPValues(character: any): {
  primary: number;
  secondary: number;
} {
  const primaryEP = character.primaryClass?.EP
    ? getStatFromClass(character.primaryClass.EP, character.primaryClassLvl)
    : 0;

  const secondaryEP =
    character.secondaryClass?.EP &&
    character.secondaryClassLvl > 0 &&
    !character.secondaryClass.Title?.toLowerCase().includes("none")
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

export function getStatBreakdown(
  character: any,
  statName: string
): StatBreakdown {
  const normalizedStat = statName.trim().toLowerCase();
  const adjustments = getAdjustmentStatBonus(character, normalizedStat);

  let primary = 0;
  let secondary = 0;

  if (character.primaryClass?.[statName]) {
    primary = getStatFromClass(
      character.primaryClass[statName],
      character.primaryClassLvl
    );
  }

  if (
    character.secondaryClass?.[statName] &&
    character.secondaryClassLvl > 0 &&
    !character.secondaryClass.Title?.toLowerCase().includes("none")
  ) {
    const secondaryValue =
      getStatFromClass(
        character.secondaryClass[statName],
        character.secondaryClassLvl
      ) - getStatFromClass(character.secondaryClass[statName], 1);
    secondary = Math.ceil(secondaryValue / 2);
  }

  const total = primary + secondary + adjustments.total;

  return {
    primary,
    secondary,
    adjustments: adjustments.items,
    conditionalAdjustments: adjustments.conditionalItems,
    total,
  };
}

export function getEPBreakdown(character: any): EPBreakdown {
  const { primary, secondary } = getEPValues(character);
  const adjustments = getAdjustmentStatBonus(character, "ep");
  const skillReductions = getSkillEpReductions(character);
  const total = primary + secondary + adjustments.total - skillReductions.total;

  return {
    primary,
    secondary,
    adjustments: adjustments.items,
    conditionalAdjustments: adjustments.conditionalItems,
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
