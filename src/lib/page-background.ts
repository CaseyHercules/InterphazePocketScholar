import "server-only";

import { GalleryPlacement } from "@prisma/client";

import { db } from "@/lib/db";

export async function getPageBackgroundImageUrl(): Promise<string | null> {
  try {
    const row = await db.galleryImage.findFirst({
      where: { placement: GalleryPlacement.PAGE_BACKGROUND, isPublished: true },
      orderBy: { updatedAt: "desc" },
      select: { imageUrl: true },
    });
    return row?.imageUrl ?? null;
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (
      msg.includes("invalid input value for enum") &&
      msg.includes("GalleryPlacement")
    ) {
      console.warn(
        "[page-background] GalleryPlacement.PAGE_BACKGROUND missing in DB; run prisma migrate deploy."
      );
      return null;
    }
    throw e;
  }
}
