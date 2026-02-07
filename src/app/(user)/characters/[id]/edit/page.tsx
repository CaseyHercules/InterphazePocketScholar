import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { deleteCharacter } from "@/lib/actions/character";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Edit Character | Interphaze Pocket Scholar",
  description: "Edit your character",
};

interface EditCharacterPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCharacterPage({
  params,
}: EditCharacterPageProps) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const character = await db.character.findUnique({
    where: {
      id,
    },
    include: {
      primaryClass: true,
      secondaryClass: true,
    },
  });

  if (!character || character.userId !== session.user.id) {
    notFound();
  }

  const characterId = character.id;

  async function deleteAction() {
    "use server";
    await deleteCharacter(characterId);
    redirect("/characters");
  }

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">
        Edit Character: {character.name}
      </h1>
      <p className="text-muted-foreground mb-6">
        Character edits are disabled. You can only delete this character.
      </p>
      <form action={deleteAction}>
        <Button type="submit" variant="destructive">
          Delete Character
        </Button>
      </form>
    </div>
  );
}
