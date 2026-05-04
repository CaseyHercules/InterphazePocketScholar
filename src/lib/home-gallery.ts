import { GalleryPlacement } from "@prisma/client";

import { db } from "@/lib/db";

export type HomeGalleryItem = {
  src: string;
  alt: string;
  caption?: string;
};

const ARCHIVE_SNAPSHOT_ID = "20150801162203";

const ARCHIVE_GALLERY: HomeGalleryItem[] = [
  {
    src: "/archive-gallery/gallerypic1.PNG",
    alt: "Group of players in costume at an outdoor Interphaze LARP scene",
  },
  {
    src: "/archive-gallery/gallerypic2.PNG",
    alt: "Interphaze adventurers with weapons and garb in the field",
  },
  {
    src: "/archive-gallery/gallerypic3.PNG",
    alt: "Players interacting in character during an Interphaze weekend",
  },
  {
    src: "/archive-gallery/gallerypic4.PNG",
    alt: "Fantasy costuming and props at an Interphaze gathering",
  },
  {
    src: "/archive-gallery/gallerypic5.PNG",
    alt: "Battle or skirmish moment from an Interphaze event",
  },
  {
    src: "/archive-gallery/gallerypic6.PNG",
    alt: "Community and storytelling at an Interphaze LARP",
  },
];

export async function getHomeGalleryState(): Promise<{
  items: HomeGalleryItem[];
  showArchiveAttribution: boolean;
}> {
  const rows = await db.galleryImage.findMany({
    where: { placement: GalleryPlacement.HOME, isPublished: true },
    orderBy: { sortOrder: "asc" },
    select: { imageUrl: true, altText: true, caption: true },
  });
  if (rows.length > 0) {
    return {
      items: rows.map((r) => ({
        src: r.imageUrl,
        alt: r.altText,
        caption: r.caption ?? undefined,
      })),
      showArchiveAttribution: false,
    };
  }
  return { items: ARCHIVE_GALLERY, showArchiveAttribution: true };
}

export function getArchiveGalleryAttribution(): {
  label: string;
  archiveUrl: string;
} {
  return {
    label: `Images from the Internet Archive snapshot of interphaze.org (${ARCHIVE_SNAPSHOT_ID.slice(0, 4)}-${ARCHIVE_SNAPSHOT_ID.slice(4, 6)}-${ARCHIVE_SNAPSHOT_ID.slice(6, 8)}).`,
    archiveUrl: `https://web.archive.org/web/${ARCHIVE_SNAPSHOT_ID}/http://interphaze.org/`,
  };
}
