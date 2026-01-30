-- Add role-based visibility for public content
ALTER TABLE "Skill"
ADD COLUMN "visibilityRoles" "Role"[] NOT NULL DEFAULT ARRAY[]::"Role"[];

ALTER TABLE "Class"
ADD COLUMN "visibilityRoles" "Role"[] NOT NULL DEFAULT ARRAY[]::"Role"[];

ALTER TABLE "Item"
ADD COLUMN "visibilityRoles" "Role"[] NOT NULL DEFAULT ARRAY[]::"Role"[];

ALTER TABLE "Spell"
ADD COLUMN "visibilityRoles" "Role"[] NOT NULL DEFAULT ARRAY[]::"Role"[];

-- Migrate legacy skill visibility to role-based visibility
UPDATE "Skill"
SET "visibilityRoles" = ARRAY['SPELLWRIGHT', 'ADMIN', 'SUPERADMIN']::"Role"[]
WHERE "playerVisable" = false;
