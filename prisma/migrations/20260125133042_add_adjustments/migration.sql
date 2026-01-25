-- CreateEnum
CREATE TYPE "AdjustmentSourceType" AS ENUM ('RACE', 'SKILL', 'ITEM', 'DISEASE', 'CUSTOM');

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
