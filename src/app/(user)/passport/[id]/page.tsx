import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  PenSquare,
  Sword,
  ShieldCheck,
  BookOpen,
  Backpack,
  CreditCard,
} from "lucide-react";

interface PassportPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: PassportPageProps) {
  const character = await db.character.findUnique({
    where: { id: params.id },
    select: { name: true },
  });

  return {
    title: character
      ? `${character.name}'s Passport | Interphaze Pocket Scholar`
      : "Character Passport",
    description: "View your character's details",
  };
}

export default async function PassportPage({ params }: PassportPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Fetch the character with all its relations
  const character = await db.character.findUnique({
    where: {
      id: params.id,
    },
    include: {
      primaryClass: true,
      secondaryClass: true,
      skills: {
        orderBy: {
          title: "asc",
        },
      },
      inventory: {
        orderBy: {
          title: "asc",
        },
      },
      spells: {
        orderBy: {
          level: "asc",
        },
      },
    },
  });

  if (!character) {
    notFound();
  }

  // Verify ownership unless the user is an admin
  if (
    character.userId !== session.user.id &&
    session.user.role !== "ADMIN" &&
    session.user.role !== "SUPERADMIN"
  ) {
    redirect("/unauthorized");
  }

  return (
    <div className="container max-w-7xl mx-auto py-8">
      <div className="flex flex-col md:flex-row md:justify-between items-start gap-6 mb-8">
        <div>
          <h1 className="text-4xl font-bold">{character.name}</h1>
          <p className="text-xl text-muted-foreground mt-2">
            {character.primaryClass
              ? character.primaryClass.Title
              : "No Primary Class"}
            (Level {character.primaryClassLvl})
            {character.secondaryClass &&
              ` / ${character.secondaryClass.Title} (Level ${character.secondaryClassLvl})`}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link href={`/characters/${character.id}/edit`}>
              <PenSquare className="mr-2 h-4 w-4" />
              Edit Character
            </Link>
          </Button>
          <Button asChild>
            <Link href="/characters">Back to Characters</Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-5 mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="spells">Spells</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="mr-2 h-5 w-5" />
                  Currency
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {character.phazians} Phazians
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sword className="mr-2 h-5 w-5" />
                  Primary Class
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl mb-1">
                  {character.primaryClass
                    ? character.primaryClass.Title
                    : "None"}
                </p>
                <p className="text-muted-foreground">
                  Level {character.primaryClassLvl}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShieldCheck className="mr-2 h-5 w-5" />
                  Secondary Class
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl mb-1">
                  {character.secondaryClass
                    ? character.secondaryClass.Title
                    : "None"}
                </p>
                <p className="text-muted-foreground">
                  {character.secondaryClass
                    ? `Level ${character.secondaryClassLvl}`
                    : "No secondary class selected"}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Character Attributes</CardTitle>
              <CardDescription>
                Core stats and attributes for your character
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {character.Attributes &&
                  Object.entries(
                    character.Attributes as Record<string, any>
                  ).map(([key, value]) => (
                    <div key={key} className="p-4 bg-muted rounded-lg">
                      <p className="text-muted-foreground text-sm capitalize">
                        {key}
                      </p>
                      <p className="text-2xl font-semibold">{value}</p>
                    </div>
                  ))}

                {(!character.Attributes ||
                  Object.keys(character.Attributes as Record<string, any>)
                    .length === 0) && (
                  <p className="col-span-4 text-muted-foreground">
                    No attributes defined yet.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skills" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="mr-2 h-5 w-5" />
                Character Skills
              </CardTitle>
              <CardDescription>
                All skills learned by this character
              </CardDescription>
            </CardHeader>
            <CardContent>
              {character.skills.length > 0 ? (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {character.skills.map((skill) => (
                      <div key={skill.id} className="p-4 border rounded-lg">
                        <h3 className="text-lg font-semibold">{skill.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {skill.description}
                        </p>
                        <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="font-medium">Tier:</span>{" "}
                            {skill.tier}
                          </div>
                          <div>
                            <span className="font-medium">EP Cost:</span>{" "}
                            {skill.epCost}
                          </div>
                          <div>
                            <span className="font-medium">Activation:</span>{" "}
                            {skill.activation}
                          </div>
                          <div>
                            <span className="font-medium">Duration:</span>{" "}
                            {skill.duration}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <p className="text-muted-foreground">
                  This character hasn't learned any skills yet.
                </p>
              )}
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground">
                Total Skills: {character.skills.length}
              </p>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="spells" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="mr-2 h-5 w-5" />
                Spells
              </CardTitle>
              <CardDescription>Spells known by this character</CardDescription>
            </CardHeader>
            <CardContent>
              {character.spells.length > 0 ? (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {character.spells.map((spell) => (
                      <div key={spell.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between">
                          <h3 className="text-lg font-semibold">
                            {spell.title}
                          </h3>
                          <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded">
                            Level {spell.level}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          {spell.description}
                        </p>
                        {spell.type && (
                          <p className="text-sm mt-2">
                            <span className="font-medium">Type:</span>{" "}
                            {spell.type}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <p className="text-muted-foreground">
                  This character doesn't know any spells yet.
                </p>
              )}
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground">
                Total Spells: {character.spells.length}
              </p>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Backpack className="mr-2 h-5 w-5" />
                Inventory
              </CardTitle>
              <CardDescription>Items carried by this character</CardDescription>
            </CardHeader>
            <CardContent>
              {character.inventory.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-12 font-medium text-sm border-b pb-2">
                    <div className="col-span-5">Name</div>
                    <div className="col-span-3">Type</div>
                    <div className="col-span-2 text-right">Quantity</div>
                    <div className="col-span-2 text-right">Actions</div>
                  </div>
                  <ScrollArea className="h-[350px]">
                    <div className="space-y-2">
                      {character.inventory.map((item) => (
                        <div
                          key={item.id}
                          className="grid grid-cols-12 items-center py-2 border-b last:border-0"
                        >
                          <div className="col-span-5 font-medium">
                            {item.title}
                          </div>
                          <div className="col-span-3 text-sm text-muted-foreground">
                            {item.type || "Misc"}
                          </div>
                          <div className="col-span-2 text-right">
                            {item.quantity}
                          </div>
                          <div className="col-span-2 text-right">
                            <Button variant="ghost" size="sm">
                              Details
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  This character doesn't have any items yet.
                </p>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <p className="text-sm text-muted-foreground">
                Total Items: {character.inventory.length}
              </p>
              <Button size="sm" disabled>
                Add Item
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Character Notes</CardTitle>
              <CardDescription>
                Additional information and notes about your character
              </CardDescription>
            </CardHeader>
            <CardContent>
              {character.notes &&
              Object.keys(character.notes as Record<string, any>).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(character.notes as Record<string, any>).map(
                    ([key, value], index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <h3 className="text-lg font-semibold capitalize mb-2">
                          {key}
                        </h3>
                        <p className="text-sm">
                          {typeof value === "string"
                            ? value
                            : JSON.stringify(value, null, 2)}
                        </p>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  No notes have been added for this character.
                </p>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" asChild>
                <Link href={`/characters/${character.id}/edit`}>
                  <PenSquare className="mr-2 h-4 w-4" />
                  Edit Notes
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
