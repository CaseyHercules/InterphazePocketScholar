import { GalleryPlacement } from "@prisma/client";
import { createUploadthing, type FileRouter } from "uploadthing/next";

import { getAuthSession } from "@/lib/auth";
import { isAdminRole } from "@/lib/api-auth";
import { db } from "@/lib/db";

const f = createUploadthing();

async function requireSignedIn() {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return { userId: session.user.id };
}

async function requireAdmin() {
  const session = await getAuthSession();
  if (!session?.user?.id || !isAdminRole(session.user.role)) {
    throw new Error("Unauthorized");
  }
  return { userId: session.user.id };
}

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB" } })
    .middleware(requireSignedIn)
    .onUploadComplete(async ({ metadata }) => {
      return { uploadedBy: metadata.userId };
    }),

  homeGalleryImage: f({ image: { maxFileSize: "8MB" } })
    .middleware(requireAdmin)
    .onUploadComplete(async ({ file }) => {
      const last = await db.galleryImage.findFirst({
        where: { placement: GalleryPlacement.HOME },
        orderBy: { sortOrder: "desc" },
        select: { sortOrder: true },
      });
      const sortOrder = (last?.sortOrder ?? -1) + 1;
      await db.galleryImage.create({
        data: {
          placement: GalleryPlacement.HOME,
          imageUrl: file.url,
          altText: "Photo from an Interphaze weekend",
          sortOrder,
        },
      });
      return { sortOrder };
    }),

  pageBackgroundImage: f({ image: { maxFileSize: "8MB" } })
    .middleware(requireAdmin)
    .onUploadComplete(async ({ file }) => {
      await db.$transaction(async (tx) => {
        await tx.galleryImage.deleteMany({
          where: { placement: GalleryPlacement.PAGE_BACKGROUND },
        });
        await tx.galleryImage.create({
          data: {
            placement: GalleryPlacement.PAGE_BACKGROUND,
            imageUrl: file.url,
            altText: "Site background watermark",
            sortOrder: 0,
          },
        });
      });
      return { replaced: true };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
