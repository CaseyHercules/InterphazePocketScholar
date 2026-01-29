"use client";

import { useState } from "react";
import type { Class, Skill } from "@prisma/client";
import { SkillTable } from "@/components/SkillTable";
import { SkillViewer } from "@/components/SkillViewer";

type SkillWithClass = Skill & { class?: Class | null };

interface SkillEmbedTableProps {
  classTitle: string;
  skills: SkillWithClass[];
}

export default function SkillEmbedTable({
  classTitle,
  skills,
}: SkillEmbedTableProps) {
  const [selectedSkill, setSelectedSkill] = useState<SkillWithClass | null>(
    null
  );
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  return (
    <div className="my-6 rounded-lg border border-border bg-card p-4">
      <div className="mb-3">
        <h3 className="text-lg font-semibold">{classTitle} Skills</h3>
        <p className="text-sm text-muted-foreground">
          Search and sort skills for the {classTitle} class.
        </p>
      </div>

      {skills.length === 0 ? (
        <div className="text-sm text-muted-foreground">
          No skills found for this class.
        </div>
      ) : (
        <SkillTable
          skills={skills}
          onView={(skill) => {
            setSelectedSkill(skill);
            setIsViewerOpen(true);
          }}
          showClassFilter={false}
        />
      )}

      {isViewerOpen && selectedSkill && (
        <SkillViewer
          skill={selectedSkill}
          isOpen={isViewerOpen}
          onClose={() => {
            setIsViewerOpen(false);
            setSelectedSkill(null);
          }}
        />
      )}
    </div>
  );
}
