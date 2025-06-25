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

export function calculateStatValue(character: any, statName: string): number {
  let value = 0;

  // Primary class - full value
  if (character.primaryClass?.[statName]) {
    value += getStatFromClass(
      character.primaryClass[statName],
      character.primaryClassLvl
    );
  }

  // EP is handled separately - don't combine primary and secondary
  if (statName === "EP") {
    return value;
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
  return value;
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
