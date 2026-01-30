/**
 * Skill Meta-Effects Type Definitions
 * 
 * These types define the structure for skill effects stored in `additionalInfo.effects`.
 * Supports stat bonuses, skill modifiers, and cross-class skill grants.
 */

/**
 * Effect that adds a bonus to a character stat when the skill is learned.
 * Example: { type: "stat_bonus", stat: "Tough", value: 5 }
 */
export type StatBonusEffect = {
  type: "stat_bonus";
  /** The stat to modify (e.g., "Tough", "Quick", "Mind", "EP", "HP", "Attack", "Defense", etc.) */
  stat: string;
  /** The value to add (positive or negative) */
  value: number;
  /** Optional condition for when the bonus applies (e.g., "vs bows", "when defending") */
  condition?: string;
  /** If false, this bonus is displayed but not added to total (conditional display). Defaults to true. */
  applyToTotal?: boolean;
};

/**
 * Effect that modifies another skill's attributes when both skills are learned.
 * Example: { type: "skill_modifier", targetSkillId: "abc123", targetField: "epCost", modifier: -2 }
 */
export type SkillModifierEffect = {
  type: "skill_modifier";
  /** The ID of the skill to modify */
  targetSkillId: string;
  /** The field on the target skill to modify */
  targetField: "epCost" | "permenentEpReduction" | "activation" | "duration";
  /** 
   * The modifier to apply (additive for numbers).
   * For numeric fields: added to the current value.
   * For string fields: replaces the value.
   */
  modifier: number | string;
};

/**
 * Effect that grants access to skills from another class.
 * Example: { type: "grant_skill", classId: "xyz789", maxTier: 2 }
 */
export type GrantSkillEffect = {
  type: "grant_skill";
  /** The class to grant skills from */
  classId: string;
  /** Optional: specific skill ID to grant (if not provided, uses maxTier) */
  skillId?: string;
  /** Optional: array of specific skill IDs to grant */
  skillIds?: string[];
  /** Optional: grant all skills up to this tier from the class */
  maxTier?: number;
};

/**
 * Effect for custom/note display (e.g., restrictions). Used by adjustments.
 * Example: { type: "restriction", note: "Unable to use heavy armor" }
 */
export type NoteEffect = {
  type: string;
  note: string;
};

/**
 * Union type for all possible effects (skills and adjustments).
 */
export type SkillEffect =
  | StatBonusEffect
  | SkillModifierEffect
  | GrantSkillEffect
  | NoteEffect;

/**
 * Structure for additionalInfo when it contains effects.
 */
export type SkillAdditionalInfo = {
  /** Array of meta-effects for this skill */
  effects?: SkillEffect[];
  /** Optional freeform notes for display in SkillViewer */
  notes?: string;
};

/**
 * Parses adjustment effectsJson and returns normalized effects.
 * Handles legacy "target" field (maps to "stat" for stat_bonus).
 */
export function getEffectsFromJson(effectsJson: unknown): SkillEffect[] {
  if (!effectsJson || typeof effectsJson !== "object") return [];
  const obj = effectsJson as Record<string, unknown>;
  const effects = obj.effects;
  if (!Array.isArray(effects)) return [];
  return effects
    .map((e): SkillEffect | null => {
      if (!e || typeof e !== "object" || typeof (e as Record<string, unknown>).type !== "string")
        return null;
      const effect = e as Record<string, unknown>;
      if (effect.type === "stat_bonus") {
        const stat = (effect.stat as string) || (effect.target as string) || "Tough";
        return {
          type: "stat_bonus",
          stat,
          value: Number(effect.value) || 0,
          condition: effect.condition as string | undefined,
          applyToTotal: effect.applyToTotal as boolean | undefined,
        };
      }
      if (effect.type === "skill_modifier" || effect.type === "grant_skill") {
        return effect as SkillEffect;
      }
      return { type: String(effect.type || "restriction"), note: String(effect.note || "") };
    })
    .filter((e): e is SkillEffect => e !== null);
}

