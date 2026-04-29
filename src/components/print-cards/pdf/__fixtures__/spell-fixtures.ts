import type { Spell } from "@/types/spell";

export const defaultPdfLayout = {
  paperSize: "letter" as const,
  marginInches: 0.25,
  showCropMarks: false,
};

export function minimalSpells(): Spell[] {
  return [
    {
      id: "fixture-min",
      title: "Minor Test",
      description: "Short.",
      level: 1,
      type: "Mage",
      author: "Tester",
      data: {
        castingTime: "1 action",
        range: "Touch",
        duration: "Instantaneous",
        descriptor: ["Fire"],
        method: "Point and cast.",
      },
      createdAt: new Date("2026-03-15T12:00:00Z"),
    },
  ];
}

export function messySpells(): Spell[] {
  const long = "word ".repeat(400);
  return [
    ...minimalSpells(),
    {
      id: "fixture-messy",
      title: "Complex \"Quote\" Spell",
      description: long,
      level: 0,
      type: "Other",
      author: undefined,
      data: {
        castingTime: "Reaction",
        range: "Self",
        areaOfEffect: "30 ft",
        duration: "1 minute",
        save: "Wisdom",
        effect: long.slice(0, 800),
        method: long.slice(0, 600),
        descriptor: ["Air", "Water"],
      },
      createdAt: new Date("2025-12-01T00:00:00Z"),
      reworkedAt: new Date("2026-01-10T00:00:00Z"),
    },
  ];
}
