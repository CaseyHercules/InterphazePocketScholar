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

export async function PATCH(req: Request) {
  try {
    const user = await requireAdmin();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { characterId, slot, classId } = body;

    if (!characterId || typeof characterId !== "string") {
      return new NextResponse("characterId is required", { status: 422 });
    }

    if (slot !== "primary" && slot !== "secondary") {
      return new NextResponse(
        "slot must be 'primary' or 'secondary'",
        { status: 422 }
      );
    }

    const classIdValue =
      classId && typeof classId === "string" ? classId : null;

    if (slot === "primary") {
      await db.characterPrimarySkill.deleteMany({
        where: { characterId },
      });
      await db.character.update({
        where: { id: characterId },
        data: { primaryClassId: classIdValue },
      });
    } else {
      await db.characterSecondarySkill.deleteMany({
        where: { characterId },
      });
      await db.character.update({
        where: { id: characterId },
        data: { secondaryClassId: classIdValue },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return new NextResponse("Failed to update character class", {
      status: 500,
    });
  }
}
