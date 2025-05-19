import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { CharacterForm } from "@/components/CharacterForm";

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
    orderBy: {
      Title: "asc",
    },
  });

  // Fetch all available races from the database
  // Since races are stored in a Race table or model, we need to query it
  // For now, using common fantasy races until we can access the real data
  const races = [
    { id: "human", name: "Human" },
    { id: "elf", name: "Elf" },
    { id: "dwarf", name: "Dwarf" },
    { id: "halfling", name: "Halfling" },
    { id: "orc", name: "Orc" },
    { id: "dragonborn", name: "Dragonborn" },
    { id: "tiefling", name: "Tiefling" },
    { id: "gnome", name: "Gnome" },
  ];

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
