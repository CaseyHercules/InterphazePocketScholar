import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { CharacterForm } from "@/components/CharacterForm";
import { getVisibilityWhere } from "@/lib/visibility";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Edit Passport | Admin",
  description: "Edit character passport.",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminPassportsEditPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  if (
    !session?.user ||
    (session.user.role !== "ADMIN" && session.user.role !== "SUPERADMIN")
  ) {
    redirect("/auth/signin");
  }

  const { id } = await params;
  const character = await db.character.findUnique({
    where: { id },
    include: {
      primaryClass: true,
      secondaryClass: true,
    },
  });

  if (!character) {
    notFound();
  }

  const classes = await db.class.findMany({
    select: { id: true, Title: true },
    where: getVisibilityWhere(session.user.role),
    orderBy: { Title: "asc" },
  });

  const raceAdjustments = await db.adjustment.findMany({
    where: { sourceType: "RACE", archived: false },
    select: { id: true, title: true },
    orderBy: { title: "asc" },
  });

  const races = raceAdjustments
    .filter((a) => a.title?.trim())
    .map((a) => ({ id: a.title!.trim(), name: a.title!.trim() }));

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/passports">← Passports</Link>
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/passport/${character.id}`}>View passport</Link>
        </Button>
      </div>
      <h1 className="text-3xl font-bold mb-2">Edit passport: {character.name}</h1>
      <p className="text-muted-foreground mb-6">
        Update character details. Use the passport view for inline effects,
        class, and adjustments.
      </p>
      <CharacterForm
        classes={classes}
        races={races}
        character={character}
        isEditing
        adminMode
      />
    </div>
  );
}
