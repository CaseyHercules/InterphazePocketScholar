import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/db";
import { CreateSpellInput, UpdateSpellInput, SPELL_TYPES } from "@/types/spell";
import { authOptions } from "@/lib/auth";
import { getVisibilityWhere } from "@/lib/visibility";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: CreateSpellInput = await req.json();
    const { title, type, data, description, level, characterId, visibilityRoles } =
      body;

    if (!title || level === undefined) {
      return NextResponse.json(
        { error: "Title and level are required" },
        { status: 400 }
      );
    }

    const spell = await prisma.spell.create({
      data: {
        title,
        type,
        data: data ? JSON.parse(JSON.stringify(data)) : undefined,
        description,
        level,
        characterId: characterId || null,
        visibilityRoles: (visibilityRoles ?? []) as Role[],
      },
    });

    return NextResponse.json(spell);
  } catch (error) {
    console.error("Error creating spell:", error);
    return NextResponse.json(
      { error: "Error creating spell" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const spells = await prisma.spell.findMany({
      where: getVisibilityWhere(session?.user?.role),
      orderBy: [
        {
          level: "asc",
        },
        {
          title: "asc",
        },
      ],
      select: {
        id: true,
        title: true,
        description: true,
        level: true,
        type: true,
        data: true,
      },
    });

    const formattedSpells = spells.map((spell) => {
      if (spell.data && typeof spell.data === "object") {
        try {
          const data = spell.data as any;
        } catch (e) {
          console.error("Error parsing spell data", e);
        }
      }

      return {
        id: spell.id,
        title: spell.title,
        // Keep name for any legacy consumers still expecting it.
        name: spell.title,
        description: spell.description || "",
        level: spell.level,
        type: spell.type || undefined,
        data: spell.data ?? undefined,
      };
    });

    return NextResponse.json(formattedSpells);
  } catch (error) {
    console.error("[SPELLS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: UpdateSpellInput = await req.json();
    const { id, type, characterId, visibilityRoles, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Spell ID is required" },
        { status: 400 }
      );
    }

    const spell = await prisma.spell.update({
      where: { id },
      data: {
        ...updateData,
        data: updateData.data
          ? JSON.parse(JSON.stringify(updateData.data))
          : undefined,
        type: type || null,
        characterId: characterId || null,
        ...(visibilityRoles ? { visibilityRoles: visibilityRoles as Role[] } : {}),
      },
    });

    return NextResponse.json(spell);
  } catch (error) {
    console.error("Error updating spell:", error);
    return NextResponse.json(
      { error: "Error updating spell" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Spell ID is required" },
        { status: 400 }
      );
    }

    await prisma.spell.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting spell:", error);
    return NextResponse.json(
      { error: "Error deleting spell" },
      { status: 500 }
    );
  }
}
