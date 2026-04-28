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

function getMetaItems(spell: Spell): string[] {
  const items: string[] = [];
  items.push(`Class: ${spell.type || "Unassigned"}`);
  items.push(`Level: ${toRomanNumeral(spell.level)}`);

  if (spell.data?.descriptor && spell.data.descriptor.length > 0) {
    for (const descriptor of spell.data.descriptor) {
      items.push(descriptor);
    }
  } else {
    items.push("No descriptors");
  }

  return items;
}

export function SpellCardTemplate({ spell, styleId }: SpellCardTemplateProps) {
  const style = STYLE_CLASSES[styleId];
  const metaItems = getMetaItems(spell);

  return (
    <article
      className={cn(
        "relative flex h-full min-h-[300px] flex-col overflow-hidden rounded-md p-4",
        style.card
      )}
    >
      <header className="space-y-2">
        <h2 className={cn("text-center text-lg font-bold leading-tight", style.title)}>
          {spell.title}
        </h2>
        <div className="flex flex-wrap items-center justify-center gap-1.5 text-[11px] font-semibold">
          {metaItems.map((item) => (
            <span key={item} className={style.metaItem}>
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
          Specialized Effects
        </h3>
        <p className={cn("text-sm leading-snug whitespace-pre-wrap", style.body)}>
          {spell.data?.effect?.trim() || "No specialized effects provided."}
        </p>
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
