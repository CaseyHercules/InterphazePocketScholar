import { db } from "@/lib/db";
import { z } from "zod";

export async function GET(req: Request) {
  const url = new URL(req.url);

  try {
    const { limit, page, topicName } = z
      .object({
        limit: z.string(),
        page: z.string(),
        topicName: z.string(),
      })
      .parse({
        topicName: url.searchParams.get("topic"),
        limit: url.searchParams.get("limit"),
        page: url.searchParams.get("page"),
      });

    const posts = await db.post.findMany({
      take: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
      orderBy: {
        createdAt: "desc",
      },
      where: { Topic: { title: topicName } },
    });

    return new Response(JSON.stringify(posts));
  } catch (error) {
    // console.log(error);
    return new Response("Could not fetch posts 500", { status: 500 });
  }
}
