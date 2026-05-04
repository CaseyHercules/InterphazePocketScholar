CREATE TYPE "ContentDocumentFormat" AS ENUM ('BLOCK_V1', 'QUILL_DELTA');

CREATE TYPE "ContentDocumentStatus" AS ENUM ('DRAFT', 'PUBLISHED');

CREATE TYPE "ContentOwnerType" AS ENUM ('HOME', 'EVENT', 'POST');

CREATE TABLE "ContentDocument" (
    "id" TEXT NOT NULL,
    "ownerType" "ContentOwnerType" NOT NULL,
    "ownerRef" TEXT NOT NULL,
    "status" "ContentDocumentStatus" NOT NULL DEFAULT 'DRAFT'::"ContentDocumentStatus",
    "format" "ContentDocumentFormat" NOT NULL DEFAULT 'BLOCK_V1'::"ContentDocumentFormat",
    "version" INTEGER NOT NULL DEFAULT 1,
    "blocks" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentDocument_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ContentDocument_ownerType_ownerRef_key" ON "ContentDocument"("ownerType", "ownerRef");

CREATE INDEX "ContentDocument_ownerType_status_idx" ON "ContentDocument"("ownerType", "status");

CREATE INDEX "ContentDocument_status_idx" ON "ContentDocument"("status");
