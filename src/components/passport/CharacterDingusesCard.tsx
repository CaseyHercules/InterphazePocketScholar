"use client";

import { getAvailableSkillsForCharacter } from "@/lib/actions/passport";
import { sortSkillsByTier } from "@/lib/utils";
import { getDingusTitlesFromInlineEffects } from "@/types/inline-effects";
import { SkillSlot } from "@/components/passport/CharacterSkillsCard";
import { SkillViewer } from "@/components/SkillViewer";
import { useState, useEffect } from "react";

type SkillData = {
  primarySkillTiers: { [level: number]: number };
  secondarySkillTiers: { [level: number]: number };
  skillsByTier: { [tier: number]: any[] };
  learnedSkillIds: string[] | Set<string>;
  maxPrimaryTier: number;
  maxSecondaryTier: number;
};

interface CharacterDingusesCardProps {
  character: any;
  skillData?: SkillData | null;
}

const getSkillClassId = (s: any) => s.classId ?? s.class?.id;

export function CharacterDingusesCard({ character, skillData: skillDataProp }: CharacterDingusesCardProps) {
  const [fetchedSkillData, setFetchedSkillData] = useState<SkillData | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<any | null>(null);
  const [isSkillViewerOpen, setIsSkillViewerOpen] = useState(false);
  const skillData = skillDataProp ?? fetchedSkillData;

  useEffect(() => {
    if (!character?.id || skillDataProp != null) return;
    let cancelled = false;
    getAvailableSkillsForCharacter(character.id).then((data) => {
      if (!cancelled) setFetchedSkillData(data);
    });
    return () => { cancelled = true; };
  }, [character?.id, skillDataProp]);

  const primaryClassId = character.primaryClass?.id;
  const secondaryClassId = character.secondaryClass?.id;
  const learnedMiscellaneousSkills = [
    ...(character.primarySkills || []),
    ...(character.secondarySkills || []),
  ].filter((s: any) => {
    const cid = getSkillClassId(s);
    return cid !== primaryClassId && cid !== secondaryClassId;
  });

  const allSkillsFromTier = skillData
    ? Object.values(skillData.skillsByTier || {}).flat()
    : [];
  const skillsGrantedByAdjustments = allSkillsFromTier.filter((s: any) => {
    const cid = getSkillClassId(s);
    return cid !== primaryClassId && cid !== secondaryClassId;
  });

  const learnedMiscIds = new Set(learnedMiscellaneousSkills.map((s: any) => s.id));
  const dingusSkills = sortSkillsByTier([
    ...learnedMiscellaneousSkills,
    ...skillsGrantedByAdjustments.filter((s: any) => !learnedMiscIds.has(s.id)),
  ]);

  const inlineDingusTitles = getDingusTitlesFromInlineEffects(character.inlineEffectsJson);
  const hasDingusContent = dingusSkills.length > 0 || inlineDingusTitles.length > 0;

  const chevron = (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );

  return (
    <section
      aria-labelledby="dingues-heading"
      className="rounded-lg border-2 border-stone-300 dark:border-stone-600 bg-gradient-to-b from-stone-50 to-stone-100/80 dark:from-stone-900 dark:to-stone-950 shadow-sm p-3"
    >
      <details className="group" open>
        <summary className="list-none cursor-pointer [&::-webkit-details-marker]:hidden">
          <div className="flex flex-row items-center justify-between gap-2 py-1 group-open:py-2 group-open:pb-3 group-open:mb-3 group-open:border-b group-open:border-stone-300 dark:group-open:border-stone-600">
            <div className="min-w-0">
              <h2
                id="dingues-heading"
                className="text-xl font-semibold leading-tight text-stone-900 dark:text-stone-100 tracking-tight"
              >
                Dingues
              </h2>
              <p className="text-sm text-stone-600 dark:text-stone-400 mt-0.5">
                Attributes from adjustments and Dingus effects
              </p>
            </div>
            <span className="text-muted-foreground shrink-0 group-open:rotate-180 transition-transform">
              {chevron}
            </span>
          </div>
        </summary>
        <div className="space-y-4">
        {skillData === null && inlineDingusTitles.length === 0 ? (
          <p className="text-sm text-muted-foreground py-3">Loading…</p>
        ) : (
          <>
            {dingusSkills.length > 0 && (
              <div className="border border-stone-200 dark:border-stone-700 rounded-lg overflow-hidden">
                {dingusSkills.map((skill: any, index: number) => {
                  const isLearned = learnedMiscIds.has(skill.id);
                  return (
                    <SkillSlot
                      key={skill.id}
                      skill={skill}
                      isLearned={isLearned}
                      showRemoveButton={false}
                      characterId={character.id}
                      character={character}
                      isLastItem={index === dingusSkills.length - 1}
                      onViewSkill={(s) => {
                        setSelectedSkill(s);
                        setIsSkillViewerOpen(true);
                      }}
                    />
                  );
                })}
              </div>
            )}
            {inlineDingusTitles.length > 0 && (
              <div className="divide-y divide-stone-200 dark:divide-stone-700 rounded-md border border-stone-200 dark:border-stone-700 overflow-hidden">
                {inlineDingusTitles.map((title) => (
                  <div
                    key={title}
                    className="flex items-center justify-between px-3 py-2.5 text-sm font-medium"
                  >
                    {title}
                  </div>
                ))}
              </div>
            )}
            {!hasDingusContent && (
              <p className="text-sm text-muted-foreground py-3 pl-3">
                No Dinguses yet...
              </p>
            )}
          </>
        )}
        </div>
      </details>
      <SkillViewer
        skill={selectedSkill}
        isOpen={isSkillViewerOpen}
        onClose={() => {
          setIsSkillViewerOpen(false);
          setSelectedSkill(null);
        }}
      />
    </section>
  );
}
