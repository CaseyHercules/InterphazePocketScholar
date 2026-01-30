"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HoverBreakdown } from "@/components/passport/HoverBreakdown";

type AdjustmentEffect = {
  type?: string;
  stat?: string;
  value?: number;
  condition?: string;
  applyToTotal?: boolean;
  note?: string;
  targetSkillId?: string;
  targetField?: string;
  modifier?: number | string;
  classId?: string;
  maxTier?: number;
};

type AdjustmentEntry = {
  id?: string;
  title?: string;
  effectsJson?: {
    effects?: AdjustmentEffect[];
  };
};

type CharacterAdjustmentsCardProps = {
  character: any;
};

function formatEffect(effect: AdjustmentEffect): string {
  if (effect.type === "stat_bonus") {
    const stat = effect.stat ?? "Stat";
    const value =
      typeof effect.value === "number"
        ? effect.value >= 0
          ? `+${effect.value}`
          : `${effect.value}`
        : "+0";
    const condition = effect.condition?.trim();
    const conditionalLabel =
      effect.applyToTotal === false || condition ? " (conditional)" : "";
    return `${value} ${stat}${condition ? ` vs ${condition}` : ""}${conditionalLabel}`;
  }

  if (effect.type === "skill_modifier") {
    const field = effect.targetField ?? "skill";
    const mod =
      typeof effect.modifier === "number"
        ? effect.modifier >= 0
          ? `+${effect.modifier}`
          : `${effect.modifier}`
        : effect.modifier ?? "";
    return `Modify skill ${field}: ${mod}`;
  }

  if (effect.type === "grant_skill") {
    const tier = effect.maxTier;
    return tier ? `Grant skills up to Tier ${tier}` : "Grant skill access";
  }

  if (effect.type === "pick_skill_by_tier") {
    const tier = effect.maxTier;
    return tier
      ? `Pick any skill up to Tier ${tier} from your class(es)`
      : "Pick skill by tier";
  }

  if (effect.note && effect.note.trim()) {
    return effect.note.trim();
  }

  return effect.type ? effect.type : "Effect";
}

export function CharacterAdjustmentsCard({
  character,
}: CharacterAdjustmentsCardProps) {
  const entries = Array.isArray(character?.adjustments)
    ? character.adjustments
        .map((entry: any) => entry?.adjustment ?? entry)
        .filter(Boolean)
    : [];

  if (!entries.length) {
    return null;
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="p-1 sm:p-4 sm:pb-2">
        <CardTitle className="text-base sm:text-lg pb-0">
          Racial Traits & Adjustments
        </CardTitle>
      </CardHeader>
      <CardContent className="p-1 sm:p-4 sm:pt-0">
        <div className="flex flex-wrap gap-2">
          {entries.map((adjustment: AdjustmentEntry, index: number) => {
            const effects = adjustment.effectsJson?.effects ?? [];
            const hasEffects = Array.isArray(effects) && effects.length > 0;

            return (
              <HoverBreakdown
                key={adjustment.id ?? `${adjustment.title}-${index}`}
                content={
                  <div className="w-64 space-y-2">
                    <div className="text-sm font-semibold">
                      {adjustment.title ?? "Adjustment"}
                    </div>
                    {hasEffects ? (
                      <div className="space-y-1">
                        {effects.map((effect, effectIndex) => (
                          <div
                            key={`${effect.type}-${effectIndex}`}
                            className="text-sm text-muted-foreground"
                          >
                            {formatEffect(effect)}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        No effect details
                      </div>
                    )}
                  </div>
                }
              >
                <div className="rounded-md border bg-background px-2 py-1 text-sm">
                  {adjustment.title ?? "Adjustment"}
                </div>
              </HoverBreakdown>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
