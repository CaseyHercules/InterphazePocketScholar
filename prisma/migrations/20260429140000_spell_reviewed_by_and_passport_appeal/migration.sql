ALTER TYPE "RequestType" ADD VALUE 'PASSPORT_APPEAL';

ALTER TABLE "Spell" ADD COLUMN "reviewedByUserId" TEXT;
ALTER TABLE "Spell" ADD COLUMN "reviewedAt" TIMESTAMP(3);

CREATE INDEX "Spell_reviewedByUserId_idx" ON "Spell"("reviewedByUserId");
