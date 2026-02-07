"use client";

import {
  calculateStatValue,
  getEPAvailableValues,
  getEPBreakdown,
  getStatBreakdown,
  type StatAdjustmentBreakdown,
  type StatBreakdownExtended,
} from "@/lib/utils/character-stats";
import { HoverBreakdown } from "@/components/passport/HoverBreakdown";
import {
  parseAlignmentFromJson,
  ALIGNMENT_MAX_TICKS,
} from "@/types/alignment";

interface CharacterStatsCardProps {
  character: any;
  label?: string;
}

function renderAdjustmentLines(items: StatAdjustmentBreakdown[]) {
  if (!items.length) return null;
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
}

function renderConditionalLines(
  items: StatAdjustmentBreakdown[],
  conditionPrefix: string
) {
  if (!items.length) return null;
  return (
    <div className="space-y-1">
      {items.map((item, index) => (
        <div key={`${item.title}-${index}`} className="flex justify-between">
          <span className="text-sm">
            {item.condition
              ? `${conditionPrefix} ${item.condition}`
              : "Conditional"}
          </span>
          <span className="text-sm font-medium">
            {item.value >= 0 ? `+${item.value}` : item.value}
          </span>
        </div>
      ))}
    </div>
  );
}

function renderStatTooltip(label: string, breakdown: StatBreakdownExtended) {
  const lowerLabel = label.toLowerCase();
  const conditionPrefix =
    lowerLabel === "attack" || lowerLabel === "accuracy" ? "with" : "vs";
  const hasAdj =
    breakdown.adjustments.length > 0 || breakdown.skillBonuses.length > 0;
  const hasCond =
    breakdown.conditionalAdjustments.length > 0 ||
    breakdown.conditionalSkillBonuses.length > 0;

  return (
    <div className="w-56 space-y-2 text-sm">
      <div className="font-semibold">{label} breakdown</div>
      <div className="space-y-1">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Primary class</span>
          <span className="font-medium">{breakdown.primary}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Secondary class</span>
          <span className="font-medium">{breakdown.secondary}</span>
        </div>
      </div>
      {hasAdj && (
        <div className="border-t pt-2">
          <div className="font-semibold mb-1">Bonuses</div>
          {renderAdjustmentLines([
            ...breakdown.adjustments,
            ...breakdown.skillBonuses,
          ])}
        </div>
      )}
      {hasCond && (
        <div className="border-t pt-2">
          <div className="font-semibold mb-1">Conditional bonuses</div>
          {renderConditionalLines(
            [
              ...breakdown.conditionalAdjustments,
              ...breakdown.conditionalSkillBonuses,
            ],
            conditionPrefix
          )}
        </div>
      )}
      <div className="flex justify-between border-t pt-2 font-semibold">
        <span>Total</span>
        <span>{breakdown.total}</span>
      </div>
    </div>
  );
}

function renderEPTooltip(character: any) {
  const breakdown = getEPBreakdown(character);
  const hasAdj =
    breakdown.adjustments.length > 0 || breakdown.skillBonuses.length > 0;
  const hasCond =
    breakdown.conditionalAdjustments.length > 0 ||
    breakdown.conditionalSkillBonuses.length > 0;

  return (
    <div className="w-56 space-y-2 text-sm">
      <div className="font-semibold">Energy Points breakdown</div>
      <div className="space-y-1">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Primary class</span>
          <span className="font-medium">{breakdown.primary}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Secondary class</span>
          <span className="font-medium">{breakdown.secondary}</span>
        </div>
      </div>
      <div className="border-t pt-2 space-y-1">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Skill EP Cost (primary)</span>
          <span className="font-medium">-{breakdown.skillReductions.primary}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Skill EP Cost (secondary)</span>
          <span className="font-medium">
            -{breakdown.skillReductions.secondary}
          </span>
        </div>
      </div>
      {hasAdj && (
        <div className="border-t pt-2">
          <div className="font-semibold mb-1">Bonuses</div>
          {renderAdjustmentLines([
            ...breakdown.adjustments,
            ...breakdown.skillBonuses,
          ])}
        </div>
      )}
      {hasCond && (
        <div className="border-t pt-2">
          <div className="font-semibold mb-1">Conditional bonuses</div>
          {renderConditionalLines(
            [
              ...breakdown.conditionalAdjustments,
              ...breakdown.conditionalSkillBonuses,
            ],
            "vs"
          )}
        </div>
      )}
      <div className="flex justify-between border-t pt-2 font-semibold">
        <span>Total</span>
        <span>{breakdown.total}</span>
      </div>
    </div>
  );
}


function getConditionPrefix(label: string): string {
  const lower = label.toLowerCase();
  return lower === "attack" || lower === "accuracy" ? "with" : "vs";
}

