"use client";

import { BookOpen, Plus, Check, Minus, Lock, Unlock, Eye } from "lucide-react";
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
} from "@/lib/actions/passport";
import { useState } from "react";
import { getEffectiveSkillValue } from "@/lib/utils/character-stats";

interface CharacterSkillsCardProps {
  character: any;
  skillData?: {
    primarySkillTiers: { [level: number]: number };
    secondarySkillTiers: { [level: number]: number };
    skillsByTier: { [tier: number]: any[] };
    learnedSkillIds: Set<string>;
    maxPrimaryTier: number;
    maxSecondaryTier: number;
  };
}

export function CharacterSkillsCard({
  character,
  skillData,
}: CharacterSkillsCardProps) {
  const [selectedAvailableClass, setSelectedAvailableClass] = useState<
    "primary" | "secondary"
  >("primary");
  const [selectedSkill, setSelectedSkill] = useState<any | null>(null);
  const [isSkillViewerOpen, setIsSkillViewerOpen] = useState(false);

  const hasSkills =
    character.primarySkills.length > 0 || character.secondarySkills.length > 0;
  const totalSkills =
    character.primarySkills.length + character.secondarySkills.length;

  // Get skill slots organized by class as a single list
  const getClassSkillSlots = (isPrimary: boolean) => {
    if (!skillData) return { slots: [], maxTier: 0 };

    const skillTiers = isPrimary
      ? skillData.primarySkillTiers
      : skillData.secondarySkillTiers;
    const maxTier = isPrimary
      ? skillData.maxPrimaryTier
      : skillData.maxSecondaryTier;
    const learnedSkills = isPrimary
      ? character.primarySkills
      : character.secondarySkills;

    // Create all slots in order
    const slots: { level: number; tier: number; skill?: any }[] = [];

    Object.entries(skillTiers).forEach(([level, tier]) => {
      slots.push({ level: parseInt(level), tier });
    });

    // Sort slots by level
    slots.sort((a, b) => a.level - b.level);

    // Fill slots with learned skills (match by tier preference)
    learnedSkills.forEach((skill: any) => {
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

  return (
    <Card className="shadow-sm flex-1 flex flex-col">
      <CardHeader className="p-3 sm:p-4">
        <CardTitle className="flex items-center text-base sm:text-lg">
          <BookOpen className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
          Character Skills
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Skills learned and available for this character
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 pt-0 flex-1 flex flex-col">
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
                      ([tierA], [tierB]) => parseInt(tierA) - parseInt(tierB)
                    )
                    .map(([tier, skills]) => {
                      const selectedClassObj =
                        selectedAvailableClass === "primary"
                          ? character.primaryClass
                          : character.secondaryClass;

                      // Filter skills for the selected class
                      const classSkills = (skills as any[]).filter(
                        (skill: any) => skill.classId === selectedClassObj?.id
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
                              const isLearned = skillData.learnedSkillIds.has(
                                skill.id
                              );
                              return (
                                <SkillSlot
                                  key={skill.id}
                                  skill={skill}
                                  isLearned={isLearned}
                                  showViewButton={true}
                                  characterId={character.id}
                                  character={character}
                                  isLastItem={index === classSkills.length - 1}
                                  onViewSkill={(skill) => {
                                    setSelectedSkill(skill);
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
        ) : (
          // Fallback for when skillData is not available
          <ScrollArea className="flex-1">
            {hasSkills ? (
              <div className="space-y-4">
                <div className="border rounded-lg overflow-hidden">
                  {[
                    ...character.primarySkills,
                    ...character.secondarySkills,
                  ].map((skill: any, index: number, array: any[]) => (
                    <SkillSlot
                      key={skill.id}
                      skill={skill}
                      isLearned={true}
                      characterId={character.id}
                      character={character}
                      showRemoveButton={true}
                      isLastItem={index === array.length - 1}
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

      {/* Skill Viewer Dialog */}
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

// New component for class slot sections
function ClassSlotSection({
  slots,
  isPrimary,
  character,
  skillData,
  maxTier,
}: {
  slots: { level: number; tier: number; skill?: any }[];
  isPrimary: boolean;
  character: any;
  skillData: any;
  maxTier: number;
}) {
  // Get the specific class for this section
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
                  <Badge variant="outline" className="text-xs">
                    Tier {slot.skill.tier}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-xs hover:bg-green-300"
                  >
                    Learned
                  </Badge>
                </div>
                {slot.skill.descriptionShort && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                    {slot.skill.descriptionShort}
                  </p>
                )}
              </div>
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
              <SkillSearchDialog
                tier={slot.tier}
                targetClass={classObj}
                character={character}
                skillData={skillData}
              />
            </>
          )}
        </div>
      ))}
    </div>
  );
}

function SkillSlot({
  skill,
  isLearned,
  canLearn = false,
  showAddButton = false,
  showRemoveButton = false,
  showViewButton = false,
  characterId,
  character,
  isLastItem = false,
  onViewSkill,
}: {
  skill: any;
  isLearned: boolean;
  canLearn?: boolean;
  showAddButton?: boolean;
  showRemoveButton?: boolean;
  showViewButton?: boolean;
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

  return (
    <div
      className={`
        flex items-center justify-between p-3 min-h-[3rem]
        ${!isLastItem ? "border-b" : ""}
        ${"bg-background hover:bg-muted/50"}
        transition-colors
      `}
    >
      <div className="flex-1 min-w-[60%] pr-4">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-medium text-sm">{skill.title}</h3>
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

      <div className="flex items-center gap-3 flex-shrink-0 min-w-0 ">
        <div className="text-right min-w-0">
          <div className="text-sm font-medium whitespace-nowrap">
            {Number(effectiveEpReduction) > 0
              ? `Permanent EP -${effectiveEpReduction}`
              : effectiveEpCost && String(effectiveEpCost).trim() !== ""
              ? effectiveEpCost
              : ""}
          </div>
        </div>

        {showAddButton && canLearn && characterId && (
          <form
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

        {showViewButton && onViewSkill && (
          <Button
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => onViewSkill(skill)}
          >
            <Eye className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
}
