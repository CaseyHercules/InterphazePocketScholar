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

CREATE INDEX "Spellbook_createdById_idx" ON "Spellbook"("createdById");
CREATE INDEX "Spellbook_name_idx" ON "Spellbook"("name");
