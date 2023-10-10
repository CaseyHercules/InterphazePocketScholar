import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { Role } from "@prisma/client";
import { DeleteValidator } from "@/lib/validators/post";

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    const user = await db.user.findFirst({
      where: { id: session?.user?.id },
    });

    if (
      !session?.user ||
      user?.role === Role.USER ||
      user?.role === Role.SPELLWRIGHT
    ) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { id } = DeleteValidator.parse(body);

    await db.post.delete({
      where: { id },
    });

    return new Response("OK");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 422 });
    }

    return new Response("Could not delete this post, please try again later", {
      status: 500,
    });
  }
}
