// These are the valid spell types for the form dropdown
export const SPELL_TYPES = ["Mage", "Psion", "Cleric", "Druid", "Other"];

// Predefined descriptors for spells
export const SPELL_DESCRIPTORS = [
  "Air",
  "Earth",
  "Fire",
  "Water",
  "Ice",
  "Lightning",
  "Acid",
  "Magma",
  "Plant",
  "Force",
  "War",
  "Peace",
  "Good",
  "Evil",
  "Life",
  "Death",
  "Fate",
  "Knowledge",
  "Luck",
  "Order",
  "Chaos",
  "Obfuscation",
] as const;

export interface SpellData {
  castingTime?: string;
  effect?: string;
  range?: string;
  areaOfEffect?: string;
  duration?: string;
  save?: string;
  method?: string;
  descriptor?: string[]; // Array of label strings
  isInSpellLibrary?: boolean;
}

export interface Spell {
  id?: string;
  title: string;
  type?: string;
  description?: string;
  level: number;
  characterId?: string;
  data?: SpellData;
}

export interface CreateSpellInput {
  title: string;
  type?: string;
  description?: string;
  level: number;
  characterId?: string;
  data?: SpellData;
}

export interface UpdateSpellInput extends Partial<CreateSpellInput> {
  id: string;
}
