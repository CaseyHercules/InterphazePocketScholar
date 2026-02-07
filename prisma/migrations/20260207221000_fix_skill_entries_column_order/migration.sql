-- Fix data where characterId/skillId were swapped (B,A instead of A,B).
-- Only swap rows where characterId is actually a Skill id (wrong mapping).
UPDATE "CharacterPrimarySkill"
SET "characterId" = "skillId", "skillId" = "characterId"
WHERE "characterId" IN (SELECT id FROM "Skill");

UPDATE "CharacterSecondarySkill"
SET "characterId" = "skillId", "skillId" = "characterId"
WHERE "characterId" IN (SELECT id FROM "Skill");
