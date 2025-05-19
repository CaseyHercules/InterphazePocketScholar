import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = {
  title: "Characters | Interphaze Pocket Scholar",
  description: "Manage your characters",
};

export default async function CharactersPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin");
  }

  return (
    <div className="container max-w-7xl mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Your Characters</h1>
        <Button asChild>
          <Link href="/characters/create">
            <Plus className="mr-2 h-4 w-4" />
            Create Character
          </Link>
        </Button>
      </div>

      <Suspense fallback={<CharactersLoading />}>
        <CharactersList userId={session.user.id} />
      </Suspense>
    </div>
  );
}

function CharactersLoading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(3)].map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader className="h-24 bg-muted rounded-t-lg" />
          <CardContent className="pt-4">
            <div className="h-6 bg-muted rounded w-3/4 mb-2" />
            <div className="h-4 bg-muted rounded w-1/2" />
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="h-9 bg-muted rounded w-20" />
            <div className="h-9 bg-muted rounded w-20" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

async function CharactersList({ userId }: { userId: string }) {
  const characters = await db.character.findMany({
    where: {
      userId: userId,
    },
    include: {
      primaryClass: true,
      secondaryClass: true,
    },
  });

  if (characters.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium mb-2">No characters yet</h3>
        <p className="text-muted-foreground mb-6">
          Create your first character to get started.
        </p>
        <Button asChild>
          <Link href="/characters/create">
            <Plus className="mr-2 h-4 w-4" />
            Create Character
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {characters.map((character) => (
        <Card key={character.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>{character.name}</CardTitle>
            <CardDescription>
              {character.primaryClass
                ? `${character.primaryClass.Title} (Lvl ${character.primaryClassLvl})`
                : "No Primary Class"}
              {character.secondaryClass &&
                ` / ${character.secondaryClass.Title} (Lvl ${character.secondaryClassLvl})`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Created: {new Date(character.createdAt).toLocaleDateString()}
            </p>
            <p className="font-medium mt-2">Phazians: {character.phazians}</p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href={`/characters/${character.id}/edit`}>Edit</Link>
            </Button>
            <Button asChild>
              <Link href={`/passport/${character.id}`}>View Passport</Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
