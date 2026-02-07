"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getSpecialAbilitiesFromInlineEffects } from "@/types/inline-effects";
import type { InlineEffect } from "@/types/inline-effects";

interface CharacterSpecialAbilitiesCardProps {
  character: any;
}

export function CharacterSpecialAbilitiesCard({
  character,
}: CharacterSpecialAbilitiesCardProps) {
  const abilities = getSpecialAbilitiesFromInlineEffects(character.inlineEffectsJson);

  if (abilities.length === 0) return null;

  return (
    <section aria-labelledby="special-abilities-heading" className="space-y-3">
      <div className="pl-3">
        <h2
          id="special-abilities-heading"
          className="text-lg font-semibold leading-tight tracking-tight"
        >
          Special Abilities
        </h2>
        <p className="text-xs text-muted-foreground">
          Unique abilities from your character
        </p>
      </div>
      <div className="space-y-2">
        {abilities.map((ability, index) => (
          <Card
            key={`${ability.title}-${index}`}
            className="overflow-hidden border-l-4 border-l-amber-500/50 bg-amber-50/30 dark:bg-amber-950/20 dark:border-l-amber-400/50"
          >
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-sm sm:text-base">
                      {ability.title || "Special ability"}
                    </h3>
                    <Badge
                      variant="secondary"
                      className="text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200"
                    >
                      Special
                    </Badge>
                  </div>
                  {ability.note?.trim() && (
                    <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                      {ability.note.trim()}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
