"use client";

import { useState } from "react";
import { Search, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { addSkillToCharacterAction } from "@/lib/actions/skill-actions";

interface SkillSearchDialogProps {
  tier: number;
  targetClass: any;
  character: any;
  skillData: any;
}

export function SkillSearchDialog({
  tier,
  targetClass,
  character,
  skillData,
}: SkillSearchDialogProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // Get all available skills up to the tier for the specific class
  const getAllAvailableSkills = () => {
    const classId = targetClass?.id;
    if (!classId) {
      console.log("No class ID found for filtering skills");
      return [];
    }

    const allSkills: any[] = [];

    console.log("Filtering skills for class ID:", classId);
    console.log("Skills by tier:", skillData.skillsByTier);

    for (let currentTier = 1; currentTier <= tier; currentTier++) {
      const tierSkills = skillData.skillsByTier[currentTier] || [];
      console.log(`Tier ${currentTier} skills:`, tierSkills.length);

      const availableSkillsForTier = tierSkills.filter((skill: any) => {
        const isClassSkill = skill.classId === classId;
        const isNotLearned = !skillData.learnedSkillIds.has(skill.id);
        console.log(
          `Skill ${skill.title}: classId=${skill.classId}, isClassSkill=${isClassSkill}, isNotLearned=${isNotLearned}`
        );
        return isClassSkill && isNotLearned;
      });

      console.log(
        `Available skills for tier ${currentTier}:`,
        availableSkillsForTier.length
      );
      allSkills.push(...availableSkillsForTier);
    }

    return allSkills;
  };

  const allAvailableSkills = getAllAvailableSkills();

  // Debug logging
  const classId = targetClass?.id;
  console.log("Debug - Class Skills:", {
    className: targetClass?.Title,
    classId,
    allAvailableSkills: allAvailableSkills.length,
    tier,
    skillDataExists: !!skillData,
    skillsByTierKeys: skillData ? Object.keys(skillData.skillsByTier) : [],
    targetClass,
  });

  // Filter skills based on search term
  const filteredSkills = allAvailableSkills.filter(
    (skill: any) =>
      skill.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (skill.descriptionShort &&
        skill.descriptionShort.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Group filtered skills by tier
  const groupedFilteredSkills = filteredSkills.reduce(
    (acc: { [tier: number]: any[] }, skill: any) => {
      if (!acc[skill.tier]) {
        acc[skill.tier] = [];
      }
      acc[skill.tier].push(skill);
      return acc;
    },
    {}
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="h-8 w-8 p-0">
          <Plus className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Choose Skill (Up to Tier {tier})</DialogTitle>
          <DialogDescription>
            Search and select a skill to learn for your{" "}
            {targetClass?.Title || "No Class"}. You can choose any skill up to
            tier {tier}.
          </DialogDescription>
        </DialogHeader>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <ScrollArea className="max-h-[400px]">
          <div className="space-y-2">
            {filteredSkills.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {allAvailableSkills.length === 0
                  ? `No skills available for ${
                      targetClass?.Title || "No Class"
                    } up to tier ${tier}`
                  : "No skills found matching your search"}
              </div>
            ) : searchTerm ? (
              // Show flat list when searching
              filteredSkills.map((skill: any) => (
                <div
                  key={skill.id}
                  className="border rounded p-3 flex items-center justify-between hover:bg-muted/50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-sm">{skill.title}</h3>
                      <Badge variant="outline" className="text-xs">
                        Tier {skill.tier}
                      </Badge>
                    </div>
                    {skill.descriptionShort && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {skill.descriptionShort}
                      </p>
                    )}
                    <div className="text-xs text-muted-foreground mt-1">
                      {skill.permenentEpReduction > 0
                        ? `Permanent EP -${skill.permenentEpReduction}`
                        : skill.epCost && skill.epCost.trim() !== ""
                        ? skill.epCost
                        : ""}
                    </div>
                  </div>
                  <form
                    action={async () => {
                      // Determine if this is primary or secondary based on the target class
                      const isPrimary =
                        targetClass?.id === character.primaryClass?.id;
                      await addSkillToCharacterAction(
                        character.id,
                        skill.id,
                        isPrimary
                      );
                    }}
                  >
                    <Button
                      size="sm"
                      variant="default"
                      type="submit"
                      className="ml-2"
                    >
                      Learn
                    </Button>
                  </form>
                </div>
              ))
            ) : (
              // Show grouped by tier when not searching
              Object.entries(groupedFilteredSkills)
                .sort(([tierA], [tierB]) => parseInt(tierA) - parseInt(tierB))
                .map(([currentTier, skills]) => (
                  <div key={currentTier}>
                    <div className="flex items-center gap-2 mb-2 mt-4 first:mt-0">
                      <Badge variant="outline" className="text-xs">
                        Tier {currentTier}
                      </Badge>
                      <div className="h-px bg-border flex-1" />
                    </div>
                    {(skills as any[]).map((skill: any) => (
                      <div
                        key={skill.id}
                        className="border rounded p-3 flex items-center justify-between hover:bg-muted/50"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-sm">
                              {skill.title}
                            </h3>
                            <Badge variant="outline" className="text-xs">
                              Tier {skill.tier}
                            </Badge>
                          </div>
                          {skill.descriptionShort && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {skill.descriptionShort}
                            </p>
                          )}
                          <div className="text-xs text-muted-foreground mt-1">
                            {skill.permenentEpReduction > 0
                              ? `Permanent EP -${skill.permenentEpReduction}`
                              : skill.epCost && skill.epCost.trim() !== ""
                              ? skill.epCost
                              : ""}
                          </div>
                        </div>
                        <form
                          action={async () => {
                            // Determine if this is primary or secondary based on the target class
                            const isPrimary =
                              targetClass?.id === character.primaryClass?.id;
                            await addSkillToCharacterAction(
                              character.id,
                              skill.id,
                              isPrimary
                            );
                          }}
                        >
                          <Button
                            size="sm"
                            variant="default"
                            type="submit"
                            className="ml-2"
                          >
                            Learn
                          </Button>
                        </form>
                      </div>
                    ))}
                  </div>
                ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
