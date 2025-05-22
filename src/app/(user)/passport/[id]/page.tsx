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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  PenSquare,
  Sword,
  ShieldCheck,
  BookOpen,
  Backpack,
  Plus,
} from "lucide-react";
import { BackstoryRenderer } from "@/components/BackstoryRenderer";
import { Badge } from "@/components/ui/badge";
import { ClassLevelUpButton } from "@/components/ClassLevelUpButton";
import { SecondaryClassPrompt } from "@/components/SecondaryClassPrompt";
import { SpellsTab } from "@/components/SpellsTab";

interface PassportPageProps {
  params: {
    id: string;
  };
}

// Calculate stat values based on character class levels
function calculateStatValue(character: any, statName: string): number {
  let value = 0;

  // Calculate value from primary class if available
  if (character.primaryClass && character.primaryClass[statName]) {
    try {
      const primaryClassStat = character.primaryClass[statName];
      if (typeof primaryClassStat === "object") {
        // Handle different level brackets
        const level = character.primaryClassLvl.toString();
        if (primaryClassStat[level]) {
          value += parseInt(primaryClassStat[level]);
        } else {
          // If exact level not found, find the closest lower bracket
          const levels = Object.keys(primaryClassStat)
            .map(Number)
            .filter((l) => !isNaN(l))
            .sort((a, b) => a - b);

          const closestLevel =
            levels.filter((l) => l <= character.primaryClassLvl).pop() || 1;
          if (primaryClassStat[closestLevel.toString()]) {
            value += parseInt(primaryClassStat[closestLevel.toString()]);
          }
        }
      } else if (
        typeof primaryClassStat === "string" ||
        typeof primaryClassStat === "number"
      ) {
        value += parseInt(primaryClassStat.toString());
      }
    } catch (error) {
      console.error(`Error calculating ${statName} from primary class:`, error);
    }
  }

  // For EP, we don't combine primary and secondary values
  if (statName === "EP") {
    return value;
  }

  // Add value from secondary class if available (at half value)
  if (
    character.secondaryClass &&
    character.secondaryClass[statName] &&
    character.secondaryClassLvl > 0 &&
    !character.secondaryClass.Title.toLowerCase().includes("none")
  ) {
    try {
      const secondaryClassStat = character.secondaryClass[statName];
      if (typeof secondaryClassStat === "object") {
        // Get current level stat value
        const currentLevel = character.secondaryClassLvl;
        const currentLevelStr = currentLevel.toString();

        // Get previous level stat value
        const prevLevel = Math.max(currentLevel - 1, 0);
        const prevLevelStr = prevLevel.toString();

        let currentValue = 0;
        let prevValue = 0;

        // Find current level value
        if (secondaryClassStat[currentLevelStr]) {
          currentValue = parseInt(secondaryClassStat[currentLevelStr]);
        } else {
          // If exact level not found, find the closest lower bracket
          const levels = Object.keys(secondaryClassStat)
            .map(Number)
            .filter((l) => !isNaN(l))
            .sort((a, b) => a - b);

          const closestLevel =
            levels.filter((l) => l <= currentLevel).pop() || 0;
          if (secondaryClassStat[closestLevel.toString()]) {
            currentValue = parseInt(
              secondaryClassStat[closestLevel.toString()]
            );
          }
        }

        // Find previous level value
        if (prevLevel > 0) {
          if (secondaryClassStat[prevLevelStr]) {
            prevValue = parseInt(secondaryClassStat[prevLevelStr]);
          } else {
            // If exact level not found, find the closest lower bracket
            const levels = Object.keys(secondaryClassStat)
              .map(Number)
              .filter((l) => !isNaN(l))
              .sort((a, b) => a - b);

            const closestLevel =
              levels.filter((l) => l <= prevLevel).pop() || 0;
            if (secondaryClassStat[closestLevel.toString()]) {
              prevValue = parseInt(secondaryClassStat[closestLevel.toString()]);
            }
          }
        }

        // Calculate half of the difference and add it to the total
        const levelDifference = currentValue - prevValue;
        value += Math.floor(levelDifference / 2);
      } else if (
        typeof secondaryClassStat === "string" ||
        typeof secondaryClassStat === "number"
      ) {
        // For static values, take half
        value += Math.floor(parseInt(secondaryClassStat.toString()) / 2);
      }
    } catch (error) {
      console.error(
        `Error calculating ${statName} from secondary class:`,
        error
      );
    }
  }

  return value;
}

