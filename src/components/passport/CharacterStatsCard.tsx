import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateStatValue, getEPValues } from "@/lib/utils/character-stats";

interface CharacterStatsCardProps {
  character: any;
}

export function CharacterStatsCard({ character }: CharacterStatsCardProps) {
  return (
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
  );
}
