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
    const user = await requireAdmin();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    if (!body.characterId || !body.adjustmentId) {
      return new NextResponse("characterId and adjustmentId are required", {
        status: 422,
      });
    }

    const created = await db.characterAdjustment.create({
      data: {
        characterId: body.characterId,
        adjustmentId: body.adjustmentId,
        notes: body.notes ?? null,
      },
    });

    return NextResponse.json(created);
  } catch (error) {
    return new NextResponse("Failed to attach adjustment", { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await requireAdmin();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const characterId = searchParams.get("characterId");
    const adjustmentId = searchParams.get("adjustmentId");

    if (!characterId || !adjustmentId) {
      return new NextResponse("characterId and adjustmentId are required", {
        status: 400,
      });
    }

    await db.characterAdjustment.delete({
      where: {
        characterId_adjustmentId: {
          characterId,
          adjustmentId,
        },
      },
    });

    return new NextResponse("OK");
  } catch (error) {
    return new NextResponse("Failed to detach adjustment", { status: 500 });
  }
}

