"use client";

import { useState } from "react";
import type { Skill, Class } from "@prisma/client";
import { SkillTable } from "@/components/SkillTable";
import { SkillViewer } from "@/components/SkillViewer";

type SkillWithClass = Skill & { class?: Class | null };

export default function SkillBrowser({
  skills,
}: {
  skills: SkillWithClass[];
}) {
  const [selectedSkill, setSelectedSkill] = useState<SkillWithClass | null>(
    null
  );
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  return (
    <>
      <SkillTable
        skills={skills}
        onView={(skill) => {
          setSelectedSkill(skill);
          setIsViewerOpen(true);
        }}
        enableRowClick
        showActionsColumn={false}
      />

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
    </>
  );
}
