import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SpellsTab } from "@/components/SpellsTab";

// Import our new components
import { CharacterClassCards } from "@/components/passport/CharacterClassCards";
import { CharacterStatsCard } from "@/components/passport/CharacterStatsCard";
import { CharacterAttributesCard } from "@/components/passport/CharacterAttributesCard";
import { CharacterSkillsCard } from "@/components/passport/CharacterSkillsCard";
import { CharacterInventoryCard } from "@/components/passport/CharacterInventoryCard";
import { CharacterBackstoryCard } from "@/components/passport/CharacterBackstoryCard";
import { CharacterAdjustmentsCard } from "@/components/passport/CharacterAdjustmentsCard";
import { CharacterAdjustmentManager } from "@/components/passport/CharacterAdjustmentManager";
import { CharacterClassManager } from "@/components/passport/CharacterClassManager";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Import server actions
import {
  getCharacterForPassport,
  getAvailableClasses,
  getAvailableSkillsForCharacter,
} from "@/lib/actions/passport";

interface PassportPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PassportPageProps) {
  const { id } = await params;
  try {
    const character = await getCharacterForPassport(id);
    return {
      title: `${character.name}'s Passport | Interphaze Pocket Scholar`,
      description: "View your character's details",
    };
  } catch {
    return {
      title: "Character Passport",
      description: "View your character's details",
    };
  }
}

export default async function PassportPage({ params }: PassportPageProps) {
  const { id } = await params;
  const [character, availableClasses, skillData, session] = await Promise.all([
    getCharacterForPassport(id),
    getAvailableClasses(),
    getAvailableSkillsForCharacter(id),
    getServerSession(authOptions),
  ]);

  const unallocatedLevels = character.user?.UnallocatedLevels ?? 0;
  const isAdmin =
    session?.user?.role === "ADMIN" || session?.user?.role === "SUPERADMIN";
  const existingAdjustments = Array.isArray((character as any).adjustments)
    ? (character as any).adjustments
        .map((entry: any) => entry?.adjustment ?? entry)
        .filter(Boolean)
        .map((adj: any) => ({ id: adj.id, title: adj.title }))
    : [];

  return (
    <div className="min-h-screen flex flex-col w-full h-full">
      <div className="container px-2 sm:px-4 max-w-7xl mx-auto py-4 sm:py-6 flex-1 flex flex-col">
        {/* Header Section */}
        <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:justify-between items-start gap-3 sm:gap-6 mb-4 sm:mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
                {character.name}
              </h1>
              {unallocatedLevels > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs sm:text-sm">
                  {unallocatedLevels} Level{unallocatedLevels > 1 ? "s" : ""}{" "}
                  Available
                </Badge>
              )}
            </div>
            <p className="text-base sm:text-lg text-muted-foreground mt-1">
              {character.primaryClass
                ? character.primaryClass.Title + " "
                : "No Primary Class"}
              (Level {character.primaryClassLvl})
              {character.secondaryClass &&
                !character.secondaryClass.Title.toLowerCase().includes(
                  "none"
                ) &&
                ` / ${character.secondaryClass.Title} (Level ${character.secondaryClassLvl})`}
            </p>
          </div>

          <Button size="sm" className="sm:mt-0" asChild>
            <Link href="/characters">Back to Characters</Link>
          </Button>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="overview" className="w-full flex-1 flex flex-col">
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

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-2">
            <CharacterClassCards
              character={character}
              unallocatedLevels={unallocatedLevels}
              availableClasses={availableClasses}
            />
            <CharacterStatsCard character={character} />
            <CharacterAdjustmentsCard character={character} />
            {isAdmin && (
              <>
                <CharacterClassManager
                  characterId={character.id}
                  primaryClassId={character.primaryClassId}
                  secondaryClassId={character.secondaryClassId}
                  primaryClassLvl={character.primaryClassLvl}
                  secondaryClassLvl={character.secondaryClassLvl}
                />
                <CharacterAdjustmentManager
                  characterId={character.id}
                  existingAdjustments={existingAdjustments}
                />
              </>
            )}
            <CharacterAttributesCard character={character} />
          </TabsContent>

          {/* Skills Tab */}
          <TabsContent value="skills" className="space-y-4">
            <CharacterSkillsCard character={character} skillData={skillData} />
          </TabsContent>

          {/* Spells Tab */}
          <TabsContent value="spells" className="space-y-4">
            <SpellsTab character={character} />
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory" className="space-y-4">
            <CharacterInventoryCard character={character} />
          </TabsContent>

          {/* Backstory Tab */}
          <TabsContent value="notes" className="space-y-4">
            <CharacterBackstoryCard character={character} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
