import SkillBrowser from "@/components/SkillBrowser";
import { db } from "@/lib/db";

export default async function SkillsPage() {
  const skills = await db.skill.findMany({
    where: { playerVisable: true },
    include: { class: true },
    orderBy: { title: "asc" },
  });

  return (
    <div className="w-full p-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Skills</h1>
        <p className="text-muted-foreground">
          Browse and sort all player-visible skills.
        </p>
      </div>
      <SkillBrowser skills={skills} />
    </div>
  );
}
