import { Sword, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClassLevelUpButton } from "@/components/ClassLevelUpButton";
import { SecondaryClassPrompt } from "@/components/SecondaryClassPrompt";

interface CharacterClassCardsProps {
  character: any;
  unallocatedLevels: number;
  availableClasses: { id: string; Title: string }[];
}

export function CharacterClassCards({
  character,
  unallocatedLevels,
  availableClasses,
}: CharacterClassCardsProps) {
  const hasSecondaryClass =
    character.secondaryClass &&
    !character.secondaryClass.Title.toLowerCase().includes("none") &&
    character.secondaryClassLvl > 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
      {/* Primary Class Card */}
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

      {/* Secondary Class Card */}
      {hasSecondaryClass ? (
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
              {character.secondaryClass?.Title.toLowerCase().includes("none")
                ? "No Secondary Class"
                : "You don't have a secondary class yet. Choose one to expand your character's abilities!"}
            </p>

            <SecondaryClassPrompt
              characterId={character.id}
              characterName={character.name}
              classes={availableClasses}
              hasUnallocatedLevels={unallocatedLevels > 0}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
