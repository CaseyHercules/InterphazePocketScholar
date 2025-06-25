import { db } from "@/lib/db";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q");

  if (!q) return new Response("Missing query", { status: 400 });

  const resultsP = await db.skill.findMany({
    where: {
      title: {
        contains: q,
      },
    },
    include: {
      class: true,
    },
    take: 5,
  });
  return new Response(JSON.stringify(resultsP));
}
