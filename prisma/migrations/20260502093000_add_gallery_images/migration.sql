CREATE TYPE "GalleryPlacement" AS ENUM ('HOME', 'EVENT', 'POST');

CREATE TABLE "GalleryImage" (
    "id" TEXT NOT NULL,
    "placement" "GalleryPlacement" NOT NULL DEFAULT 'HOME'::"GalleryPlacement",
    "imageUrl" TEXT NOT NULL,
    "altText" TEXT NOT NULL,
    "caption" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GalleryImage_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "GalleryImage_placement_isPublished_sortOrder_idx" ON "GalleryImage"("placement", "isPublished", "sortOrder");
