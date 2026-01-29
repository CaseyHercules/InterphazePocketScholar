import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  calculateStatValue,
  getEPAvailableValues,
  getEPBreakdown,
  getStatBreakdown,
  type StatAdjustmentBreakdown,
} from "@/lib/utils/character-stats";
import { HoverBreakdown } from "@/components/passport/HoverBreakdown";

interface CharacterStatsCardProps {
  character: any;
}

export function CharacterStatsCard({ character }: CharacterStatsCardProps) {
  const renderAdjustmentLines = (items: StatAdjustmentBreakdown[]) => {
    if (!items.length) {
      return (
        <div className="text-sm text-muted-foreground">
          No active adjustments
        </div>
      );
    }

    return (
      <div className="space-y-1">
        {items.map((item, index) => (
          <div key={`${item.title}-${index}`} className="flex justify-between">
            <span className="text-sm text-muted-foreground">{item.title}</span>
            <span className="text-sm font-medium">
              {item.value >= 0 ? `+${item.value}` : item.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const renderConditionalLines = (
    items: StatAdjustmentBreakdown[],
    conditionPrefix: string
  ) => {
    if (!items.length) {
      return (
        <div className="text-sm text-muted-foreground">
          No conditional bonuses
        </div>
      );
    }

    return (
      <div className="space-y-1">
        {items.map((item, index) => (
          <div key={`${item.title}-${index}`} className="space-y-0.5">
            {/* <div className="text-muted-foreground">{item.title}</div> */}
            <div className="flex justify-between">
              <span className="text-sm">
                {item.condition
                  ? `${conditionPrefix} ${item.condition}`
                  : "Conditional"}
              </span>
              <span className="text-sm font-medium">
                {item.value >= 0 ? `+${item.value}` : item.value}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderStatTooltip = (
    label: string,
    breakdown: ReturnType<typeof getStatBreakdown>
  ) => {
    const lowerLabel = label.toLowerCase();
    const conditionPrefix =
      lowerLabel === "attack" || lowerLabel === "accuracy" ? "with" : "vs";

    return (
    <div className="w-56 space-y-2">
      <div className="text-sm font-semibold">{label} breakdown</div>
      <div className="space-y-1">
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Primary class</span>
          <span className="text-sm font-medium">{breakdown.primary}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Secondary class</span>
          <span className="text-sm font-medium">{breakdown.secondary}</span>
        </div>
      </div>
      <div className="border-t pt-2">{renderAdjustmentLines(breakdown.adjustments)}</div>
      <div className="border-t pt-2">
        <div className="text-sm font-semibold">Conditional bonuses</div>
        <div className="mt-1">
          {renderConditionalLines(
            breakdown.conditionalAdjustments,
            conditionPrefix
          )}
        </div>
      </div>
      <div className="flex justify-between border-t pt-2">
        <span className="text-sm font-semibold">Total</span>
        <span className="text-sm font-semibold">{breakdown.total}</span>
      </div>
    </div>
    );
  };

  const renderEPTooltip = () => {
    const breakdown = getEPBreakdown(character);
    return (
      <div className="w-56 space-y-2">
        <div className="text-sm font-semibold">Energy Points breakdown</div>
        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Primary class</span>
            <span className="text-sm font-medium">{breakdown.primary}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Secondary class</span>
            <span className="text-sm font-medium">{breakdown.secondary}</span>
          </div>
        </div>
        <div className="border-t pt-2 space-y-1">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">
              Skill EP Cost (primary)
            </span>
            <span className="text-sm font-medium">
              -{breakdown.skillReductions.primary}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">
              Skill EP Cost (secondary)
            </span>
            <span className="text-sm font-medium">
              -{breakdown.skillReductions.secondary}
            </span>
          </div>
        </div>
        <div className="border-t pt-2">
          {renderAdjustmentLines(breakdown.adjustments)}
        </div>
        <div className="border-t pt-2">
          <div className="text-sm font-semibold">Conditional bonuses</div>
          <div className="mt-1">
            {renderConditionalLines(breakdown.conditionalAdjustments, "vs")}
          </div>
        </div>
        <div className="flex justify-between border-t pt-2">
          <span className="text-xs font-semibold">Total</span>
          <span className="text-xs font-semibold">{breakdown.total}</span>
        </div>
      </div>
    );
  };

  const StatTile = ({
    label,
    value,
    tooltip,
  }: {
    label: string;
    value: number | string;
    tooltip: React.ReactNode;
  }) => (
    <HoverBreakdown content={tooltip}>
      <div className="flex items-center justify-between bg-background border rounded-lg p-2">
        <span className="text-sm">{label}</span>
        <span className="text-lg font-semibold">{value}</span>
      </div>
    </HoverBreakdown>
  );

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
          <HoverBreakdown
            content={renderStatTooltip(
              "Hit Points",
              getStatBreakdown(character, "HP")
            )}
          >
            <div className="bg-background border rounded-lg p-3">
              <h4 className="font-medium text-sm mb-1">Hit Points</h4>
              <p className="text-2xl font-bold">
                {calculateStatValue(character, "HP")}
              </p>
            </div>
          </HoverBreakdown>

          {/* EP Stat Card */}
          <HoverBreakdown content={renderEPTooltip()}>
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
                    {getEPAvailableValues(character).primary}
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
                        {getEPAvailableValues(character).secondary}
                      </span>
                    </div>
                  )}
              </div>
            </div>
          </HoverBreakdown>
        </div>

        {/* Combat Stats in second row */}
        <div className="mb-3">
          <h4 className="font-medium text-sm mb-2 text-muted-foreground">
            Combat Stats
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <StatTile
              label="Attack"
              value={calculateStatValue(character, "Attack")}
              tooltip={renderStatTooltip(
                "Attack",
                getStatBreakdown(character, "Attack")
              )}
            />
            <StatTile
              label="Accuracy"
              value={calculateStatValue(character, "Accuracy")}
              tooltip={renderStatTooltip(
                "Accuracy",
                getStatBreakdown(character, "Accuracy")
              )}
            />
            <StatTile
              label="Defense"
              value={calculateStatValue(character, "Defense")}
              tooltip={renderStatTooltip(
                "Defense",
                getStatBreakdown(character, "Defense")
              )}
            />
            <StatTile
              label="Resistance"
              value={calculateStatValue(character, "Resistance")}
              tooltip={renderStatTooltip(
                "Resistance",
                getStatBreakdown(character, "Resistance")
              )}
            />
          </div>
        </div>

        {/* Saves in third row */}
        <div>
          <h4 className="font-medium text-sm mb-2 text-muted-foreground">
            Saving Throws
          </h4>
          <div className="grid grid-cols-3 gap-2">
            <StatTile
              label="Tough"
              value={calculateStatValue(character, "Tough")}
              tooltip={renderStatTooltip(
                "Tough",
                getStatBreakdown(character, "Tough")
              )}
            />
            <StatTile
              label="Quick"
              value={calculateStatValue(character, "Quick")}
              tooltip={renderStatTooltip(
                "Quick",
                getStatBreakdown(character, "Quick")
              )}
            />
            <StatTile
              label="Mind"
              value={calculateStatValue(character, "Mind")}
              tooltip={renderStatTooltip(
                "Mind",
                getStatBreakdown(character, "Mind")
              )}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
