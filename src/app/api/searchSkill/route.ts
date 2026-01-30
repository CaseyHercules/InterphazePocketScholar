import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getSkillVisibilityWhere } from "@/lib/visibility";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q");

  if (!q) return new Response("Missing query", { status: 400 });

  const session = await getServerSession(authOptions);
  const resultsP = await db.skill.findMany({
    where: {
      title: {
        contains: q,
      },
      ...getSkillVisibilityWhere(session?.user?.role),
    },
    include: {
      class: true,
    },
    take: 5,
  });
  return new Response(JSON.stringify(resultsP));
}
