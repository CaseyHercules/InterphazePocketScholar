import { sortSkillsByTier } from "@/lib/utils";

export function parseGrantedSkillIds(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.filter((x): x is string => typeof x === "string");
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw) as unknown;
      return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
    } catch {
      return [];
    }
  }
  return [];
}

export function getCharacterSkillsWithGranted(character: {
  primarySkills?: unknown[];
  secondarySkills?: unknown[];
  primaryClass?: { grantedSkills?: unknown } | null;
  secondaryClass?: { grantedSkills?: unknown } | null;
}): { skills: unknown[]; grantedIds: Set<string> } {
  const primary = Array.isArray(character?.primarySkills) ? character.primarySkills : [];
  const secondary = Array.isArray(character?.secondarySkills) ? character.secondarySkills : [];
  const skills = [...primary, ...secondary];
  const grantedIds = new Set<string>();
  const primaryGranted = character?.primaryClass ? parseGrantedSkillIds(character.primaryClass.grantedSkills) : [];
  const secondaryGranted = character?.secondaryClass ? parseGrantedSkillIds(character.secondaryClass.grantedSkills) : [];
  for (const id of primaryGranted) grantedIds.add(id);
  for (const id of secondaryGranted) grantedIds.add(id);
  return { skills, grantedIds };
}

export function sortSkillsWithGrantedFirst<T extends { id?: string; tier?: number; title?: string }>(
  skills: T[],
  grantedIds: Set<string>
): T[] {
  const granted = skills.filter((s) => s.id != null && grantedIds.has(s.id));
  const rest = skills.filter((s) => s.id == null || !grantedIds.has(s.id));
  return [...sortSkillsByTier(granted), ...sortSkillsByTier(rest)];
}
