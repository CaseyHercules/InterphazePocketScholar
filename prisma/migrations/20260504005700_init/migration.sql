-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN', 'SUPERADMIN', 'SPELLWRIGHT', 'MODERATOR');

-- CreateEnum
CREATE TYPE "AdjustmentSourceType" AS ENUM ('RACE', 'SKILL', 'ITEM', 'DISEASE', 'CUSTOM');

-- CreateEnum
CREATE TYPE "ItemType" AS ENUM ('WEAPON', 'ARMOR', 'CONSUMABLE', 'MISC', 'MAGIC_ITEM', 'INCARNATE_ITEM');

-- CreateEnum
CREATE TYPE "RequestType" AS ENUM ('SKILL', 'SPELL', 'CHARACTER', 'PASSPORT_APPEAL', 'OTHER');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "RegisterStatus" AS ENUM ('REGISTERED', 'WAITLIST', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SpellPublicationStatus" AS ENUM ('IN_REVIEW', 'PUBLISHED', 'PUBLISHED_IN_LIBRARY', 'ARCHIVED_PRIVATE', 'ARCHIVED_PUBLIC_LEGACY');

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
    "classId" TEXT,
    "visibilityRoles" "Role"[] DEFAULT ARRAY[]::"Role"[],

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
    "visibilityRoles" "Role"[] DEFAULT ARRAY[]::"Role"[],

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
    "inlineEffectsJson" JSONB,
    "alignmentJson" JSONB,
    "claimEmail" TEXT,

    CONSTRAINT "Character_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Adjustment" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "sourceType" "AdjustmentSourceType" NOT NULL,
    "effectsJson" JSONB NOT NULL,
    "tags" JSONB,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "visibilityRoles" "Role"[] DEFAULT ARRAY[]::"Role"[],

    CONSTRAINT "Adjustment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterAdjustment" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "adjustmentId" TEXT NOT NULL,
    "notes" TEXT,
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CharacterAdjustment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "address" TEXT,
    "capacity" INTEGER,
    "coordinates" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "price" DOUBLE PRECISION,
    "registrationEnd" TIMESTAMP(3),
    "status" "EventStatus" NOT NULL DEFAULT 'DRAFT',
    "stripePriceId" TEXT,
    "stripeProductId" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "description" JSONB,
    "data" JSONB,

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
    "visibilityRoles" "Role"[] DEFAULT ARRAY[]::"Role"[],
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "data" JSONB,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Spell" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT,
    "description" TEXT,
    "level" INTEGER NOT NULL,
    "characterId" TEXT,
    "data" JSONB,
    "visibilityRoles" "Role"[] DEFAULT ARRAY[]::"Role"[],
    "author" TEXT,
    "publicationStatus" "SpellPublicationStatus" NOT NULL DEFAULT 'PUBLISHED',
    "reworkedAt" TIMESTAMP(3),
    "supersedesSpellId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedByUserId" TEXT,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "Spell_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Spellbook" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "spellIds" JSONB NOT NULL,
    "styleId" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Spellbook_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "Attendee" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "registrationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Attendee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventFAQ" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" JSONB NOT NULL,
    "eventId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventFAQ_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventRegistration" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "RegisterStatus" NOT NULL DEFAULT 'WAITLIST',
    "promoCode" TEXT,
    "stripePaymentId" TEXT,
    "totalAmount" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ticketTypeId" TEXT,
    "promoCodeId" TEXT,
    "stripeCheckoutSessionId" TEXT,
    "stripePaymentIntentId" TEXT,
    "amountPaidCents" INTEGER,
    "currency" TEXT DEFAULT 'usd',
    "discountAmountCents" INTEGER,
    "answers" JSONB,

    CONSTRAINT "EventRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromoCode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "discount" DOUBLE PRECISION NOT NULL,
    "isPercentage" BOOLEAN NOT NULL DEFAULT true,
    "maxUses" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3),
    "eventId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PromoCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventTicketType" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "capacity" INTEGER,
    "stripeProductId" TEXT,
    "stripePriceId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventTicketType_pkey" PRIMARY KEY ("id")
);

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
CREATE INDEX "Skill_classId_idx" ON "Skill"("classId");

