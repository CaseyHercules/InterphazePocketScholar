import Image from "next/image";
import { Spell } from "@/types/spell";
import { SpellCardStyleId } from "@/components/print-cards/types";
import { toRomanNumeral } from "@/lib/utils/roman-numerals";
import { mostRecentSpellCardSeasonYear } from "@/lib/utils/spell-card-date";
import { cn } from "@/lib/utils";

interface SpellCardTemplateProps {
  spell: Spell;
  styleId: SpellCardStyleId;
  orientation?: "portrait" | "landscape";
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

type Density = "comfortable" | "compact" | "dense";

function totalDetailChars(
  details: readonly (readonly [string, string | undefined])[]
): number {
  let n = 0;
  for (const [, v] of details) {
    if (typeof v === "string") {
      n += v.length;
    }
  }
  return n;
}

function contentDensity(spell: Spell, detailsChars: number, note: boolean): Density {
  const desc = spell.description?.length ?? 0;
  const method = spell.data?.method?.length ?? 0;
  const total = desc + method + detailsChars;
  if (note) {
    if (total > 1600) {
      return "dense";
    }
    if (total > 700) {
      return "compact";
    }
    return "comfortable";
  }
  if (total > 3200) {
    return "dense";
  }
  if (total > 1600) {
    return "compact";
  }
  return "comfortable";
}

export function SpellCardTemplate({
  spell,
  styleId,
  orientation = "portrait",
}: SpellCardTemplateProps) {
  const style = STYLE_CLASSES[styleId];
  const typeLabel = spell.type?.trim() || "Unassigned";
  const levelRoman = toRomanNumeral(spell.level);
  const descriptorLine =
    spell.data?.descriptor && spell.data.descriptor.length > 0
      ? spell.data.descriptor.join(", ")
      : "—";
  const authorName = spell.author?.trim();
  const mostRecentDate = mostRecentSpellCardSeasonYear(spell);
  const details = [
    ["Casting Time", spell.data?.castingTime],
    ["Range", spell.data?.range],
    ["Area of Effect", spell.data?.areaOfEffect],
    ["Duration", spell.data?.duration],
    ["Save", spell.data?.save],
    ["Effect", spell.data?.effect],
  ] as const;

  const note = orientation === "landscape";
  const density = contentDensity(spell, totalDetailChars(details), note);

  const noteSectionLabel = cn(
    density === "comfortable" && "text-xs tracking-wide",
    density === "compact" && "text-[11px] tracking-wide",
    density === "dense" && "text-[10px] tracking-wide"
  );

  const noteBodyPrimary = cn(
    density === "comfortable" && "text-sm leading-relaxed",
    density === "compact" && "text-xs leading-snug",
    density === "dense" && "text-[11px] leading-snug"
  );

  const noteDetailsText = cn(
    density === "comfortable" &&
      "gap-x-2 gap-y-1 text-xs leading-snug",
    density === "compact" && "gap-x-1.5 gap-y-0.5 text-[11px] leading-snug",
    density === "dense" && "gap-x-1 gap-y-0.5 text-[10px] leading-snug"
  );

  const portraitSectionLabel = cn(
    density === "comfortable" && "text-xs tracking-wide",
    density === "compact" && "text-xs",
    density === "dense" && "text-[10px]"
  );

  const portraitDesc = cn(
    density === "comfortable" && "text-base leading-relaxed",
    density === "compact" && "text-sm leading-snug",
    density === "dense" && "text-xs leading-snug"
  );

  const portraitDetailsGrid = cn(
    density === "comfortable" &&
      "gap-x-2.5 gap-y-1.5 text-xs leading-snug",
    density === "compact" && "gap-x-2 gap-y-1 text-[11px] leading-snug",
    density === "dense" && "gap-x-2 gap-y-1 text-[10px] leading-tight"
  );

  const portraitMethod = cn(
    density === "comfortable" && "text-base leading-relaxed",
    density === "compact" && "text-sm leading-snug",
    density === "dense" && "text-xs leading-snug"
  );

  return (
    <article
      className={cn(
        "relative flex min-h-0 w-full flex-col overflow-hidden rounded-md",
        note
          ? "h-full p-2.5"
          : "h-full min-h-[300px] p-4 print:min-h-0 print:p-2.5",
        style.card
      )}
    >
      <header className={cn("shrink-0", note ? "space-y-1" : "space-y-1.5")}>
        <div className={cn("flex items-start justify-between", note ? "gap-2" : "gap-3")}>
          <h2
            className={cn(
              "min-w-0 flex-1 text-left font-bold leading-tight",
              note ? "text-base" : "text-lg",
              style.title
            )}
          >
            {spell.title}
          </h2>
          {authorName ? (
            <div
              className={cn(
                "shrink-0 truncate text-right leading-tight opacity-80",
                note
                  ? "max-w-[6rem] text-[10px]"
                  : "max-w-[min(100%,11rem)] text-[9px]",
                style.body
              )}
              title={
                mostRecentDate
                  ? `Author - ${authorName} · ${mostRecentDate}`
                  : `Author - ${authorName}`
              }
            >
              Author - {authorName}
              {mostRecentDate ? ` · ${mostRecentDate}` : null}
            </div>
          ) : null}
        </div>
        <div
          className={cn(
            "flex justify-between gap-2 border-t border-black/[0.06] pt-1 font-normal dark:border-white/[0.08]",
            note ? "items-start" : "items-baseline",
            note ? "text-xs leading-snug" : "text-sm leading-snug",
            style.sectionTitle
          )}
        >
          <div className={cn("min-w-0 flex-1 text-left", style.body)}>
            <span className="opacity-90">{typeLabel}</span>
            <span className="mx-1.5 opacity-40">·</span>
            <span className="opacity-90">Level {levelRoman}</span>
          </div>
          <div
            className={cn(
              "max-w-[58%] shrink-0 break-words pl-2 text-right leading-snug",
              style.body
            )}
          >
            <span className={cn("opacity-70", style.sectionTitle)}>Descriptor:</span>{" "}
            <span className="opacity-90">{descriptorLine}</span>
          </div>
        </div>
      </header>

      <section
        className={cn(
          "flex min-h-0 flex-1 flex-col overflow-hidden",
          note ? "mt-1.5 gap-0" : "mt-3 gap-0"
        )}
      >
        <div className="spell-card-body min-h-0 flex-1 overflow-y-auto overflow-x-hidden print:max-h-none print:overflow-hidden">
          <p
            className={cn(
              "break-words whitespace-pre-wrap [overflow-wrap:anywhere]",
              note ? noteBodyPrimary : portraitDesc,
              style.body
            )}
          >
            {spell.description?.trim() || "No description provided."}
          </p>
        </div>
      </section>

      <section className={cn("shrink-0", note ? "mt-1.5 space-y-1" : "mt-3 space-y-2")}>
        <h3
          className={cn(
            "font-semibold uppercase",
            note ? noteSectionLabel : portraitSectionLabel,
            style.sectionTitle
          )}
        >
          Spell Details
        </h3>
        <div
          className={cn(
            "grid grid-cols-2",
            note ? noteDetailsText : portraitDetailsGrid
          )}
        >
          {details.map(([label, value]) => (
            <div key={label} className={style.body}>
              <span className="font-semibold">{label}:</span> {value?.trim() || "-"}
            </div>
          ))}
        </div>
      </section>

      <footer
        className={cn(
          "shrink-0",
          note ? "mt-1.5 rounded px-2 py-1.5 pr-10" : "mt-3 rounded px-3 py-2 pr-16",
          style.method
        )}
      >
        <h3
          className={cn(
            "font-semibold uppercase",
            note ? noteSectionLabel : portraitSectionLabel,
            style.sectionTitle
          )}
        >
          Method
        </h3>
        <p
          className={cn(
            "spell-card-method whitespace-pre-wrap",
            note ? noteBodyPrimary : portraitMethod,
            style.body
          )}
        >
          {spell.data?.method?.trim() || "No method provided."}
        </p>
      </footer>

      <div
        className={cn(
          "pointer-events-none absolute",
          note ? "bottom-1.5 right-1.5" : "bottom-3 right-3"
        )}
      >
        <Image
          src="/logo.svg"
          alt="Interphaze logo"
          width={note ? 28 : 46}
          height={note ? 20 : 32}
          className={style.logo}
          unoptimized
          priority
        />
      </div>
    </article>
  );
}