// Return both primary and secondary EP values
function getEPValues(character: any): { primary: number; secondary: number } {
  let primaryEP = 0;
  let secondaryEP = 0;

  // Calculate primary EP
  if (character.primaryClass && character.primaryClass.EP) {
    try {
      const primaryClassStat = character.primaryClass.EP;
      if (typeof primaryClassStat === "object") {
        // Handle different level brackets
        const level = character.primaryClassLvl.toString();
        if (primaryClassStat[level]) {
          primaryEP = parseInt(primaryClassStat[level]);
        } else {
          // If exact level not found, find the closest lower bracket
          const levels = Object.keys(primaryClassStat)
            .map(Number)
            .filter((l) => !isNaN(l))
            .sort((a, b) => a - b);

          const closestLevel =
            levels.filter((l) => l <= character.primaryClassLvl).pop() || 1;
          if (primaryClassStat[closestLevel.toString()]) {
            primaryEP = parseInt(primaryClassStat[closestLevel.toString()]);
          }
        }
      } else if (
        typeof primaryClassStat === "string" ||
        typeof primaryClassStat === "number"
      ) {
        primaryEP = parseInt(primaryClassStat.toString());
      }
    } catch (error) {
      console.error(`Error calculating EP from primary class:`, error);
    }
  }

  // Calculate secondary EP
  if (
    character.secondaryClass &&
    character.secondaryClass.EP &&
    character.secondaryClassLvl > 0 &&
    !character.secondaryClass.Title.toLowerCase().includes("none")
  ) {
    try {
      const secondaryClassStat = character.secondaryClass.EP;
      if (typeof secondaryClassStat === "object") {
        // Handle different level brackets
        const level = character.secondaryClassLvl.toString();
        if (secondaryClassStat[level]) {
          secondaryEP = parseInt(secondaryClassStat[level]);
        } else {
          // If exact level not found, find the closest lower bracket
          const levels = Object.keys(secondaryClassStat)
            .map(Number)
            .filter((l) => !isNaN(l))
            .sort((a, b) => a - b);

          const closestLevel =
            levels.filter((l) => l <= character.secondaryClassLvl).pop() || 1;
          if (secondaryClassStat[closestLevel.toString()]) {
            secondaryEP = parseInt(secondaryClassStat[closestLevel.toString()]);
          }
        }
      } else if (
        typeof secondaryClassStat === "string" ||
        typeof secondaryClassStat === "number"
      ) {
        secondaryEP = parseInt(secondaryClassStat.toString());
      }
    } catch (error) {
      console.error(`Error calculating EP from secondary class:`, error);
    }
  }

  return { primary: primaryEP, secondary: secondaryEP };
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
      primarySkills: {
        orderBy: {
          title: "asc",
        },
      },
      secondarySkills: {
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
      user: {
        select: {
          id: true,
          UnallocatedLevels: true,
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

  const unallocatedLevels = character.user?.UnallocatedLevels || 0;

  return (
    <div className="container px-2 sm:px-4 max-w-7xl mx-auto py-4 sm:py-6">
      <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:justify-between items-start gap-3 sm:gap-6 mb-4 sm:mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
              {character.name}
            </h1>
            {unallocatedLevels > 0 && (
              <Badge variant="secondary" className="ml-2 text-xs sm:text-sm">
                {unallocatedLevels} Level
                {unallocatedLevels > 1 ? "s" : ""} Available
              </Badge>
            )}
          </div>
          <p className="text-base sm:text-lg text-muted-foreground mt-1">
            {character.primaryClass
              ? character.primaryClass.Title + " "
              : "No Primary Class"}
            (Level {character.primaryClassLvl})
            {character.secondaryClass &&
              ` / ${character.secondaryClass.Title} (Level ${character.secondaryClassLvl})`}
          </p>
        </div>

        <Button size="sm" className="sm:mt-0" asChild>
          <Link href="/characters">Back to Characters</Link>
        </Button>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-5 mb-4 sm:mb-6 h-auto">
          <TabsTrigger value="overview" className="py-2 text-xs sm:text-sm">
            Overview
          </TabsTrigger>
          <TabsTrigger value="skills" className="py-2 text-xs sm:text-sm">
            Skills
          </TabsTrigger>
          <TabsTrigger value="spells" className="py-2 text-xs sm:text-sm">
            Spells
          </TabsTrigger>
          <TabsTrigger value="inventory" className="py-2 text-xs sm:text-sm">
            Inventory
          </TabsTrigger>
          <TabsTrigger value="notes" className="py-2 text-xs sm:text-sm">
            Backstory
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            <Card className="shadow-sm">
              <CardHeader className="p-1 sm:p-2">
                <CardTitle className="flex items-center justify-between text-base">
                  <div className="flex items-center">
                    <Sword className="mr-2 h-4 w-4" />
                    Primary Class
                    {character.primaryClass && (
                      <span className="ml-2 font-normal">
                        - {character.primaryClass.Title}
                      </span>
                    )}
                    <span className="ml-2 text-xs text-muted-foreground">
                      (Level {character.primaryClassLvl})
                    </span>
                  </div>

                  {unallocatedLevels > 0 && (
                    <ClassLevelUpButton
                      characterId={character.id}
                      classType="primary"
                      currentLevel={character.primaryClassLvl}
                    />
                  )}
                </CardTitle>
              </CardHeader>
            </Card>

            {character.secondaryClass &&
            !character.secondaryClass.Title.toLowerCase().includes("none") &&
            character.secondaryClassLvl > 0 ? (
              <Card className="shadow-sm">
                <CardHeader className="p-1 sm:p-2">
                  <CardTitle className="flex items-center justify-between text-base">
                    <div className="flex items-center">
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      Secondary Class
                      {character.secondaryClass && (
                        <span className="ml-2 font-normal">
                          - {character.secondaryClass.Title}
                        </span>
                      )}
                      <span className="ml-2 text-xs text-muted-foreground">
                        (Level {character.secondaryClassLvl})
                      </span>
                    </div>

                    {unallocatedLevels > 0 && (
                      <ClassLevelUpButton
                        characterId={character.id}
                        classType="secondary"
                        currentLevel={character.secondaryClassLvl}
                      />
                    )}
                  </CardTitle>
                </CardHeader>
              </Card>
            ) : (
              <Card className="shadow-sm">
                <CardHeader className="p-1 sm:p-2">
                  <CardTitle className="flex items-center justify-between text-base">
                    <div className="flex items-center">
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      Secondary Class
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-1 sm:p-2">
                  <p className="text-sm text-muted-foreground mb-2">
                    {character.secondaryClass?.Title.toLowerCase().includes(
                      "none"
                    )
                      ? "No Secondary Class"
                      : "You don't have a secondary class yet. Choose one to expand your character's abilities!"}
                  </p>

                  <SecondaryClassPrompt
                    characterId={character.id}
                    characterName={character.name}
                    classes={await db.class.findMany({
                      select: { id: true, Title: true },
                      where: {
                        NOT: {
                          Title: {
                            contains: "none",
                            mode: "insensitive",
                          },
                        },
                      },
                      orderBy: { Title: "asc" },
                    })}
                    hasUnallocatedLevels={unallocatedLevels > 0}
                  />
                </CardContent>
              </Card>
            )}
          </div>

          <Card className="shadow-sm">
            <CardHeader className="p-1 sm:p-4 sm:pb-2">
              <CardTitle className="text-base sm:text-lg pb-0">
                Character Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="p-1 sm:p-4 sm:pt-0">
              {/* HP and EP in first row */}
              <div className="grid grid-cols-2 gap-2 mb-2">
                {/* HP Stat Card */}
                <div className="bg-background border rounded-lg p-3">
                  <h4 className="font-medium text-sm mb-1">Hit Points</h4>
                  <p className="text-2xl font-bold">
                    {calculateStatValue(character, "HP")}
                  </p>
                </div>

                {/* EP Stat Card */}
                <div className="bg-background border rounded-lg p-3">
                  <h4 className="font-medium text-sm mb-1">Energy Points</h4>
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold">
                        {character.primaryClass
                          ? character.primaryClass.Title
                          : "Primary"}
                      </span>
                      <span className="text-lg">
                        {getEPValues(character).primary}
                      </span>
                    </div>
                    {character.secondaryClass &&
                      character.secondaryClassLvl > 0 &&
                      !character.secondaryClass.Title.toLowerCase().includes(
                        "none"
                      ) && (
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-lg font-semibold">
                            {character.secondaryClass.Title}
                          </span>
                          <span className="text-lg">
                            {getEPValues(character).secondary}
                          </span>
                        </div>
                      )}
                  </div>
                </div>
              </div>

              {/* Combat Stats in second row */}
              <div className="mb-3">
                <h4 className="font-medium text-sm mb-2 text-muted-foreground">
                  Combat Stats
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="flex items-center justify-between bg-background border rounded-lg p-2">
                    <span className="text-sm">Attack</span>
                    <span className="text-lg font-semibold">
                      {calculateStatValue(character, "Attack")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-background border rounded-lg p-2">
                    <span className="text-sm">Accuracy</span>
                    <span className="text-lg font-semibold">
                      {calculateStatValue(character, "Accuracy")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-background border rounded-lg p-2">
                    <span className="text-sm">Defense</span>
                    <span className="text-lg font-semibold">
                      {calculateStatValue(character, "Defense")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-background border rounded-lg p-2">
                    <span className="text-sm">Resistance</span>
                    <span className="text-lg font-semibold">
                      {calculateStatValue(character, "Resistance")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Saves in third row */}
              <div>
                <h4 className="font-medium text-sm mb-2 text-muted-foreground">
                  Saving Throws
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  <div className="flex items-center justify-between bg-background border rounded-lg p-2">
                    <span className="text-sm">Tough</span>
                    <span className="text-lg font-semibold">
                      {calculateStatValue(character, "Tough")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-background border rounded-lg p-2">
                    <span className="text-sm">Quick</span>
                    <span className="text-lg font-semibold">
                      {calculateStatValue(character, "Quick")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-background border rounded-lg p-2">
                    <span className="text-sm">Mind</span>
                    <span className="text-lg font-semibold">
                      {calculateStatValue(character, "Mind")}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Only show attributes card if there are attributes */}
          {character.Attributes &&
            Object.entries(character.Attributes as Record<string, any>).filter(
              ([key]) => key.toLowerCase() !== "race"
            ).length > 0 && (
              <Card className="shadow-sm mt-4">
                <CardHeader className="p-1 sm:p-2">
                  <CardTitle className="text-base">
                    Additional Attributes
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-1 sm:p-2">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {Object.entries(character.Attributes as Record<string, any>)
                      .filter(([key]) => key.toLowerCase() !== "race")
                      .map(([key, value]) => (
                        <div
                          key={key}
                          className="flex items-center justify-between bg-background border rounded-lg p-2"
                        >
                          <span className="text-sm capitalize">{key}</span>
                          <span className="text-lg font-semibold">{value}</span>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}
        </TabsContent>

        <TabsContent value="skills" className="space-y-4">
          <Card className="shadow-sm">
            <CardHeader className="p-3 sm:p-4">
              <CardTitle className="flex items-center text-base sm:text-lg">
                <BookOpen className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Character Skills
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                All skills learned by this character
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              {character.primarySkills.length > 0 ||
              character.secondarySkills.length > 0 ? (
                <ScrollArea className="h-[300px] sm:h-[400px]">
                  <div className="space-y-3">
                    {character.primarySkills.map((skill) => (
                      <div key={skill.id} className="p-3 border rounded-lg">
                        <h3 className="text-base font-semibold">
                          {skill.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {skill.description}
                        </p>
                        <div className="mt-2 grid grid-cols-2 gap-2 text-xs sm:text-sm">
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
                    {character.secondarySkills.map((skill) => (
                      <div key={skill.id} className="p-3 border rounded-lg">
                        <h3 className="text-base font-semibold">
                          {skill.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {skill.description}
                        </p>
                        <div className="mt-2 grid grid-cols-2 gap-2 text-xs sm:text-sm">
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
                <p className="text-sm text-muted-foreground">
                  This character hasn&apos;t learned any skills yet.
                </p>
              )}
            </CardContent>
            <CardFooter className="p-3 sm:p-4 pt-0">
              <p className="text-xs sm:text-sm text-muted-foreground">
                Total Skills:{" "}
                {character.primarySkills.length +
                  character.secondarySkills.length}
              </p>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="spells" className="space-y-4">
          <SpellsTab character={character} />
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <Card className="shadow-sm">
            <CardHeader className="p-3 sm:p-4">
              <CardTitle className="flex items-center text-base sm:text-lg">
                <Backpack className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Inventory
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Items carried by this character
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              {character.inventory.length > 0 ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-12 font-medium text-xs sm:text-sm border-b pb-2">
                    <div className="col-span-6 sm:col-span-5">Name</div>
                    <div className="col-span-3 hidden sm:block">Type</div>
                    <div className="col-span-3 sm:col-span-2 text-right">
                      Qty
                    </div>
                    <div className="col-span-3 sm:col-span-2 text-right">
                      Actions
                    </div>
                  </div>
                  <ScrollArea className="h-[250px] sm:h-[350px]">
                    <div className="space-y-2">
                      {character.inventory.map((item) => (
                        <div
                          key={item.id}
                          className="grid grid-cols-12 items-center py-2 border-b last:border-0"
                        >
                          <div className="col-span-6 sm:col-span-5 font-medium text-sm">
                            {item.title}
                          </div>
                          <div className="hidden sm:block col-span-3 text-xs text-muted-foreground">
                            {item.type || "Misc"}
                          </div>
                          <div className="col-span-3 sm:col-span-2 text-right text-sm">
                            {item.quantity}
                          </div>
                          <div className="col-span-3 sm:col-span-2 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs"
                            >
                              Details
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  This character doesn&apos;t have any items yet.
                </p>
              )}
            </CardContent>
            <CardFooter className="p-3 sm:p-4 pt-0 flex justify-between">
              <p className="text-xs sm:text-sm text-muted-foreground">
                Total Items: {character.inventory.length}
              </p>
              <Button size="sm" className="h-7 text-xs" disabled>
                Add Item
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="space-y-4">
          <Card className="shadow-sm">
            <CardHeader className="p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between">
              <div>
                <CardTitle className="text-base sm:text-lg">
                  Backstory
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Write some fun stories about your character
                </CardDescription>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="mt-2 sm:mt-0"
                asChild
              >
                <Link href={`/characters/${character.id}/backstory`}>
                  <PenSquare className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  Edit Backstory
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              {character.notes &&
              (character.notes as Record<string, any>).backstory ? (
                <div className="border rounded-lg p-3">
                  <ScrollArea className="h-[250px] sm:h-[300px]">
                    <BackstoryRenderer
                      content={
                        (character.notes as Record<string, any>).backstory
                      }
                    />
                  </ScrollArea>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No backstory has been added for this character.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
