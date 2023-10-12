import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { any, z } from "zod";
import { Role } from "@prisma/client";
import { ClassValidator, UpdateValidator } from "@/lib/validators/class";

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    const user = session?.user
      ? await db.user.findFirst({
          where: { id: session?.user?.id },
        })
      : null;

    if (
      !session?.user ||
      !(user?.role === Role.ADMIN || user?.role === Role.SUPERADMIN)
    ) {
      return new Response("Unauthorized", { status: 401 });
    }
    let id: string;
    let title: string;
    let description: string;
    let HP: any;
    let EP: any;
    let Attack: any;
    let Accuracy: any;
    let Defense: any;
    let Resistance: any;
    let Tough: any;
    let Quick: any;
    let Mind: any;

    const body = await req.json();
    if (body["id"]) {
      const {
        id,
        title,
        description,
        HP,
        EP,
        Attack,
        Accuracy,
        Defense,
        Resistance,
        Tough,
        Quick,
        Mind,
      } = UpdateValidator.parse(body);
      await db.class.update({
        where: { id },
        data: {
          Title: title,
          description,
          HP,
          EP,
          Attack,
          Accuracy,
          Defense,
          Resistance,
          Tough,
          Quick,
          Mind,
        },
      });
    } else {
      const {
        title,
        description,
        HP,
        EP,
        Attack,
        Accuracy,
        Defense,
        Resistance,
        Tough,
        Quick,
        Mind,
      } = ClassValidator.parse(body);
      await db.class.create({
        data: {
          Title: title,
          description,
          HP,
          EP,
          Attack,
          Accuracy,
          Defense,
          Resistance,
          Tough,
          Quick,
          Mind,
        },
      });
    }

    return new Response("OK");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 422 });
    }

    return new Response(
      "Could process this class request, please try again later",
      { status: 500 }
    );
  }
}
