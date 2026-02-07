import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { Prisma, Role } from "@prisma/client";
import { NextResponse } from "next/server";

const requireAdmin = async () => {
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
    return null;
  }

  return user;
};

export async function POST(req: Request) {
  try {
    const user = await requireAdmin();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    if (!body.characterId) {
      return new NextResponse("characterId is required", {
        status: 422,
      });
    }

    const inlineEffectsJson =
      body.inlineEffectsJson === null ||
      (Array.isArray(body.inlineEffectsJson?.effects) &&
        body.inlineEffectsJson.effects.length === 0)
        ? Prisma.JsonNull
        : body.inlineEffectsJson;

    const character = await db.character.update({
      where: { id: body.characterId },
      data: { inlineEffectsJson },
    });

    return NextResponse.json(character);
  } catch (error) {
    return new NextResponse("Failed to update Dinguses", { status: 500 });
  }
}
