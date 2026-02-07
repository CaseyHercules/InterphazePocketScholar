"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAvailableSkillsForCharacter } from "@/lib/actions/passport";
import { sortSkillsByTier } from "@/lib/utils";
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
}

const getSkillClassId = (s: any) => s.classId ?? s.class?.id;

export function CharacterDingusesCard({ character }: CharacterDingusesCardProps) {
  const [skillData, setSkillData] = useState<SkillData | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<any | null>(null);
  const [isSkillViewerOpen, setIsSkillViewerOpen] = useState(false);

  useEffect(() => {
    if (!character?.id) return;
    let cancelled = false;
    getAvailableSkillsForCharacter(character.id).then((data) => {
      if (!cancelled) setSkillData(data);
    });
    return () => { cancelled = true; };
  }, [character?.id]);

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

  return (
    <Card className="shadow-sm">
      <CardHeader className="p-3 sm:p-4 pb-2">
        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
          <Badge variant="outline" className="font-medium">
            Dingues
          </Badge>
          <span className="text-sm font-normal text-muted-foreground">
            Inline effects and attributes from adjustments
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 pt-0">
        {skillData === null ? (
          <p className="text-sm text-muted-foreground py-3">Loading…</p>
        ) : dingusSkills.length > 0 ? (
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
        ) : (
          <p className="text-sm text-muted-foreground py-3">
            No unique attributes from adjustments yet.
          </p>
        )}
      </CardContent>
      <SkillViewer
        skill={selectedSkill}
        isOpen={isSkillViewerOpen}
        onClose={() => {
          setIsSkillViewerOpen(false);
          setSelectedSkill(null);
        }}
      />
    </Card>
  );
}
