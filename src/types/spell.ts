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

export const SPELL_PUBLICATION_STATUSES = [
  "IN_REVIEW",
  "PUBLISHED",
  "PUBLISHED_IN_LIBRARY",
  "ARCHIVED_PRIVATE",
  "ARCHIVED_PUBLIC_LEGACY",
] as const;

export type SpellPublicationStatus = (typeof SPELL_PUBLICATION_STATUSES)[number];

export const SPELL_PUBLICATION_STATUS = {
  IN_REVIEW: "IN_REVIEW",
  PUBLISHED: "PUBLISHED",
  PUBLISHED_IN_LIBRARY: "PUBLISHED_IN_LIBRARY",
  ARCHIVED_PRIVATE: "ARCHIVED_PRIVATE",
  ARCHIVED_PUBLIC_LEGACY: "ARCHIVED_PUBLIC_LEGACY",
} as const satisfies Record<SpellPublicationStatus, SpellPublicationStatus>;

export const SPELL_PUBLICATION_STATUS_LABELS: Record<
  SpellPublicationStatus,
  string
> = {
  IN_REVIEW: "In Review",
  PUBLISHED: "Published (Private)",
  PUBLISHED_IN_LIBRARY: "Published (Library)",
  ARCHIVED_PRIVATE: "Archived (Private)",
  ARCHIVED_PUBLIC_LEGACY: "Archived (Public Legacy)",
};

export interface SpellData {
  castingTime?: string;
  effect?: string;
  range?: string;
  areaOfEffect?: string;
  duration?: string;
  save?: string;
  method?: string;
  descriptor?: string[]; // Array of label strings
}

export interface Spell {
  id?: string;
  title: string;
  type?: string;
  description?: string;
  level: number;
  author?: string;
  characterId?: string;
  publicationStatus?: SpellPublicationStatus;
  supersedesSpellId?: string;
  reworkedAt?: string | Date;
  data?: SpellData;
  visibilityRoles?: string[];
}

export interface CreateSpellInput {
  title: string;
  type?: string;
  description?: string;
  level: number;
  author?: string;
  characterId?: string;
  publicationStatus?: SpellPublicationStatus;
  supersedesSpellId?: string;
  reworkedAt?: string | Date;
  data?: SpellData;
  visibilityRoles?: string[];
}

export interface UpdateSpellInput extends Partial<CreateSpellInput> {
  id: string;
}
