"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SkillViewer } from "@/components/SkillViewer";
import { CharacterSkillsCard } from "./CharacterSkillsCard";
import { sortSkillsByTier } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

type SkillData = {
  primarySkillTiers: { [level: number]: number };
  secondarySkillTiers: { [level: number]: number };
  skillsByTier: { [tier: number]: any[] };
  learnedSkillIds: string[] | Set<string>;
  maxPrimaryTier: number;
  maxSecondaryTier: number;
};

interface CharacterSkillsViewProps {
  character: any;
  skillData?: SkillData | null;
  isSuperAdmin?: boolean;
}

export function CharacterSkillsView({
  character,
  skillData,
  isSuperAdmin = false,
}: CharacterSkillsViewProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<any | null>(null);

  const primarySkills = sortSkillsByTier(
    Array.isArray(character.primarySkills) ? character.primarySkills : []
  );
  const secondarySkills = sortSkillsByTier(
    Array.isArray(character.secondarySkills) ? character.secondarySkills : []
  );
  const hasSkills = primarySkills.length > 0 || secondarySkills.length > 0;
  const totalSkills = primarySkills.length + secondarySkills.length;

  const handleEditClose = (open: boolean) => {
    setEditOpen(open);
    if (!open) router.refresh();
  };

  const SkillRow = ({ skill }: { skill: any }) => (
    <button
      type="button"
      onClick={() => setSelectedSkill(skill)}
      className="flex items-start justify-between w-full px-3 py-2.5 text-left hover:bg-stone-100 dark:hover:bg-stone-800/50 transition-colors gap-2"
    >
      <div className="min-w-0 flex-1">
        <span className="text-sm font-medium block truncate">{skill.title}</span>
        {skill.descriptionShort && (
          <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5 line-clamp-2">
            {skill.descriptionShort}
          </p>
        )}
      </div>
      <Badge variant="outline" className="text-xs shrink-0">
        T{skill.tier}
      </Badge>
    </button>
  );

  return (
    <section
      className="rounded-lg border-2 border-stone-300 dark:border-stone-600 bg-gradient-to-b from-stone-50 to-stone-100/80 dark:from-stone-900 dark:to-stone-950 shadow-sm p-3"
      aria-label="Character skills"
    >
      <div className="mb-3 pb-2 border-b border-stone-300 dark:border-stone-600 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold leading-tight text-stone-900 dark:text-stone-100 tracking-tight flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Skills
          </h2>
          <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
            {totalSkills} skill{totalSkills !== 1 ? "s" : ""} learned
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setEditOpen(true)}
          className="shrink-0 gap-1.5"
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit Skills
        </Button>
      </div>

      {hasSkills ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100">
              {character.primaryClass?.Title ?? "Primary"}
            </h3>
            <p className="text-sm text-stone-600 dark:text-stone-400 mb-2">
              Primary class skills
            </p>
            <div className="divide-y divide-stone-200 dark:divide-stone-700 rounded-md border border-stone-200 dark:border-stone-700 overflow-hidden">
              {primarySkills.map((skill) => (
                <SkillRow key={skill.id} skill={skill} />
              ))}
              {primarySkills.length === 0 && (
                <div className="px-3 py-2.5 text-sm text-stone-500 dark:text-stone-400">
                  None yet
                </div>
              )}
            </div>
          </div>
          <div>
            <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100">
              {character.secondaryClass?.Title ?? "Secondary"}
            </h3>
            <p className="text-sm text-stone-600 dark:text-stone-400 mb-2">
              Secondary class skills
            </p>
            <div className="divide-y divide-stone-200 dark:divide-stone-700 rounded-md border border-stone-200 dark:border-stone-700 overflow-hidden">
              {secondarySkills.map((skill) => (
                <SkillRow key={skill.id} skill={skill} />
              ))}
              {secondarySkills.length === 0 && (
                <div className="px-3 py-2.5 text-sm text-stone-500 dark:text-stone-400">
                  None yet
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-stone-600 dark:text-stone-400 py-3">
          No skills learned yet.
        </p>
      )}

      <Dialog open={editOpen} onOpenChange={handleEditClose}>
        <DialogContent className="fixed left-[50%] top-[50%] z-50 w-[90vw] max-w-5xl h-[90dvh] max-h-[90dvh] translate-x-[-50%] translate-y-[-50%] flex flex-col p-0 rounded-lg duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-bottom-4 data-[state=open]:slide-in-from-bottom-4">
          <DialogHeader className="px-4 pt-4 pb-2 shrink-0 border-b border-stone-200 dark:border-stone-700">
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Character Skills
            </DialogTitle>
            <p className="text-sm text-stone-600 dark:text-stone-400 mt-0.5">
              Skills learned and available for this character
            </p>
          </DialogHeader>
          <ScrollArea className="flex-1 min-h-0">
            <div className="px-4 py-4 pr-4">
              <CharacterSkillsCard
                character={character}
                skillData={skillData}
                embedded
                isSuperAdmin={isSuperAdmin}
              />
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <SkillViewer
        skill={selectedSkill}
        isOpen={!!selectedSkill}
        onClose={() => setSelectedSkill(null)}
      />
    </section>
  );
}
