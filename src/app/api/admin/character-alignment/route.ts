import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import {
  isValidAlignmentData,
  ALIGNMENT_MIN,
  ALIGNMENT_MAX,
  ALIGNMENT_MAX_TICKS,
} from "@/types/alignment";

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

    const raw = body.alignment;
    if (!Array.isArray(raw) || raw.length !== 3) {
      return new NextResponse("alignment must be [level, upTicks, downTicks]", {
        status: 422,
      });
    }
    const alignment: [number, number, number] = [
      Number(raw[0]),
      Number(raw[1]),
      Number(raw[2]),
    ];
    if (!isValidAlignmentData(alignment)) {
      return new NextResponse(
        `alignment: level ${ALIGNMENT_MIN}-${ALIGNMENT_MAX}, ticks 0-${ALIGNMENT_MAX_TICKS}`,
        { status: 422 }
      );
    }

    const character = await db.character.update({
      where: { id: body.characterId },
      data: { alignmentJson: alignment },
    });

    return NextResponse.json(character);
  } catch (error) {
    return new NextResponse("Failed to update alignment", { status: 500 });
  }
}
