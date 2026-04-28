export const SPELL_CARD_STYLE_OPTIONS = [
  { id: "classic", label: "Classic Frame" },
  { id: "minimal", label: "Minimal Slate" },
  { id: "tome", label: "Tome Serif" },
  { id: "arcane", label: "Arcane Glow" },
  { id: "industrial", label: "Industrial Grid" },
] as const;

export type SpellCardStyleId = (typeof SPELL_CARD_STYLE_OPTIONS)[number]["id"];

export type PrintTemplateId = "spell";
