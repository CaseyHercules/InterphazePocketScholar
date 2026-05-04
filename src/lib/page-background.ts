import "server-only";

import { db } from "@/lib/db";

const PAGE_BACKGROUND_PLACEMENT = "PAGE_BACKGROUND";

export async function getPageBackgroundImageUrl(): Promise<string | null> {
  const galleryImageModel = (db as unknown as {
    galleryImage?: {
      findFirst: (args: unknown) => Promise<{ imageUrl: string } | null>;
    };
  }).galleryImage;

  if (!galleryImageModel?.findFirst) {
    return null;
  }

  try {
    const row = await galleryImageModel.findFirst({
      where: { placement: PAGE_BACKGROUND_PLACEMENT, isPublished: true },
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
