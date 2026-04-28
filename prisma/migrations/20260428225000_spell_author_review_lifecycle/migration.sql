-- CreateEnum
CREATE TYPE "SpellPublicationStatus" AS ENUM (
  'IN_REVIEW',
  'PUBLISHED',
  'PUBLISHED_IN_LIBRARY',
  'ARCHIVED_PRIVATE',
  'ARCHIVED_PUBLIC_LEGACY'
);

-- AlterTable
ALTER TABLE "Spell"
ADD COLUMN "author" TEXT,
ADD COLUMN "publicationStatus" "SpellPublicationStatus" NOT NULL DEFAULT 'PUBLISHED',
ADD COLUMN "reworkedAt" TIMESTAMP(3),
ADD COLUMN "supersedesSpellId" TEXT;

-- Backfill existing spell library flags into publication status
UPDATE "Spell"
SET "publicationStatus" = CASE
  WHEN COALESCE(("data"->>'isInSpellLibrary')::boolean, false)
    THEN 'PUBLISHED_IN_LIBRARY'::"SpellPublicationStatus"
  ELSE 'PUBLISHED'::"SpellPublicationStatus"
END;

-- CreateIndex
CREATE INDEX "Spell_publicationStatus_idx" ON "Spell"("publicationStatus");
CREATE INDEX "Spell_supersedesSpellId_idx" ON "Spell"("supersedesSpellId");
