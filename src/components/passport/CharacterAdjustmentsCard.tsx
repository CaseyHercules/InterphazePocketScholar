"use client";

import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  getRacialAdjustmentData,
  type RacialAdjustmentData,
  type StatDisplayItem,
  type AbilityDisplayItem,
} from "@/lib/utils/racial-adjustments";

type CharacterAdjustmentsCardProps = {
  character: any;
  variant?: "table" | "grouped" | "compact" | "table-a" | "table-b" | "table-c";
  label?: string;
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

function DesignTableA(data: RacialAdjustmentData) {
  const pairs = flattenToPairs(data);
  return (
    <div className="space-y-1">
      {data.race && (
        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
          {data.race}
        </div>
      )}
      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs">
        {pairs.map(([a, b], i) => (
          <div key={i} className="contents">
            <div className="py-0.5">{a ? <ItemContent item={a} /> : null}</div>
            <div className="py-0.5">{b ? <ItemContent item={b} /> : null}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DesignTableB(data: RacialAdjustmentData) {
  const pairs = flattenToPairs(data);
  return (
    <div className="space-y-1.5">
      {data.race && (
        <Badge variant="outline" className="text-xs font-medium">
          {data.race}
        </Badge>
      )}
      <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs border-l-2 border-muted pl-2.5">
        {pairs.map(([a, b], i) => (
          <div key={i} className="contents">
            <div className="py-0.5">{a ? <ItemContent item={a} /> : null}</div>
            <div className="py-0.5">{b ? <ItemContent item={b} /> : null}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DesignTableC(data: RacialAdjustmentData) {
  const pairs = flattenToPairs(data);
  return (
    <div className="rounded-md border bg-muted/20 p-2">
      <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs">
        {pairs.map(([a, b], i) => (
          <div key={i} className="contents">
            <div className="py-0.5">{a ? <ItemContent item={a} /> : null}</div>
            <div className="py-0.5">{b ? <ItemContent item={b} /> : null}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DesignTable(data: RacialAdjustmentData) {
  const pairs = flattenToPairs(data);
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:gap-x-6">
      {pairs.map(([a, b], i) => (
        <div key={i} className="contents">
          <div className="text-sm py-1">
            {a ? <ItemContent item={a} /> : null}
          </div>
          <div className="text-sm py-1">
            {b ? <ItemContent item={b} /> : null}
          </div>
        </div>
      ))}
    </div>
  );
}

function DesignGrouped(data: RacialAdjustmentData) {
  return (
    <div className="space-y-4">
      {data.statItems.length > 0 && (
        <div>
          <div className="text-xs font-medium text-muted-foreground mb-2">
            Stat Adjustments
          </div>
          <div className="space-y-1.5">
            {data.statItems.map((item, i) => (
              <div
                key={i}
                className="flex justify-between items-center text-sm"
              >
                <span
                  className={
                    item.optional ? "italic text-muted-foreground" : ""
                  }
                >
                  {item.label}
                </span>
                <span className="font-medium tabular-nums">
                  {item.value >= 0 ? `+${item.value}` : item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      {data.statItems.length > 0 && data.abilityItems.length > 0 && (
        <Separator />
      )}
      {data.abilityItems.length > 0 && (
        <div>
          <div className="text-xs font-medium text-muted-foreground mb-2">
            Special Abilities
          </div>
          <div className="space-y-1.5">
            {data.abilityItems.map((item, i) => (
              <div
                key={i}
                className={`flex items-center gap-2 text-sm ${item.optional ? "italic text-muted-foreground" : ""}`}
              >
                <Badge variant="secondary" className="text-[10px] py-0 shrink-0">
                  Included
                </Badge>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DesignCompact(data: RacialAdjustmentData) {
  const all = [
    ...data.statItems.map((s) => ({ ...s, formatted: s.formatted })),
    ...data.abilityItems.map((a) => ({ ...a, formatted: a.text })),
  ];
  return (
    <div className="space-y-1">
      {all.map((item, i) => (
        <div
          key={i}
          className="flex items-center justify-between gap-2 text-sm py-0.5"
        >
          <Badge variant="secondary" className="text-[10px] py-0 shrink-0">
            Included
          </Badge>
          <span
            className={
              item.optional ? "italic text-muted-foreground flex-1 text-right" : "flex-1 text-right"
            }
          >
            {item.formatted}
          </span>
        </div>
      ))}
    </div>
  );
}

export function CharacterAdjustmentsCard({
  character,
  variant = "grouped",
  label,
}: CharacterAdjustmentsCardProps) {
  const data = getRacialAdjustmentData(character);

  if (!data.hasContent) {
    return null;
  }

  const headerTitle = data.race ? `Racial Traits: ${data.race}` : "Racial Traits & Adjustments";

  return (
    <Card className="shadow-sm overflow-hidden">
      <details className="group">
        <summary className="list-none cursor-pointer [&::-webkit-details-marker]:hidden">
          <div className="flex flex-row items-center justify-between gap-2 px-4 py-2 sm:px-4 sm:py-3">
            <CardTitle className="text-base sm:text-lg leading-tight m-0 py-0">
              {headerTitle}
            </CardTitle>
            <span className="text-muted-foreground shrink-0 group-open:rotate-180 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </span>
          </div>
        </summary>
        <div className="border-t px-4 py-2 sm:px-4 sm:py-3 pt-2">
          {variant === "table" && DesignTable(data)}
          {variant === "table-a" && DesignTableA(data)}
          {variant === "table-b" && DesignTableB(data)}
          {variant === "table-c" && DesignTableC(data)}
          {variant === "grouped" && DesignGrouped(data)}
          {variant === "compact" && DesignCompact(data)}
        </div>
      </details>
    </Card>
  );
}
