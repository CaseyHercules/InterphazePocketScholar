import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { CreateSpellInput, UpdateSpellInput, SPELL_TYPES } from "@/types/spell";

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: CreateSpellInput = await req.json();
    const { title, type, data, description, level, characterId } = body;

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

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const characterId = searchParams.get("characterId");

    const where = characterId ? { characterId } : {};
    const spells = await prisma.spell.findMany({ where });

    return NextResponse.json(spells);
  } catch (error) {
    console.error("Error fetching spells:", error);
    return NextResponse.json(
      { error: "Error fetching spells" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: UpdateSpellInput = await req.json();
    const { id, type, characterId, ...updateData } = body;

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
    const session = await getServerSession();
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
