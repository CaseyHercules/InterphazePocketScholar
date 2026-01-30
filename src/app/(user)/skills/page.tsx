import { getServerSession } from "next-auth";
import SkillBrowser from "@/components/SkillBrowser";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getSkillVisibilityWhere } from "@/lib/visibility";

export default async function SkillsPage() {
  const session = await getServerSession(authOptions);
  const skills = await db.skill.findMany({
    where: getSkillVisibilityWhere(session?.user?.role),
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
