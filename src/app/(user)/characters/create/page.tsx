import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { CharacterForm } from "@/components/CharacterForm";
import { getVisibilityWhere } from "@/lib/visibility";

export const metadata = {
  title: "Create Character | Interphaze Pocket Scholar",
  description: "Create a new character for your adventures",
};

export default async function CreateCharacterPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Fetch all classes for the form
  const classes = await db.class.findMany({
    select: {
      id: true,
      Title: true,
    },
    where: getVisibilityWhere(session.user.role),
    orderBy: {
      Title: "asc",
    },
  });

  const raceAdjustments = await db.adjustment.findMany({
    where: {
      sourceType: "RACE",
      archived: false,
    },
    select: {
      id: true,
      title: true,
    },
    orderBy: {
      title: "asc",
    },
  });

  const races = raceAdjustments
    .filter((adjustment) => adjustment.title?.trim())
    .map((adjustment) => {
      const title = adjustment.title.trim();
      return {
        id: title,
        name: title,
      };
    });

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Create Character</h1>
      <p className="text-muted-foreground mb-6">
        Fill out the form below to create a new character. Select a race and
        primary class to begin your journey. You&apos;ll be able to manage
        skills, inventory, and other details later from your character&apos;s
        passport.
      </p>

      <CharacterForm classes={classes} races={races} />
    </div>
  );
}
