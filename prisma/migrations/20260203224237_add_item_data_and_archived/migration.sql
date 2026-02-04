-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "archived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "data" JSONB;

-- CreateIndex
CREATE INDEX "Item_archived_idx" ON "Item"("archived");
