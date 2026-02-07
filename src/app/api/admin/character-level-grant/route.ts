import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";
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
    const admin = await requireAdmin();
    if (!admin) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { characterId, slot, levelsToAdd } = body;

    if (!characterId || typeof characterId !== "string") {
      return new NextResponse("characterId is required", { status: 422 });
    }

    if (slot !== "primary" && slot !== "secondary") {
      return new NextResponse(
        "slot must be 'primary' or 'secondary'",
        { status: 422 }
      );
    }

    const levels = Math.floor(Number(levelsToAdd) || 0);
    if (levels < 1) {
      return new NextResponse(
        "levelsToAdd must be at least 1",
        { status: 422 }
      );
    }

    const character = await db.character.findUnique({
      where: { id: characterId },
      select: {
        primaryClassId: true,
        primaryClassLvl: true,
        secondaryClassId: true,
        secondaryClassLvl: true,
      },
    });

    if (!character) {
      return new NextResponse("Character not found", { status: 404 });
    }

    if (slot === "primary" && !character.primaryClassId) {
      return new NextResponse(
        "Character has no primary class to add levels to",
        { status: 422 }
      );
    }

    if (slot === "secondary" && !character.secondaryClassId) {
      return new NextResponse(
        "Character has no secondary class to add levels to",
        { status: 422 }
      );
    }

    const currentLevel =
      slot === "primary"
        ? character.primaryClassLvl
        : character.secondaryClassLvl;
    const newLevel = currentLevel + levels;

    await db.character.update({
      where: { id: characterId },
      data:
        slot === "primary"
          ? { primaryClassLvl: newLevel }
          : { secondaryClassLvl: newLevel },
    });

    return NextResponse.json({
      ok: true,
      newLevel,
      levelsAdded: levels,
    });
  } catch {
    return new NextResponse("Failed to add levels", { status: 500 });
  }
}
