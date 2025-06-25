-- AlterTable
ALTER TABLE "Skill" ADD COLUMN     "classId" TEXT;

-- CreateIndex
CREATE INDEX "Skill_classId_idx" ON "Skill"("classId");