/**
 * Creates effectsJson structure from effects array (for adjustments).
 */
export function createEffectsJson(effects: SkillEffect[]): { effects: SkillEffect[] } {
  return { effects };
}

/**
 * Safely extracts the effects array from a skill's additionalInfo field.
 * Handles all legacy formats (string, array, null, undefined).
 * 
 * @param additionalInfo - The additionalInfo field from a Skill
 * @returns Array of SkillEffect objects, or empty array if none
 */
export function getSkillEffects(additionalInfo: unknown): SkillEffect[] {
  // Null or undefined
  if (additionalInfo == null) {
    return [];
  }

  // String (legacy format - treated as notes only)
  if (typeof additionalInfo === "string") {
    return [];
  }

  // Array (legacy format - no effects)
  if (Array.isArray(additionalInfo)) {
    return [];
  }

  // Object - check for effects array
  if (typeof additionalInfo === "object") {
    const obj = additionalInfo as Record<string, unknown>;
    if (Array.isArray(obj.effects)) {
      return obj.effects as SkillEffect[];
    }
  }

  return [];
}

/**
 * Safely extracts the notes string from a skill's additionalInfo field.
 * Handles all legacy formats.
 * 
 * @param additionalInfo - The additionalInfo field from a Skill
 * @returns Notes string, or empty string if none
 */
export function getSkillNotes(additionalInfo: unknown): string {
  // Null or undefined
  if (additionalInfo == null) {
    return "";
  }

  // String (legacy format - the whole thing is notes)
  if (typeof additionalInfo === "string") {
    return additionalInfo;
  }

  // Array (legacy format - no notes)
  if (Array.isArray(additionalInfo)) {
    return "";
  }

  // Object - check for notes field
  if (typeof additionalInfo === "object") {
    const obj = additionalInfo as Record<string, unknown>;
    if (typeof obj.notes === "string") {
      return obj.notes;
    }
  }

  return "";
}

/**
 * Type guard to check if an effect is a stat bonus effect.
 */
export function isStatBonusEffect(effect: SkillEffect): effect is StatBonusEffect {
  return effect.type === "stat_bonus";
}

/**
 * Type guard to check if an effect is a skill modifier effect.
 */
export function isSkillModifierEffect(effect: SkillEffect): effect is SkillModifierEffect {
  return effect.type === "skill_modifier";
}

/**
 * Type guard to check if an effect is a grant skill effect.
 */
export function isGrantSkillEffect(effect: SkillEffect): effect is GrantSkillEffect {
  return effect.type === "grant_skill";
}

/**
 * Type guard to check if an effect is a note/custom effect.
 */
export function isNoteEffect(effect: SkillEffect): effect is NoteEffect {
  return (
    effect.type !== "stat_bonus" &&
    effect.type !== "skill_modifier" &&
    effect.type !== "grant_skill" &&
    "note" in effect
  );
}

/**
 * Creates a properly structured additionalInfo object from effects and notes.
 * 
 * @param effects - Array of skill effects
 * @param notes - Optional notes string
 * @returns SkillAdditionalInfo object
 */
export function createSkillAdditionalInfo(
  effects: SkillEffect[],
  notes?: string
): SkillAdditionalInfo {
  const result: SkillAdditionalInfo = {};
  
  if (effects.length > 0) {
    result.effects = effects;
  }
  
  if (notes && notes.trim().length > 0) {
    result.notes = notes.trim();
  }
  
  return result;
}

/**
 * List of valid stat names for stat_bonus effects.
 */
export const VALID_STATS = [
  "HP",
  "EP",
  "Attack",
  "Accuracy",
  "Defense",
  "Resistance",
  "Tough",
  "Quick",
  "Mind",
] as const;

export type ValidStat = typeof VALID_STATS[number];

/**
 * List of valid target fields for skill_modifier effects.
 */
export const SKILL_MODIFIER_FIELDS = [
  "epCost",
  "permenentEpReduction",
  "activation",
  "duration",
] as const;

export type SkillModifierField = typeof SKILL_MODIFIER_FIELDS[number];
