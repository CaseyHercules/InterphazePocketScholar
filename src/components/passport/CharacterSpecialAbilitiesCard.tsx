"use client";

import { getSpecialAbilitiesFromInlineEffects } from "@/types/inline-effects";

interface CharacterSpecialAbilitiesCardProps {
  character: any;
}

export function CharacterSpecialAbilitiesCard({
  character,
}: CharacterSpecialAbilitiesCardProps) {
  const abilities = getSpecialAbilitiesFromInlineEffects(character.inlineEffectsJson);

  if (abilities.length === 0) return null;

  const chevron = (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );

  return (
    <section
      aria-labelledby="special-abilities-heading"
      className="rounded-lg border-2 border-stone-300 dark:border-stone-600 bg-gradient-to-b from-amber-50 to-amber-100/70 dark:from-amber-950/50 dark:to-stone-900 shadow-sm p-3"
    >
      <details className="group" open>
        <summary className="list-none cursor-pointer [&::-webkit-details-marker]:hidden">
          <div className="flex flex-row items-center justify-between gap-2 py-1 group-open:py-2 group-open:pb-3 group-open:mb-3 group-open:border-b group-open:border-stone-300 dark:group-open:border-stone-600">
            <div className="min-w-0">
              <h2
                id="special-abilities-heading"
                className="text-xl font-semibold leading-tight text-stone-900 dark:text-stone-100 tracking-tight"
              >
                Special Abilities
              </h2>
              <p className="text-sm text-stone-600 dark:text-stone-400 mt-0.5">
                Unique abilities from your character
              </p>
            </div>
            <span className="text-muted-foreground shrink-0 group-open:rotate-180 transition-transform">
              {chevron}
            </span>
          </div>
        </summary>
        <div className="divide-y divide-stone-200 dark:divide-stone-700">
          {abilities.map((ability, index) => (
            <div key={`${ability.title}-${index}`} className="py-2.5 first:pt-0 last:pb-0">
              <h3 className="font-semibold text-sm sm:text-base">
                {ability.title || "Special ability"}
              </h3>
              {ability.note?.trim() && (
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                  {ability.note.trim()}
                </p>
              )}
            </div>
          ))}
        </div>
      </details>
    </section>
  );
}
