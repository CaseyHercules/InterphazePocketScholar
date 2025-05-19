import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { CharacterForm } from "@/components/CharacterForm";

export const metadata = {
  title: "Edit Character | Interphaze Pocket Scholar",
  description: "Edit your character",
};

interface EditCharacterPageProps {
  params: {
    id: string;
  };
}

export default async function EditCharacterPage({
  params,
}: EditCharacterPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Fetch the character and verify ownership
  const character = await db.character.findUnique({
    where: {
      id: params.id,
      userId: session.user.id, // Ensure the character belongs to this user
    },
    include: {
      primaryClass: true,
      secondaryClass: true,
    },
  });

  if (!character) {
    notFound();
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
      <h1 className="text-3xl font-bold mb-6">
        Edit Character: {character.name}
      </h1>
      <p className="text-muted-foreground mb-6">
        Update your character's details below.
      </p>

      <CharacterForm character={character} classes={classes} isEditing={true} />
    </div>
  );
}
