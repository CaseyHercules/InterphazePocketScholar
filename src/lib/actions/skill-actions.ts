"use server";

import { addSkillToCharacter } from "@/lib/actions/passport";

export async function addSkillToCharacterAction(
  characterId: string,
  skillId: string,
  isPrimary: boolean
) {
  return await addSkillToCharacter(characterId, skillId, isPrimary);
}
