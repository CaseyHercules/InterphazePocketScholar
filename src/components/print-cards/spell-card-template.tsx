import Image from "next/image";
import { Spell } from "@/types/spell";
import { SpellCardStyleId } from "@/components/print-cards/types";
import { toRomanNumeral } from "@/lib/utils/roman-numerals";
import { cn } from "@/lib/utils";

interface SpellCardTemplateProps {
  spell: Spell;
  styleId: SpellCardStyleId;
}

const STYLE_CLASSES: Record<
  SpellCardStyleId,
  {
    card: string;
    title: string;
    metaItem: string;
    sectionTitle: string;
    body: string;
    method: string;
    logo: string;
  }
> = {
  classic: {
    card: "border-2 border-zinc-800 bg-zinc-50 text-zinc-900 shadow-md",
    title: "tracking-wide text-zinc-900",
    metaItem: "rounded-sm border border-zinc-700 bg-zinc-100 px-2 py-1",
    sectionTitle: "text-zinc-700",
    body: "text-zinc-900",
    method: "border-t border-zinc-500 bg-zinc-100/80",
    logo: "opacity-90",
  },
  minimal: {
    card: "border border-zinc-300 bg-white text-zinc-950 shadow-sm",
    title: "tracking-normal text-zinc-950",
    metaItem: "rounded border border-zinc-300 bg-zinc-50 px-2 py-1",
    sectionTitle: "text-zinc-500",
    body: "text-zinc-900",
    method: "border-t border-zinc-200 bg-zinc-50",
    logo: "opacity-80",
  },
  tome: {
    card: "border-2 border-amber-950 bg-amber-50 text-amber-950 shadow-lg",
    title: "font-serif tracking-wider text-amber-900",
    metaItem: "rounded-sm border border-amber-900/70 bg-amber-100 px-2 py-1 font-serif",
    sectionTitle: "font-serif text-amber-700",
    body: "font-serif text-amber-950",
    method: "border-t border-amber-900/40 bg-amber-100/60",
    logo: "opacity-85",
  },
  arcane: {
    card: "border-2 border-violet-800 bg-violet-50 text-violet-950 shadow-[0_0_20px_rgba(91,33,182,0.18)]",
    title: "tracking-wide text-violet-900",
    metaItem: "rounded border border-violet-700/60 bg-violet-100 px-2 py-1",
    sectionTitle: "text-violet-700",
    body: "text-violet-950",
    method: "border-t border-violet-700/40 bg-violet-100/70",
    logo: "opacity-90",
  },
  industrial: {
    card: "border-2 border-slate-800 bg-slate-100 text-slate-900 shadow-md",
    title: "tracking-[0.18em] uppercase text-slate-900",
    metaItem: "rounded-none border border-slate-700 bg-slate-200 px-2 py-1 text-xs uppercase",
    sectionTitle: "uppercase tracking-wide text-slate-700",
    body: "text-slate-900",
    method: "border-t-2 border-slate-700 bg-slate-200/80",
    logo: "opacity-95",
  },
};

const MONTH_ABBR = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

function formatCardDateSlash(value: string | Date | undefined | null): string {
  if (value == null) {
    return "—";
  }
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) {
    return "—";
  }
  const mm = MONTH_ABBR[d.getMonth()];
  const dd = String(d.getDate()).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${mm}/${dd}/${yy}`;
}

function getMetaItems(spell: Spell): string[] {
  const descriptors =
    spell.data?.descriptor && spell.data.descriptor.length > 0
      ? spell.data.descriptor.join(", ")
      : "-";
  return [
    `Class: ${spell.type || "Unassigned"}`,
    `Level: ${toRomanNumeral(spell.level)}`,
    `Descriptors: ${descriptors}`,
  ];
}

function mostRecentSlashDate(spell: Spell): string | null {
  const ms: number[] = [];
  for (const value of [spell.createdAt, spell.reworkedAt]) {
    if (value == null) {
      continue;
    }
    const d = typeof value === "string" ? new Date(value) : value;
    const t = d.getTime();
    if (!Number.isNaN(t)) {
      ms.push(t);
    }
  }
  if (ms.length === 0) {
    return null;
  }
  return formatCardDateSlash(new Date(Math.max(...ms)));
}

export function SpellCardTemplate({ spell, styleId }: SpellCardTemplateProps) {
  const style = STYLE_CLASSES[styleId];
  const metaItems = getMetaItems(spell);
  const authorName = spell.author?.trim();
  const mostRecentDate = mostRecentSlashDate(spell);
  const details = [
    ["Casting Time", spell.data?.castingTime],
    ["Range", spell.data?.range],
    ["Area of Effect", spell.data?.areaOfEffect],
    ["Duration", spell.data?.duration],
    ["Save", spell.data?.save],
    ["Effect", spell.data?.effect],
  ] as const;

  return (
    <article
      className={cn(
        "relative flex h-full min-h-[300px] flex-col overflow-hidden rounded-md p-4 print:min-h-0 print:p-2.5",
        style.card
      )}
    >
      <header className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <h2
            className={cn(
              "min-w-0 flex-1 text-left text-lg font-bold leading-tight",
              style.title
            )}
          >
            {spell.title}
          </h2>
          {authorName ? (
            <div
              className={cn(
                "max-w-[min(100%,11rem)] shrink-0 truncate text-right text-[9px] leading-tight",
                style.body
              )}
              title={
                mostRecentDate
                  ? `Author: ${authorName} ${mostRecentDate}`
                  : `Author: ${authorName}`
              }
            >
              Author: {authorName}
              {mostRecentDate ? ` ${mostRecentDate}` : null}
            </div>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] font-semibold">
          {metaItems.map((item) => (
            <span key={item} className={cn("px-0.5", style.body)}>
              {item}
            </span>
          ))}
        </div>
      </header>

      <section className="mt-3 min-h-0 flex-1 space-y-2 overflow-hidden">
        <h3 className={cn("text-xs font-semibold uppercase", style.sectionTitle)}>
          Description
        </h3>
        <p className={cn("text-sm leading-snug whitespace-pre-wrap", style.body)}>
          {spell.description?.trim() || "No description provided."}
        </p>
      </section>

      <section className="mt-3 space-y-2">
        <h3 className={cn("text-xs font-semibold uppercase", style.sectionTitle)}>
          Spell Details
        </h3>
        <div className="grid grid-cols-2 gap-x-2 gap-y-1">
          {details.map(([label, value]) => (
            <div key={label} className={cn("text-[11px] leading-tight", style.body)}>
              <span className="font-semibold">{label}:</span> {value?.trim() || "-"}
            </div>
          ))}
        </div>
      </section>

      <footer className={cn("mt-3 rounded px-3 py-2 pr-16", style.method)}>
        <h3 className={cn("text-xs font-semibold uppercase", style.sectionTitle)}>
          Method
        </h3>
        <p className={cn("text-sm leading-snug whitespace-pre-wrap", style.body)}>
          {spell.data?.method?.trim() || "No method provided."}
        </p>
      </footer>

      <div className="pointer-events-none absolute bottom-3 right-3">
        <Image
          src="/logo.svg"
          alt="Interphaze logo"
          width={46}
          height={32}
          className={style.logo}
          priority
        />
      </div>
    </article>
  );
}
