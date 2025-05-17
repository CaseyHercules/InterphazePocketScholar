-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN', 'SUPERADMIN', 'SPELLWRIGHT', 'MODERATOR');

-- CreateEnum
CREATE TYPE "ItemType" AS ENUM ('WEAPON', 'ARMOR', 'CONSUMABLE', 'MISC', 'MAGIC_ITEM', 'INCARNATE_ITEM');

-- CreateEnum
CREATE TYPE "SpellType" AS ENUM ('PSION', 'DRUID', 'WIZARD', 'CLERIC');

-- CreateEnum
CREATE TYPE "RequestType" AS ENUM ('SKILL', 'SPELL', 'CHARACTER', 'OTHER');

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Topic" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "shortDesc" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "topicId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "username" TEXT,
    "image" TEXT,
    "UnallocatedLevels" INTEGER NOT NULL DEFAULT 0,
    "UnrequestedSkills" INTEGER NOT NULL DEFAULT 0,
    "role" "Role" NOT NULL DEFAULT 'USER',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Skill" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "descriptionShort" TEXT,
    "tier" INTEGER NOT NULL,
    "parentSkillId" TEXT,
    "skillGroupId" TEXT,
    "prerequisiteSkills" JSONB,
    "permenentEpReduction" INTEGER NOT NULL,
    "epCost" TEXT NOT NULL,
    "activation" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "abilityCheck" TEXT,
    "canBeTakenMultiple" BOOLEAN NOT NULL DEFAULT false,
    "playerVisable" BOOLEAN NOT NULL DEFAULT true,
    "additionalInfo" JSONB,
    "chararacterId" TEXT,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkillGroup" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "SkillGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Class" (
    "id" TEXT NOT NULL,
    "Title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "grantedSkills" JSONB,
    "Skills" JSONB,
    "SkillTierGains" JSONB,
    "HP" JSONB,
    "EP" JSONB,
    "Attack" JSONB,
    "Accuracy" JSONB,
    "Defense" JSONB,
    "Resistance" JSONB,
    "Tough" JSONB,
    "Quick" JSONB,
    "Mind" JSONB,

    CONSTRAINT "Class_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Character" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT,
    "primaryClassId" TEXT,
    "primaryClassLvl" INTEGER NOT NULL,
    "secondaryClassId" TEXT,
    "secondaryClassLvl" INTEGER NOT NULL,
    "Attributes" JSONB,
    "notes" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "phazians" INTEGER NOT NULL,

    CONSTRAINT "Character_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "location" TEXT,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "ItemType",
    "quantity" INTEGER NOT NULL,
    "characterId" TEXT,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Spell" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "SpellType",
    "description" TEXT,
    "level" INTEGER NOT NULL,
    "characterId" TEXT,

    CONSTRAINT "Spell_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Request" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "userId" TEXT,
    "type" "RequestType",

    CONSTRAINT "Request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CharacterToEvent" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CharacterToEvent_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Post_topicId_idx" ON "Post"("topicId");

-- CreateIndex
CREATE INDEX "Post_userId_idx" ON "Post"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "Skill_skillGroupId_idx" ON "Skill"("skillGroupId");

-- CreateIndex
CREATE INDEX "Skill_parentSkillId_idx" ON "Skill"("parentSkillId");

-- CreateIndex
CREATE INDEX "Skill_chararacterId_idx" ON "Skill"("chararacterId");

-- CreateIndex
CREATE INDEX "Class_Title_idx" ON "Class"("Title");

-- CreateIndex
CREATE INDEX "Character_userId_idx" ON "Character"("userId");

-- CreateIndex
CREATE INDEX "Character_primaryClassId_idx" ON "Character"("primaryClassId");

-- CreateIndex
CREATE INDEX "Character_secondaryClassId_idx" ON "Character"("secondaryClassId");

-- CreateIndex
CREATE INDEX "Item_characterId_idx" ON "Item"("characterId");

-- CreateIndex
CREATE INDEX "Spell_characterId_idx" ON "Spell"("characterId");

-- CreateIndex
CREATE INDEX "Request_userId_idx" ON "Request"("userId");

-- CreateIndex
CREATE INDEX "_CharacterToEvent_B_index" ON "_CharacterToEvent"("B");
