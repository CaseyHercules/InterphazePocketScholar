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

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Create Character</h1>
      <p className="text-muted-foreground mb-6">
        Fill out the form below to create a new character. You can edit your
        character later.
      </p>

      <CharacterForm classes={classes} />
    </div>
  );
}
