"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, Eye } from "lucide-react";
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
import { SkillViewer } from "@/components/SkillViewer";
import { sortSkillsByTier } from "@/lib/utils";

interface SkillSearchDialogProps {
  tier: number;
  targetClass: any;
  character: any;
  skillData: any;
  onSkillAdded?: () => void;
}

export function SkillSearchDialog({
  tier,
  targetClass,
  character,
  skillData,
  onSkillAdded,
}: SkillSearchDialogProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTiers, setActiveTiers] = useState<number[]>([]);
  const [viewSkill, setViewSkill] = useState<any>(null);
  const [pendingSkillId, setPendingSkillId] = useState<string | null>(null);

  const learnedSkillIds = new Set([
    ...(character?.primarySkills || []).map((s: { id: string }) => s.id),
    ...(character?.secondarySkills || []).map((s: { id: string }) => s.id),
  ]);

  const getAllAvailableSkills = () => {
    const classId = targetClass?.id;
    if (!classId || !skillData?.skillsByTier) return [];

    const allSkills: any[] = [];
    for (let currentTier = 1; currentTier <= tier; currentTier++) {
      const tierSkills = skillData.skillsByTier[currentTier] || [];
      const availableSkillsForTier = tierSkills.filter((skill: any) => {
        if (skill.classId !== classId) return false;
        const isLearned = learnedSkillIds.has(skill.id);
        if (isLearned && !skill.canBeTakenMultiple) return false;
        return true;
      });
      allSkills.push(...availableSkillsForTier);
    }
    return sortSkillsByTier(allSkills);
  };

  const allAvailableSkills = getAllAvailableSkills();

  const handleLearn = async (skillId: string) => {
    setPendingSkillId(skillId);
    try {
      const isPrimary =
        targetClass?.id === character.primaryClass?.id;
      await addSkillToCharacterAction(
        character.id,
        skillId,
        isPrimary
      );
      onSkillAdded?.();
      router.refresh();
    } finally {
      setPendingSkillId(null);
    }
  };

  const toggleTier = (tierValue: number) => {
    setActiveTiers((current) =>
      current.includes(tierValue)
        ? current.filter((value) => value !== tierValue)
        : [...current, tierValue]
    );
  };

  // Filter skills based on search term
  const filteredSkills = allAvailableSkills.filter(
    (skill: any) =>
      skill.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (skill.descriptionShort &&
        skill.descriptionShort.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const tierFilteredSkills = sortSkillsByTier(
    activeTiers.length === 0
      ? filteredSkills
      : filteredSkills.filter((skill: any) => activeTiers.includes(skill.tier))
  );

  const groupedFilteredSkills = tierFilteredSkills.reduce(
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

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Filter tiers:</span>
          {Array.from({ length: tier }, (_, index) => {
            const tierValue = index + 1;
            const isActive = activeTiers.includes(tierValue);
            return (
              <Badge
                key={tierValue}
                role="button"
                tabIndex={0}
                variant={isActive ? "default" : "outline"}
                className="text-xs cursor-pointer select-none"
                onClick={() => toggleTier(tierValue)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    toggleTier(tierValue);
                  }
                }}
              >
                Tier {tierValue}
              </Badge>
            );
          })}
          {activeTiers.length > 0 && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-6 px-2 text-xs"
              onClick={() => setActiveTiers([])}
            >
              Clear
            </Button>
          )}
        </div>

        <ScrollArea className="max-h-[400px]">
          <div className="space-y-2">
            {tierFilteredSkills.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {allAvailableSkills.length === 0
                  ? `No skills available for ${
                      targetClass?.Title || "No Class"
                    } up to tier ${tier}`
                  : "No skills found matching your filters"}
              </div>
            ) : searchTerm ? (
              // Show flat list when searching
              tierFilteredSkills.map((skill: any) => (
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
                  <div className="flex items-center gap-2 ml-2">
                    <Button
                      size="sm"
                      variant="outline"
                      type="button"
                      className="h-8 w-8 p-0"
                      onClick={() => setViewSkill(skill)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="default"
                      type="button"
                      disabled={!!pendingSkillId}
                      onClick={() => handleLearn(skill.id)}
                    >
                      {pendingSkillId === skill.id ? "..." : "Learn"}
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              // Show grouped by tier when not searching
              Object.entries(groupedFilteredSkills)
                .sort(([tierA], [tierB]) => Number(tierA) - Number(tierB))
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
                        <div className="flex items-center gap-2 ml-2">
                          <Button
                            size="sm"
                            variant="outline"
                            type="button"
                            className="h-8 w-8 p-0"
                            onClick={() => setViewSkill(skill)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="default"
                            type="button"
                            disabled={!!pendingSkillId}
                            onClick={() => handleLearn(skill.id)}
                          >
                            {pendingSkillId === skill.id ? "..." : "Learn"}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ))
            )}
          </div>
        </ScrollArea>

        <SkillViewer
          skill={viewSkill}
          isOpen={!!viewSkill}
          onClose={() => setViewSkill(null)}
        />
      </DialogContent>
    </Dialog>
  );
}
