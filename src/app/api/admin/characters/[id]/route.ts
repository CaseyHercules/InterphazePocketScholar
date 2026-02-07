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

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return new NextResponse("Character id is required", { status: 400 });
    }

    const existing = await db.character.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) {
      return new NextResponse("Character not found", { status: 404 });
    }

    const body = await req.json();
    const data: Prisma.CharacterUpdateInput = {};

    if (body.userId !== undefined) {
      const uid = typeof body.userId === "string" ? body.userId.trim() : null;
      if (uid) {
        const userExists = await db.user.findUnique({
          where: { id: uid },
          select: { id: true },
        });
        if (!userExists) {
          return new NextResponse("User not found", { status: 404 });
        }
      }
      data.user = uid ? { connect: { id: uid } } : { disconnect: true };
    }

    if (body.name !== undefined && typeof body.name === "string") {
      const name = body.name.trim();
      if (name.length > 0) data.name = name;
    }
    if (body.primaryClassId !== undefined) {
      const pid =
        body.primaryClassId === "none" || !body.primaryClassId?.trim()
          ? null
          : body.primaryClassId.trim();
      data.primaryClass = pid ? { connect: { id: pid } } : { disconnect: true };
    }
    if (
      body.primaryClassLvl !== undefined &&
      typeof body.primaryClassLvl === "number" &&
      Number.isInteger(body.primaryClassLvl) &&
      body.primaryClassLvl >= 1
    ) {
      data.primaryClassLvl = body.primaryClassLvl;
    }
    if (body.secondaryClassId !== undefined) {
      const sid =
        body.secondaryClassId === "none" || !body.secondaryClassId?.trim()
          ? null
          : body.secondaryClassId.trim();
      data.secondaryClass = sid ? { connect: { id: sid } } : { disconnect: true };
    }
    if (
      body.secondaryClassLvl !== undefined &&
      typeof body.secondaryClassLvl === "number" &&
      Number.isInteger(body.secondaryClassLvl) &&
      body.secondaryClassLvl >= 0
    ) {
      data.secondaryClassLvl = body.secondaryClassLvl;
    }
    if (body.Attributes !== undefined && typeof body.Attributes === "object") {
      data.Attributes = body.Attributes;
    }
    if (body.notes !== undefined && typeof body.notes === "object") {
      data.notes = body.notes;
    }
    if (
      body.phazians !== undefined &&
      typeof body.phazians === "number" &&
      Number.isInteger(body.phazians) &&
      body.phazians >= 0
    ) {
      data.phazians = body.phazians;
    }
    if (body.inlineEffectsJson !== undefined) {
      data.inlineEffectsJson =
        body.inlineEffectsJson === null ? Prisma.JsonNull : body.inlineEffectsJson;
    }

    const updated = await db.character.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        userId: true,
        primaryClassId: true,
        primaryClassLvl: true,
        secondaryClassId: true,
        secondaryClassLvl: true,
        phazians: true,
        user: {
          select: { id: true, name: true, email: true, username: true },
        },
      },
    });

    return NextResponse.json(updated);
  } catch {
    return new NextResponse("Failed to update character", { status: 500 });
  }
}
