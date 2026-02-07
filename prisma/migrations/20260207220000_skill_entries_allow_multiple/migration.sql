-- CreateTable
CREATE TABLE "CharacterPrimarySkill" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,

    CONSTRAINT "CharacterPrimarySkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterSecondarySkill" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,

    CONSTRAINT "CharacterSecondarySkill_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CharacterPrimarySkill_characterId_idx" ON "CharacterPrimarySkill"("characterId");

-- CreateIndex
CREATE INDEX "CharacterPrimarySkill_skillId_idx" ON "CharacterPrimarySkill"("skillId");

-- CreateIndex
CREATE INDEX "CharacterSecondarySkill_characterId_idx" ON "CharacterSecondarySkill"("characterId");

-- CreateIndex
CREATE INDEX "CharacterSecondarySkill_skillId_idx" ON "CharacterSecondarySkill"("skillId");

-- Migrate data: Prisma implicit m2m uses A = first model name (Character), B = Skill
INSERT INTO "CharacterPrimarySkill" ("id", "characterId", "skillId")
SELECT gen_random_uuid()::text, "A", "B" FROM "_PrimarySkills";

INSERT INTO "CharacterSecondarySkill" ("id", "characterId", "skillId")
SELECT gen_random_uuid()::text, "A", "B" FROM "_SecondarySkills";

-- DropTable
DROP TABLE "_PrimarySkills";

-- DropTable
DROP TABLE "_SecondarySkills";
