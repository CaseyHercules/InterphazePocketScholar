import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { BackstoryEditor } from "@/components/BackstoryEditor";

export const metadata = {
  title: "Edit Backstory | Interphaze Pocket Scholar",
  description: "Edit your character's backstory",
};

interface BackstoryPageProps {
  params: {
    id: string;
  };
}

export default async function BackstoryPage({ params }: BackstoryPageProps) {
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
    select: {
      id: true,
      name: true,
      notes: true,
    },
  });

  if (!character) {
    notFound();
  }

  // Extract backstory from notes if it exists
  const backstory = character.notes
    ? (character.notes as any).backstory || null
    : null;

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-2">Edit Backstory</h1>
      <p className="text-xl text-muted-foreground mb-6">{character.name}</p>

      <BackstoryEditor characterId={character.id} initialContent={backstory} />
    </div>
  );
}