function StatWithInlineAdjustments({
  label,
  breakdown,
}: {
  label: string;
  breakdown: StatBreakdownExtended;
}) {
  const conditionalOnly = [
    ...breakdown.conditionalAdjustments,
    ...breakdown.conditionalSkillBonuses,
  ];
  const prefix = getConditionPrefix(label);
  return (
    <HoverBreakdown content={renderStatTooltip(label, breakdown)}>
      <div className="rounded-md border border-stone-300 dark:border-stone-600 bg-stone-50/80 dark:bg-stone-900/60 p-3 text-base transition-colors cursor-default hover:bg-stone-100 dark:hover:bg-stone-800/80 hover:shadow-sm">
        <div className="flex justify-between items-baseline font-semibold tabular-nums">
          <span className="text-stone-800 dark:text-stone-200 text-base font-bold">{label}</span>
          <span className="text-foreground text-xl">{breakdown.total}</span>
        </div>
        {conditionalOnly.length > 0 && (
          <div className="mt-2 space-y-0.5 text-sm text-muted-foreground border-t border-stone-200 dark:border-stone-700 pt-2">
            {conditionalOnly.map((item, i) => (
              <div key={i} className="flex justify-between">
                <span>{item.condition ? `${prefix} ${item.condition}` : item.title}</span>
                <span className="tabular-nums font-medium">{item.value >= 0 ? `+${item.value}` : item.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </HoverBreakdown>
  );
}

function DesignGrid({ character }: { character: any }) {
  const epValues = getEPAvailableValues(character);
  const secondaryLabel =
    character.secondaryClass &&
    character.secondaryClassLvl > 0 &&
    !character.secondaryClass.Title?.toLowerCase().includes("none")
      ? character.secondaryClass.Title
      : null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <HoverBreakdown
          content={renderStatTooltip("Hit Points", getStatBreakdown(character, "HP"))}
        >
          <div className="p-2.5 rounded-md border border-stone-300 dark:border-stone-600 bg-stone-50/80 dark:bg-stone-900/60 transition-colors hover:bg-stone-100 dark:hover:bg-stone-800/80 hover:shadow-sm border-l-4 border-l-stone-500 dark:border-l-stone-500">
            <div className="text-base font-bold text-stone-800 dark:text-stone-200 mb-0.5">Hit Points</div>
            <div className="text-3xl font-bold tabular-nums text-foreground">
              {calculateStatValue(character, "HP")}
            </div>
          </div>
        </HoverBreakdown>
        <HoverBreakdown content={renderEPTooltip(character)}>
          <div className="p-2.5 rounded-md border border-stone-300 dark:border-stone-600 bg-stone-50/80 dark:bg-stone-900/60 transition-colors hover:bg-stone-100 dark:hover:bg-stone-800/80 hover:shadow-sm border-l-4 border-l-stone-400 dark:border-l-stone-500">
            <div className="text-base font-bold text-stone-800 dark:text-stone-200 mb-1">Energy Points</div>
            <div className="space-y-0.5 text-base">
              <div className="flex justify-between">
                <span className="text-stone-600 dark:text-stone-400">{character.primaryClass?.Title ?? "Primary"}</span>
                <span className="font-semibold tabular-nums">{epValues.primary}</span>
              </div>
              {secondaryLabel && (
                <div className="flex justify-between">
                  <span className="text-stone-600 dark:text-stone-400">{secondaryLabel}</span>
                  <span className="font-semibold tabular-nums">{epValues.secondary}</span>
                </div>
              )}
            </div>
          </div>
        </HoverBreakdown>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-2">
          <div className="text-base font-semibold text-foreground pb-1.5 border-b-2 border-stone-400 dark:border-stone-600 tracking-wide">
            Combat
          </div>
          <div className="grid grid-cols-2 gap-2">
            {(["Attack", "Accuracy", "Defense", "Resistance"] as const).map((stat) => (
              <StatWithInlineAdjustments
                key={stat}
                label={stat}
                breakdown={getStatBreakdown(character, stat)}
              />
            ))}
          </div>
        </div>
        <div className="md:col-span-1 space-y-2">
          <div className="text-base font-semibold text-foreground pb-1.5 border-b-2 border-stone-400 dark:border-stone-600 tracking-wide">
            Saves
          </div>
          <div className="space-y-2">
            {(["Tough", "Quick", "Mind"] as const).map((stat) => (
              <StatWithInlineAdjustments
                key={stat}
                label={stat}
                breakdown={getStatBreakdown(character, stat)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AlignmentLine({ character }: { character: any }) {
  const data = parseAlignmentFromJson(character.alignmentJson);
  if (!data) return null;
  const [alignment, upTicks, downTicks] = data;
  const downStr = Array.from({ length: ALIGNMENT_MAX_TICKS }, (_, i) =>
    i < ALIGNMENT_MAX_TICKS - downTicks ? "O" : "X"
  ).join(" ");
  const upStr = Array.from({ length: ALIGNMENT_MAX_TICKS }, (_, i) =>
    i < upTicks ? "X" : "O"
  ).join(" ");
  return (
    <p className="font-mono text-sm tracking-wider text-right text-stone-700 dark:text-stone-300 shrink-0">
      {downStr} | {alignment} | {upStr}
    </p>
  );
}

export function CharacterStatsCard({
  character,
  label,
}: CharacterStatsCardProps) {
  const heading = label ? `${label} — Character Stats` : "Character Stats";

  return (
    <section
      aria-labelledby="character-stats-heading"
      className="rounded-lg border-2 border-stone-300 dark:border-stone-600 bg-gradient-to-b from-stone-50 to-stone-100/80 dark:from-stone-900 dark:to-stone-950 shadow-sm p-4"
    >
      <div className="mb-3 pb-2 border-b border-stone-300 dark:border-stone-600 flex flex-row justify-between items-start gap-4">
        <div className="min-w-0">
          <h2
            id="character-stats-heading"
            className="text-xl font-semibold leading-tight text-stone-900 dark:text-stone-100 tracking-tight"
          >
            {heading}
          </h2>
          <p className="text-sm text-stone-600 dark:text-stone-400 mt-0.5">
            HP, EP, combat stats, and saves
          </p>
        </div>
        <AlignmentLine character={character} />
      </div>
      <DesignGrid character={character} />
    </section>
  );
}
