"use client";

import { Badge } from "@/components/ui/badge";
import {
  getRacialAdjustmentData,
  type RacialAdjustmentData,
  type StatDisplayItem,
  type AbilityDisplayItem,
} from "@/lib/utils/racial-adjustments";

type CharacterAdjustmentsCardProps = {
  character: any;
  embedded?: boolean;
  showSectionTitle?: boolean;
};

function flattenToPairs(data: RacialAdjustmentData): Array<[StatDisplayItem | AbilityDisplayItem | null, StatDisplayItem | AbilityDisplayItem | null]> {
  const all = [
    ...data.statItems.map((s) => s as StatDisplayItem | AbilityDisplayItem),
    ...data.abilityItems,
  ];
  const pairs: Array<[StatDisplayItem | AbilityDisplayItem | null, StatDisplayItem | AbilityDisplayItem | null]> = [];
  for (let i = 0; i < all.length; i += 2) {
    pairs.push([all[i] ?? null, all[i + 1] ?? null]);
  }
  return pairs;
}

function ItemContent({
  item,
  className = "",
}: {
  item: StatDisplayItem | AbilityDisplayItem;
  className?: string;
}) {
  const optional = item.optional;
  const optionalClass = optional ? "italic text-muted-foreground" : "";
  const display = "formatted" in item ? item.formatted : item.text;
  return <span className={`${optionalClass} ${className}`}>{display}</span>;
}

function RacialTraitsContent(
  data: RacialAdjustmentData,
  opts?: { showTitle?: boolean }
) {
  const pairs = flattenToPairs(data);
  return (
    <div className="space-y-3">
      {opts?.showTitle && (
        <div>
          <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100">
            Racial Traits
          </h3>
          {data.race && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {data.race}
            </p>
          )}
        </div>
      )}
      {!opts?.showTitle && data.race && (
        <Badge variant="outline" className="text-xs font-medium text-stone-600 dark:text-stone-400">
          {data.race}
        </Badge>
      )}
      <div className="divide-y divide-stone-200 dark:divide-stone-700">
        {pairs.map(([a, b], i) => (
          <div key={i} className="grid grid-cols-2 gap-x-4 py-2.5 text-xs">
            <div>{a ? <ItemContent item={a} /> : null}</div>
            <div>{b ? <ItemContent item={b} /> : null}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CharacterAdjustmentsCard({
  character,
  embedded = false,
  showSectionTitle = false,
}: CharacterAdjustmentsCardProps) {
  const data = getRacialAdjustmentData(character);

  if (!data.hasContent && !embedded) {
    return null;
  }

  const headerTitle = data.race ? `Racial Traits: ${data.race}` : "Racial Traits & Adjustments";
  const content = RacialTraitsContent(data, { showTitle: showSectionTitle });

  if (embedded) {
    return (
      <div className="min-h-[4rem]">
        {data.hasContent ? content : <p className="text-sm text-muted-foreground py-3">No racial traits.</p>}
      </div>
    );
  }

  return (
    <section
      aria-labelledby="racial-traits-heading"
      className="rounded-lg border-2 border-stone-300 dark:border-stone-600 bg-gradient-to-b from-stone-50 to-stone-100/80 dark:from-stone-900 dark:to-stone-950 shadow-sm p-3"
    >
      <details className="group" open>
        <summary className="list-none cursor-pointer [&::-webkit-details-marker]:hidden">
          <div className="flex flex-row items-center justify-between gap-2 py-1 group-open:py-2 group-open:pb-3 group-open:mb-3 group-open:border-b group-open:border-stone-300 dark:group-open:border-stone-600">
            <div className="min-w-0">
              <h2
                id="racial-traits-heading"
                className="text-xl font-semibold leading-tight text-stone-900 dark:text-stone-100 tracking-tight"
              >
                {headerTitle}
              </h2>
              <p className="text-sm text-stone-600 dark:text-stone-400 mt-0.5">
                Stat bonuses and abilities from race
              </p>
            </div>
            <span className="text-muted-foreground shrink-0 group-open:rotate-180 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </span>
          </div>
        </summary>
        {content}
      </details>
    </section>
  );
}
