-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "data" JSONB;

-- DropEnum
DROP TYPE "SpellType";

-- CreateTable
CREATE TABLE "_PrimarySkills" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PrimarySkills_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_SecondarySkills" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_SecondarySkills_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_PrimarySkills_B_index" ON "_PrimarySkills"("B");

-- CreateIndex
CREATE INDEX "_SecondarySkills_B_index" ON "_SecondarySkills"("B");
