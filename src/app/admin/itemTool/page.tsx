import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Item } from "@/types/item";
import { ItemToolClient } from "./ItemToolClient";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ItemToolPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions);

  if (
    !session?.user ||
    !["ADMIN", "SUPERADMIN"].includes(session.user.role)
  ) {
    redirect("/unauthorized");
  }

  const params = await searchParams;
  const includeArchived = params?.archived === "1" || params?.archived === "true";

  const [items, adjustments] = await Promise.all([
    db.item.findMany({
      where: {
        characterId: null,
        ...(includeArchived ? {} : { archived: false }),
      },
      orderBy: { title: "asc" },
    }),
    db.adjustment.findMany({
      where: { archived: false },
      select: { id: true, title: true },
      orderBy: { title: "asc" },
    }),
  ]);

  const itemsJson: Item[] = items.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    type: item.type,
    quantity: item.quantity,
    data: item.data as Item["data"],
    archived: item.archived,
    visibilityRoles: item.visibilityRoles ?? [],
  }));

  return (
    <ItemToolClient
      initialItems={itemsJson}
      adjustments={adjustments}
      searchParams={params}
    />
  );
}
