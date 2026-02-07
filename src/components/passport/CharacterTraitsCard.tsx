"use client";

import { useState } from "react";
import { Sparkles, Swords, Zap } from "lucide-react";
import { CharacterAdjustmentsCard } from "./CharacterAdjustmentsCard";
import { CharacterSpecialAbilitiesCard } from "./CharacterSpecialAbilitiesCard";
import { CharacterDingusesCard } from "./CharacterDingusesCard";

type SkillData = {
  primarySkillTiers: { [level: number]: number };
  secondarySkillTiers: { [level: number]: number };
  skillsByTier: { [tier: number]: any[] };
  learnedSkillIds: string[] | Set<string>;
  maxPrimaryTier: number;
  maxSecondaryTier: number;
};

interface CharacterTraitsCardProps {
  character: any;
  skillData?: SkillData | null;
}

export function CharacterTraitsCard({
  character,
  skillData,
}: CharacterTraitsCardProps) {
  const [sidebarValue, setSidebarValue] = useState("racial");

  const baseCardClass =
    "rounded-lg border-2 border-stone-300 dark:border-stone-600 shadow-sm p-3";

  const racialContent = (
    <CharacterAdjustmentsCard
      character={character}
      embedded
      showSectionTitle
    />
  );
  const abilitiesContent = (
    <CharacterSpecialAbilitiesCard character={character} embedded />
  );
  const dingusesContent = (
    <CharacterDingusesCard character={character} skillData={skillData} embedded />
  );
  const sections = [
    { id: "racial", label: "Racial Traits", icon: Sparkles, content: racialContent },
    { id: "abilities", label: "Special Abilities", icon: Zap, content: abilitiesContent },
    { id: "dinguses", label: "Dinguses", icon: Swords, content: dingusesContent },
  ];

  return (
    <section
      className={`${baseCardClass} bg-gradient-to-b from-stone-50 to-stone-100/80 dark:from-stone-900 dark:to-stone-950`}
      aria-label="Traits & abilities"
    >
      <div className="flex flex-col sm:flex-row sm:gap-6 gap-0">
        <div className="flex-1 min-w-0 pb-4 sm:pb-0 sm:pr-0">
          {sections.find((s) => s.id === sidebarValue)?.content}
        </div>
        <nav
          className="flex flex-row flex-wrap sm:flex-nowrap sm:flex-col gap-1 sm:w-48 shrink-0 border-t sm:border-t-0 sm:border-l border-stone-200 dark:border-stone-700 pt-3 sm:pt-0 sm:pl-6"
          aria-label="Section"
        >
          {sections.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSidebarValue(s.id)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium text-left transition-colors sm:w-full min-w-[7rem] ${
                sidebarValue === s.id
                  ? "bg-stone-200 dark:bg-stone-700 text-stone-900 dark:text-stone-100"
                  : "text-muted-foreground hover:bg-stone-100 dark:hover:bg-stone-800/50"
              }`}
            >
              <s.icon className="h-4 w-4 shrink-0" />
              <span className="break-words whitespace-normal">{s.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </section>
  );
}