-- CreateIndex
CREATE INDEX "Skill_chararacterId_idx" ON "Skill"("chararacterId");

-- CreateIndex
CREATE INDEX "Class_Title_idx" ON "Class"("Title");

-- CreateIndex
CREATE INDEX "Character_userId_idx" ON "Character"("userId");

-- CreateIndex
CREATE INDEX "Character_claimEmail_idx" ON "Character"("claimEmail");

-- CreateIndex
CREATE INDEX "Character_primaryClassId_idx" ON "Character"("primaryClassId");

-- CreateIndex
CREATE INDEX "Character_secondaryClassId_idx" ON "Character"("secondaryClassId");

-- CreateIndex
CREATE INDEX "Adjustment_title_idx" ON "Adjustment"("title");

-- CreateIndex
CREATE INDEX "Adjustment_sourceType_idx" ON "Adjustment"("sourceType");

-- CreateIndex
CREATE INDEX "Adjustment_archived_idx" ON "Adjustment"("archived");

-- CreateIndex
CREATE INDEX "CharacterAdjustment_characterId_idx" ON "CharacterAdjustment"("characterId");

-- CreateIndex
CREATE INDEX "CharacterAdjustment_adjustmentId_idx" ON "CharacterAdjustment"("adjustmentId");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterAdjustment_characterId_adjustmentId_key" ON "CharacterAdjustment"("characterId", "adjustmentId");

-- CreateIndex
CREATE INDEX "Item_characterId_idx" ON "Item"("characterId");

-- CreateIndex
CREATE INDEX "Item_archived_idx" ON "Item"("archived");

-- CreateIndex
CREATE INDEX "Spell_characterId_idx" ON "Spell"("characterId");

-- CreateIndex
CREATE INDEX "Spell_publicationStatus_idx" ON "Spell"("publicationStatus");

-- CreateIndex
CREATE INDEX "Spell_supersedesSpellId_idx" ON "Spell"("supersedesSpellId");

-- CreateIndex
CREATE INDEX "Spell_reviewedByUserId_idx" ON "Spell"("reviewedByUserId");

-- CreateIndex
CREATE INDEX "Spellbook_createdById_idx" ON "Spellbook"("createdById");

-- CreateIndex
CREATE INDEX "Spellbook_name_idx" ON "Spellbook"("name");

-- CreateIndex
CREATE INDEX "Request_userId_idx" ON "Request"("userId");

-- CreateIndex
CREATE INDEX "Attendee_registrationId_idx" ON "Attendee"("registrationId");

-- CreateIndex
CREATE INDEX "EventFAQ_eventId_idx" ON "EventFAQ"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "EventRegistration_stripePaymentId_key" ON "EventRegistration"("stripePaymentId");

