import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { SPELL_PUBLICATION_STATUS } from "@/types/spell";
import { authOptions } from "@/lib/auth";
import { isAdminRole } from "@/lib/api-auth";
import { readEventCollection, writeEventCollection } from "@/lib/event-data";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id: eventId } = await params;

    // Check if event exists
    const event = await db.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return new NextResponse("Event not found", { status: 404 });
    }

    // Get event data
    const eventSpells = readEventCollection<string | { id?: string; quantity?: number }>(
      event.data,
      "spells"
    );
    const spellEntries = eventSpells
      .map((spellEntry) => ({
        spellId: typeof spellEntry === "string" ? spellEntry : spellEntry?.id,
        quantity: typeof spellEntry === "string" ? 1 : spellEntry?.quantity || 1,
      }))
      .filter(
        (entry): entry is { spellId: string; quantity: number } =>
          typeof entry.spellId === "string" && entry.spellId.length > 0
      );
    const uniqueIds = [...new Set(spellEntries.map((entry) => entry.spellId))];
    const foundSpells = await db.spell.findMany({
      where: { id: { in: uniqueIds } },
      select: {
        id: true,
        title: true,
        description: true,
        level: true,
        type: true,
        data: true,
        publicationStatus: true,
      },
    });
    const spellById = new Map(foundSpells.map((spell) => [spell.id, spell]));
    const spells = spellEntries
      .map(({ spellId, quantity }) => {
        const spell = spellById.get(spellId);
        if (!spell || spell.publicationStatus === SPELL_PUBLICATION_STATUS.IN_REVIEW) {
          return null;
        }
        const spellData =
          spell.data && typeof spell.data === "object"
            ? (spell.data as { class?: string })
            : undefined;
        return {
          id: spell.id,
          name: spell.title,
          description: spell.description || "",
          level: spell.level,
          class: spellData?.class || spell.type || undefined,
          quantity,
        };
      })
      .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

    return NextResponse.json(spells);
  } catch {
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if user is admin
    if (!isAdminRole(session.user.role)) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const { id: eventId } = await params;
    const body = await req.json();
    const { spells } = body;

    if (!Array.isArray(spells)) {
      return new NextResponse("Invalid spells data", { status: 400 });
    }

    // Check if event exists
    const event = await db.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return new NextResponse("Event not found", { status: 404 });
    }

    // Update event with spells - store the entire array with quantity info
    const eventData = writeEventCollection(event.data, "spells", spells);

    await db.event.update({
      where: { id: eventId },
      data: {
        data: eventData as Prisma.InputJsonValue,
      },
    });

    return NextResponse.json({ success: true });
  } catch {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
