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
    <section aria-labelledby="dingues-heading" className="space-y-3">
      <details className="group">
        <summary className="list-none cursor-pointer [&::-webkit-details-marker]:hidden">
          <div className="flex flex-row items-center justify-between gap-2 pl-3">
            <div>
              <h2
                id="dingues-heading"
                className="text-lg font-semibold leading-tight tracking-tight"
              >
                Dingues
              </h2>
              <p className="text-xs text-muted-foreground">
                Attributes from adjustments and Dingus effects
              </p>
            </div>
            <span className="text-muted-foreground shrink-0 pr-3 group-open:rotate-180 transition-transform">
              {chevron}
            </span>
          </div>
        </summary>
        <div className="space-y-4 pt-2">
        {skillData === null && inlineDingusTitles.length === 0 ? (
          <p className="text-sm text-muted-foreground py-3">Loading…</p>
        ) : (
          <>
            {dingusSkills.length > 0 && (
              <div className="border rounded-lg overflow-hidden">
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
              <div className="space-y-1">
                {inlineDingusTitles.map((title) => (
                  <div
                    key={title}
                    className="flex items-center justify-between p-3 min-h-[3rem] border rounded-md bg-background text-sm font-medium"
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