-- CreateIndex
CREATE UNIQUE INDEX "EventRegistration_stripeCheckoutSessionId_key" ON "EventRegistration"("stripeCheckoutSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "EventRegistration_stripePaymentIntentId_key" ON "EventRegistration"("stripePaymentIntentId");

-- CreateIndex
CREATE INDEX "EventRegistration_eventId_idx" ON "EventRegistration"("eventId");

-- CreateIndex
CREATE INDEX "EventRegistration_userId_idx" ON "EventRegistration"("userId");

-- CreateIndex
CREATE INDEX "EventRegistration_ticketTypeId_idx" ON "EventRegistration"("ticketTypeId");

-- CreateIndex
CREATE INDEX "EventRegistration_promoCodeId_idx" ON "EventRegistration"("promoCodeId");

-- CreateIndex
CREATE INDEX "EventRegistration_stripePaymentIntentId_idx" ON "EventRegistration"("stripePaymentIntentId");

-- CreateIndex
CREATE INDEX "EventRegistration_stripeCheckoutSessionId_idx" ON "EventRegistration"("stripeCheckoutSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "PromoCode_code_key" ON "PromoCode"("code");

-- CreateIndex
CREATE INDEX "PromoCode_code_idx" ON "PromoCode"("code");

-- CreateIndex
CREATE INDEX "PromoCode_eventId_idx" ON "PromoCode"("eventId");

-- CreateIndex
CREATE INDEX "EventTicketType_eventId_sortOrder_idx" ON "EventTicketType"("eventId", "sortOrder");

-- CreateIndex
CREATE INDEX "EventTicketType_stripePriceId_idx" ON "EventTicketType"("stripePriceId");

-- CreateIndex
CREATE UNIQUE INDEX "EventTicketType_eventId_slug_key" ON "EventTicketType"("eventId", "slug");

-- CreateIndex
CREATE INDEX "CharacterPrimarySkill_characterId_idx" ON "CharacterPrimarySkill"("characterId");

-- CreateIndex
CREATE INDEX "CharacterPrimarySkill_skillId_idx" ON "CharacterPrimarySkill"("skillId");

-- CreateIndex
CREATE INDEX "CharacterSecondarySkill_characterId_idx" ON "CharacterSecondarySkill"("characterId");

-- CreateIndex
CREATE INDEX "CharacterSecondarySkill_skillId_idx" ON "CharacterSecondarySkill"("skillId");

-- CreateIndex
CREATE INDEX "_CharacterToEvent_B_index" ON "_CharacterToEvent"("B");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Skill" ADD CONSTRAINT "Skill_parentSkillId_fkey" FOREIGN KEY ("parentSkillId") REFERENCES "Skill"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "Skill" ADD CONSTRAINT "Skill_skillGroupId_fkey" FOREIGN KEY ("skillGroupId") REFERENCES "SkillGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Skill" ADD CONSTRAINT "Skill_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_primaryClassId_fkey" FOREIGN KEY ("primaryClassId") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_secondaryClassId_fkey" FOREIGN KEY ("secondaryClassId") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "CharacterAdjustment" ADD CONSTRAINT "CharacterAdjustment_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterAdjustment" ADD CONSTRAINT "CharacterAdjustment_adjustmentId_fkey" FOREIGN KEY ("adjustmentId") REFERENCES "Adjustment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "Spell" ADD CONSTRAINT "Spell_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "Spell" ADD CONSTRAINT "Spell_reviewedByUserId_fkey" FOREIGN KEY ("reviewedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "EventRegistration" ADD CONSTRAINT "EventRegistration_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventRegistration" ADD CONSTRAINT "EventRegistration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "EventRegistration" ADD CONSTRAINT "EventRegistration_ticketTypeId_fkey" FOREIGN KEY ("ticketTypeId") REFERENCES "EventTicketType"("id") ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "EventRegistration" ADD CONSTRAINT "EventRegistration_promoCodeId_fkey" FOREIGN KEY ("promoCodeId") REFERENCES "PromoCode"("id") ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "PromoCode" ADD CONSTRAINT "PromoCode_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "EventTicketType" ADD CONSTRAINT "EventTicketType_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "CharacterPrimarySkill" ADD CONSTRAINT "CharacterPrimarySkill_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterPrimarySkill" ADD CONSTRAINT "CharacterPrimarySkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterSecondarySkill" ADD CONSTRAINT "CharacterSecondarySkill_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterSecondarySkill" ADD CONSTRAINT "CharacterSecondarySkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CharacterToEvent" ADD CONSTRAINT "_CharacterToEvent_A_fkey" FOREIGN KEY ("A") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CharacterToEvent" ADD CONSTRAINT "_CharacterToEvent_B_fkey" FOREIGN KEY ("B") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

