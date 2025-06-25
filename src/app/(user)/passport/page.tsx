import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Eye, Plus } from "lucide-react";

export default async function PassportPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Fetch user's characters
  const characters = await db.character.findMany({
    where: {
      userId: session.user.id,
    },
    select: {
      id: true,
      name: true,
      primaryClass: {
        select: {
          Title: true,
        },
      },
      secondaryClass: {
        select: {
          Title: true,
        },
      },
      primaryClassLvl: true,
      secondaryClassLvl: true,
      user: {
        select: {
          UnallocatedLevels: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  const unallocatedLevels = characters[0]?.user?.UnallocatedLevels || 0;

  return (
    <div className="container max-w-6xl mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <User className="h-8 w-8" />
            Character Passports
          </h1>
          <p className="text-muted-foreground mt-1">
            View detailed information about your characters
          </p>
        </div>

        {unallocatedLevels > 0 && (
          <Badge variant="secondary" className="text-sm">
            {unallocatedLevels} Level{unallocatedLevels > 1 ? "s" : ""}{" "}
            Available
          </Badge>
        )}
      </div>

      {characters.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {characters.map((character) => (
            <Card
              key={character.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{character.name}</CardTitle>
                <CardDescription>
                  {character.primaryClass?.Title || "No Primary Class"} (Level{" "}
                  {character.primaryClassLvl})
                  {character.secondaryClass &&
                    !character.secondaryClass.Title.toLowerCase().includes(
                      "none"
                    ) &&
                    ` / ${character.secondaryClass.Title} (Level ${character.secondaryClassLvl})`}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button asChild className="w-full">
                  <Link href={`/passport/${character.id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Passport
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Characters Yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first character to get started with your passport
            </p>
            <Button asChild>
              <Link href="/characters/create">
                <Plus className="mr-2 h-4 w-4" />
                Create Character
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="mt-8 flex justify-center">
        <Button variant="outline" asChild>
          <Link href="/characters">Manage Characters</Link>
        </Button>
      </div>
    </div>
  );
}
