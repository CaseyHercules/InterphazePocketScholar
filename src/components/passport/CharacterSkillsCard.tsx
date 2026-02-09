"use client";

import { BookOpen, Plus, Minus } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { SkillSearchDialog } from "@/components/SkillSearchDialog";
import { SkillViewer } from "@/components/SkillViewer";
import {
  addSkillToCharacter,
  removeSkillFromCharacter,
  getAvailableSkillsForCharacter,
} from "@/lib/actions/passport";
import { useState, useEffect } from "react";
import { getEffectiveSkillValue } from "@/lib/utils/character-stats";
import { getCharacterSkillsWithGranted, sortSkillsWithGrantedFirst } from "@/lib/utils/character-skills";
import { sortSkillsByTier } from "@/lib/utils";

type SkillData = {
  primarySkillTiers: { [level: number]: number };
  secondarySkillTiers: { [level: number]: number };
  skillsByTier: { [tier: number]: any[] };
  learnedSkillIds: string[] | Set<string>;
  maxPrimaryTier: number;
  maxSecondaryTier: number;
};

interface CharacterSkillsCardProps {
  character: any;
  skillData?: SkillData | null;
  embedded?: boolean;
  isSuperAdmin?: boolean;
}

export function CharacterSkillsCard({
  character,
  skillData: skillDataProp,
  embedded = false,
  isSuperAdmin = false,
}: CharacterSkillsCardProps) {
  const [fetchedSkillData, setFetchedSkillData] = useState<SkillData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const skillData = skillDataProp ?? fetchedSkillData;

  useEffect(() => {
    if (!character?.id) return;
    if (skillDataProp != null && refreshTrigger === 0) return;
    let cancelled = false;
    setIsLoading(true);
    getAvailableSkillsForCharacter(character.id)
      .then((data) => {
        if (!cancelled) setFetchedSkillData(data);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, [character?.id, skillDataProp, refreshTrigger]);

  const [isEditMode, setIsEditMode] = useState(true);
  const [selectedAvailableClass, setSelectedAvailableClass] = useState<
    "primary" | "secondary"
  >("primary");
  const [selectedSkill, setSelectedSkill] = useState<any | null>(null);
  const [isSkillViewerOpen, setIsSkillViewerOpen] = useState(false);

  const hasSkills =
    character.primarySkills.length > 0 || character.secondarySkills.length > 0;
  const totalSkills =
    character.primarySkills.length + character.secondarySkills.length;

  const getSkillClassId = (s: any) => s.classId ?? s.class?.id;

  const getClassSkillSlots = (isPrimary: boolean) => {
    if (!skillData) return { slots: [], maxTier: 0 };

    const skillTiers = isPrimary
      ? skillData.primarySkillTiers
      : skillData.secondarySkillTiers;
    const maxTier = isPrimary
      ? skillData.maxPrimaryTier
      : skillData.maxSecondaryTier;
    const learnedSkills = sortSkillsWithGrantedFirst(
      isPrimary ? character.primarySkills : character.secondarySkills,
      grantedIds
    );

    const slots: { level: number; tier: number; skill?: any }[] = [];

    Object.entries(skillTiers).forEach(([level, tier]) => {
      slots.push({ level: parseInt(level), tier });
    });

    slots.sort((a, b) => a.level - b.level);

    const classId = isPrimary
      ? character.primaryClass?.id
      : character.secondaryClass?.id;

    learnedSkills.forEach((skill: any) => {
      if (getSkillClassId(skill) !== classId) return;
      const emptySlot = slots.find(
        (slot) => !slot.skill && slot.tier >= skill.tier
      );
      if (emptySlot) {
        emptySlot.skill = skill;
      }
    });

    return { slots, maxTier };
  };

  const primarySlots = getClassSkillSlots(true);
  const secondarySlots = getClassSkillSlots(false);

  const adjustments = Array.isArray(character?.adjustments)
    ? character.adjustments
    : [];

  const learnedSkillIdsSet = new Set(
    Array.isArray(skillData?.learnedSkillIds)
      ? skillData.learnedSkillIds
      : skillData?.learnedSkillIds instanceof Set
        ? Array.from(skillData.learnedSkillIds)
        : []
  );
  const { grantedIds } = getCharacterSkillsWithGranted(character);

  const isEditing = embedded || isEditMode;

  const content = (
    <>
        {skillData ? (
          <Tabs defaultValue="slots" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="slots">Skill Slots</TabsTrigger>
              <TabsTrigger value="available">Available</TabsTrigger>
            </TabsList>

            {/* Skill Slots Overview Tab */}
            <TabsContent value="slots" className="mt-4 flex-1 flex flex-col">
              <div className="text-sm text-muted-foreground mb-4">
                Skill slots are unlocked as you level up. Each tier requires
                higher character levels to access.
              </div>

              <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                    {/* Primary Class Skills Column */}
                    {character.primaryClass && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 sticky top-0 bg-background pb-2 border-b">
                          <Badge variant="default" className="font-medium">
                            {character.primaryClass.Title} (Primary)
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Level {character.primaryClassLvl}
                          </span>
                        </div>

                        <ClassSlotSection
                          slots={primarySlots.slots}
                          isPrimary={true}
                          character={character}
                          skillData={skillData}
                          maxTier={primarySlots.maxTier}
                          isEditMode={isEditing}
                          grantedIds={grantedIds}
                          onSkillAdded={() => setRefreshTrigger((t: number) => t + 1)}
                        />
                      </div>
                    )}

                    {/* Secondary Class Skills Column */}
                    {character.secondaryClass &&
                      !character.secondaryClass.Title?.toLowerCase().includes(
                        "none"
                      ) && (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 sticky top-0 bg-background pb-2 border-b">
                            <Badge variant="secondary" className="font-medium">
                              {character.secondaryClass.Title} (Secondary)
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              Level {character.secondaryClassLvl}
                            </span>
                          </div>

                          <ClassSlotSection
                            slots={secondarySlots.slots}
                            isPrimary={false}
                            character={character}
                            skillData={skillData}
                            maxTier={secondarySlots.maxTier}
                            isEditMode={isEditing}
                            grantedIds={grantedIds}
                            onSkillAdded={() => setRefreshTrigger((t: number) => t + 1)}
                          />
                        </div>
                      )}

                    {/* If no secondary class, show message in second column on large screens */}
                    {(!character.secondaryClass ||
                      character.secondaryClass.Title?.toLowerCase().includes(
                        "none"
                      )) && (
                      <div className="hidden lg:flex items-center justify-center text-muted-foreground">
                        <div className="text-center">
                          <p className="text-sm">No Secondary Class</p>
                          <p className="text-xs mt-1">
                            Choose a secondary class to unlock more skill slots
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {isSuperAdmin && adjustments.length > 0 && (
                    <details className="mt-6">
                      <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                        Debug: Raw effects JSON
                      </summary>
                      <div className="mt-2 p-3 rounded-lg bg-muted/50 text-xs font-mono overflow-auto max-h-64">
                        <pre className="whitespace-pre-wrap break-words">
                          {JSON.stringify(
                            adjustments.map((e: any) => ({
                              title: e?.adjustment?.title ?? e?.title,
                              effectsJson: e?.adjustment?.effectsJson ?? e?.effectsJson,
                            })),
                            null,
                            2
                          )}
                        </pre>
                      </div>
                    </details>
                  )}
                </ScrollArea>
              </div>
            </TabsContent>

            {/* Available Skills Tab */}
            <TabsContent
              value="available"
              className="mt-4 flex-1 flex flex-col"
            >
              {/* Class Selection Buttons */}
              <div className="flex gap-2 mb-4">
                {character.primaryClass && (
                  <Button
                    variant={
                      selectedAvailableClass === "primary"
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    onClick={() => setSelectedAvailableClass("primary")}
                  >
                    {character.primaryClass.Title} (Primary)
                  </Button>
                )}
                {character.secondaryClass &&
                  !character.secondaryClass.Title?.toLowerCase().includes(
                    "none"
                  ) && (
                    <Button
                      variant={
                        selectedAvailableClass === "secondary"
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() => setSelectedAvailableClass("secondary")}
                    >
                      {character.secondaryClass.Title} (Secondary)
                    </Button>
                  )}
              </div>

              <ScrollArea className="flex-1">
                <div className="space-y-6">
                  {Object.entries(skillData.skillsByTier)
                    .sort(
                      ([tierA], [tierB]) => Number(tierA) - Number(tierB)
                    )
                    .map(([tier, skills]) => {
                      const selectedClassObj =
                        selectedAvailableClass === "primary"
                          ? character.primaryClass
                          : character.secondaryClass;

                      const classSkills = sortSkillsByTier(
                        (skills as any[]).filter((skill: any) => {
                          if (skill.classId !== selectedClassObj?.id)
                            return false;
                          const learned =
                            learnedSkillIdsSet.has(skill.id);
                          if (learned && !skill.canBeTakenMultiple)
                            return false;
                          return true;
                        })
                      );

                      if (classSkills.length === 0) return null;

                      return (
                        <div key={tier}>
                          <div className="flex items-center gap-2 mb-3">
                            <Badge variant="outline" className="font-medium">
                              Tier {tier} Skills
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {selectedClassObj?.Title}
                            </span>
                            <div className="h-px bg-border flex-1" />
                          </div>
                          <div className="border rounded-lg overflow-hidden">
                            {classSkills.map((skill: any, index: number) => {
                              const isLearned =
                                learnedSkillIdsSet.has(skill.id);
                              return (
                                <SkillSlot
                                  key={skill.id}
                                  skill={skill}
                                  isLearned={isLearned}
                                  isGranted={grantedIds.has(skill.id)}
                                  characterId={character.id}
                                  character={character}
                                  isLastItem={index === classSkills.length - 1}
                                  onViewSkill={(s) => {
                                    setSelectedSkill(s);
                                    setIsSkillViewerOpen(true);
                                  }}
                                />
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        ) : isLoading ? (
          <div className="flex-1 flex items-center justify-center py-12">
            <p className="text-sm text-muted-foreground">Loading skills...</p>
          </div>
        ) : (
          <ScrollArea className="flex-1">
            {hasSkills ? (
              <div className="space-y-4">
                <div className="border rounded-lg overflow-hidden">
                  {sortSkillsWithGrantedFirst(
                    [...character.primarySkills, ...character.secondarySkills],
                    grantedIds
                  ).map((skill: any, index: number, array: any[]) => (
                    <SkillSlot
                      key={skill.id}
                      skill={skill}
                      isLearned={true}
                      isGranted={grantedIds.has(skill.id)}
                      showRemoveButton={isEditing && !grantedIds.has(skill.id)}
                      characterId={character.id}
                      character={character}
                      isLastItem={index === array.length - 1}
                      onViewSkill={(s) => {
                        setSelectedSkill(s);
                        setIsSkillViewerOpen(true);
                      }}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-sm text-muted-foreground">
                  This character hasn&apos;t learned any skills yet.
                </p>
              </div>
            )}
          </ScrollArea>
        )}
    </>
  );

  if (embedded) {
    return (
      <div className="flex-1 flex flex-col min-h-0">
        {content}
        <SkillViewer
          skill={selectedSkill}
          isOpen={isSkillViewerOpen}
          onClose={() => {
            setIsSkillViewerOpen(false);
            setSelectedSkill(null);
          }}
        />
      </div>
    );
  }

  return (
    <Card className="shadow-sm flex-1 flex flex-col">
      <CardHeader className="p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle className="flex items-center text-base sm:text-lg">
              <BookOpen className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Character Skills
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Skills learned and available for this character
            </CardDescription>
          </div>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant={!isEditMode ? "default" : "outline"}
              onClick={() => setIsEditMode(false)}
            >
              View
            </Button>
            <Button
              size="sm"
              variant={isEditMode ? "default" : "outline"}
              onClick={() => setIsEditMode(true)}
            >
              Edit
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 pt-0 flex-1 flex flex-col">
        {content}
      </CardContent>
      <CardFooter className="p-3 sm:p-4 pt-0">
        <p className="text-xs sm:text-sm text-muted-foreground">
          Total Skills: {totalSkills}
          {skillData && (
            <span className="ml-4">
              Available Tiers:{" "}
              {Math.max(skillData.maxPrimaryTier, skillData.maxSecondaryTier)}
            </span>
          )}
        </p>
      </CardFooter>
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

function ClassSlotSection({
  slots,
  isPrimary,
  character,
  skillData,
  maxTier,
  isEditMode,
  grantedIds,
  onSkillAdded,
}: {
  slots: { level: number; tier: number; skill?: any }[];
  isPrimary: boolean;
  character: any;
  skillData: any;
  maxTier: number;
  isEditMode: boolean;
  grantedIds: Set<string>;
  onSkillAdded?: () => void;
}) {
  const classObj = isPrimary
    ? character.primaryClass
    : character.secondaryClass;

  return (
    <div className="space-y-2">
      {slots.map((slot, index) => (
        <div
          key={index}
          className={`
            border rounded p-3 min-h-[3rem] flex items-center justify-between
            ${
              slot.skill
                ? "bg-green-50 border-green-200 dark:bg-green-950/50 dark:border-green-800"
                : "bg-muted/50 border-dashed border-muted-foreground/30"
            }
          `}
        >
          {slot.skill ? (
            <>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {slot.skill.title}
                  </span>
                  {grantedIds.has(slot.skill.id) && (
                    <Badge variant="secondary" className="text-xs">
                      Granted
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs">
                    Tier {slot.skill.tier}
                  </Badge>
                </div>
                {slot.skill.descriptionShort && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                    {slot.skill.descriptionShort}
                  </p>
                )}
              </div>
              {isEditMode && !grantedIds.has(slot.skill.id) && (
                <form
                  action={async () => {
                    await removeSkillFromCharacter(character.id, slot.skill.id);
                  }}
                >
                  <Button
                    size="sm"
                    variant="outline"
                    type="submit"
                    className="h-8 w-8 p-0 ml-2"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                </form>
              )}
            </>
          ) : (
            <>
              <div className="flex-1">
                <span className="text-sm text-muted-foreground">
                  Empty Slot (Level {slot.level}) - Up to Tier {slot.tier}
                </span>
                <div className="text-xs text-muted-foreground mt-1">
                  {classObj?.Title} skills only
                </div>
              </div>
              {isEditMode && (
                <SkillSearchDialog
                  tier={slot.tier}
                  targetClass={classObj}
                  character={character}
                  skillData={skillData}
                  onSkillAdded={onSkillAdded}
                />
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
}

export function SkillSlot({
  skill,
  isLearned,
  isGranted = false,
  canLearn = false,
  showAddButton = false,
  showRemoveButton = false,
  characterId,
  character,
  isLastItem = false,
  onViewSkill,
}: {
  skill: any;
  isLearned: boolean;
  isGranted?: boolean;
  canLearn?: boolean;
  showAddButton?: boolean;
  showRemoveButton?: boolean;
  characterId?: string;
  character?: any;
  isLastItem?: boolean;
  onViewSkill?: (skill: any) => void;
}) {
  // Get effective values (accounting for skill_modifier effects from other skills)
  const effectiveEpReduction = character
    ? getEffectiveSkillValue(skill, character, "permenentEpReduction")
    : skill.permenentEpReduction;
  const effectiveEpCost = character
    ? getEffectiveSkillValue(skill, character, "epCost")
    : skill.epCost;

  const epDisplay =
    Number(effectiveEpReduction) > 0
      ? `Permanent EP -${effectiveEpReduction}`
      : effectiveEpCost && String(effectiveEpCost).trim() !== "" && Number(effectiveEpCost) > 0
        ? `EP Cost: ${effectiveEpCost}`
        : null;

  return (
    <div
      role={onViewSkill ? "button" : undefined}
      tabIndex={onViewSkill ? 0 : undefined}
      className={`
        flex items-center justify-between p-3 min-h-[3rem]
        ${!isLastItem ? "border-b" : ""}
        ${"bg-background hover:bg-muted/50"}
        ${onViewSkill ? "cursor-pointer" : ""}
        transition-colors
      `}
      onClick={onViewSkill ? () => onViewSkill(skill) : undefined}
      onKeyDown={
        onViewSkill
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onViewSkill(skill);
              }
            }
          : undefined
      }
    >
      <div className="flex-1 min-w-[60%] pr-4">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-medium text-sm">{skill.title}</h3>
          {isGranted && (
            <Badge variant="secondary" className="text-xs flex-shrink-0">
              Granted
            </Badge>
          )}
          <Badge variant="outline" className="text-xs flex-shrink-0">
            Tier {skill.tier}
          </Badge>
        </div>
        {skill.descriptionShort && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
            {skill.descriptionShort}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3 flex-shrink-0 min-w-0">
        {epDisplay && (
          <div className="text-right min-w-0">
            <div className="text-sm font-medium whitespace-nowrap">
              {epDisplay}
            </div>
          </div>
        )}

        {showAddButton && canLearn && characterId && (
          <form
            onClick={(e) => e.stopPropagation()}
            action={async () => {
              await addSkillToCharacter(characterId, skill.id, true);
            }}
          >
            <Button
              size="sm"
              variant="outline"
              type="submit"
              className="h-8 w-8 p-0"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </form>
        )}

        {showRemoveButton && isLearned && characterId && (
          <form
            onClick={(e) => e.stopPropagation()}
            action={async () => {
              await removeSkillFromCharacter(characterId, skill.id);
            }}
          >
            <Button
              size="sm"
              variant="outline"
              type="submit"
              className="h-8 w-8 p-0"
            >
              <Minus className="h-3 w-3" />
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
