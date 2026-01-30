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
    const { characterId, slot, levelsToRefund } = body;

    if (!characterId || typeof characterId !== "string") {
      return new NextResponse("characterId is required", { status: 422 });
    }

    if (slot !== "primary" && slot !== "secondary") {
      return new NextResponse(
        "slot must be 'primary' or 'secondary'",
        { status: 422 }
      );
    }

    const levels = Math.floor(Number(levelsToRefund) || 0);
    if (levels < 1) {
      return new NextResponse(
        "levelsToRefund must be at least 1",
        { status: 422 }
      );
    }

    const character = await db.character.findUnique({
      where: { id: characterId },
      select: {
        userId: true,
        primaryClassLvl: true,
        secondaryClassLvl: true,
        secondaryClassId: true,
      },
    });

    if (!character) {
      return new NextResponse("Character not found", { status: 404 });
    }

    const currentLevel =
      slot === "primary"
        ? character.primaryClassLvl
        : character.secondaryClassLvl;

    if (slot === "secondary" && !character.secondaryClassId) {
      return new NextResponse(
        "Character has no secondary class to refund",
        { status: 422 }
      );
    }

    const minLevel = slot === "primary" ? 1 : 0;
    const actualRefund = Math.min(levels, Math.max(0, currentLevel - minLevel));

    if (actualRefund < 1) {
      return new NextResponse(
        `Cannot refund below level ${minLevel}. Current level: ${currentLevel}`,
        { status: 422 }
      );
    }

    const newLevel = currentLevel - actualRefund;

    const updates: Parameters<typeof db.$transaction>[0] = [
      db.character.update({
        where: { id: characterId },
        data:
          slot === "primary"
            ? { primaryClassLvl: newLevel }
            : { secondaryClassLvl: newLevel },
      }),
    ];

    if (character.userId && actualRefund > 0) {
      updates.push(
        db.user.update({
          where: { id: character.userId },
          data: { UnallocatedLevels: { increment: actualRefund } },
        })
      );
    }

    await db.$transaction(updates);

    return NextResponse.json({
      ok: true,
      newLevel,
      levelsRefunded: actualRefund,
    });
  } catch (error) {
    return new NextResponse("Failed to refund levels", { status: 500 });
  }
}
