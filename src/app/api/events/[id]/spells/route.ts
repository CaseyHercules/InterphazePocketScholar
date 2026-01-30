import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";

interface Params {
  params: {
    id: string;
  };
}

export async function GET(req: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const eventId = params.id;

    // Check if event exists
    const event = await db.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return new NextResponse("Event not found", { status: 404 });
    }

    // Get event data
    const eventData = (event.data as Record<string, any>) || {};

    // Extract spells from event data - handle both old and new format
    const eventSpells = eventData.spells || [];

    // Get spell details for the event spells
    const spells = [];

    for (const spellEntry of eventSpells) {
      // Handle both formats: string IDs and {id, quantity} objects
      const spellId =
        typeof spellEntry === "string" ? spellEntry : spellEntry.id;
      const quantity =
        typeof spellEntry === "string" ? 1 : spellEntry.quantity || 1;

      if (spellId) {
        const spell = await db.spell.findUnique({
          where: { id: spellId },
          select: {
            id: true,
            title: true,
            description: true,
            level: true,
            type: true,
            data: true,
          },
        });

        if (spell) {
          // Try to extract class from data or type
          let spellClass = undefined;
          if (spell.data && typeof spell.data === "object") {
            try {
              const data = spell.data as any;
              if (data.class) {
                spellClass = data.class;
              }
            } catch (e) {
              console.error("Error parsing spell data", e);
            }
          }
          // Fallback to type field if class not found in data
          if (!spellClass && spell.type) {
            spellClass = spell.type;
          }

          spells.push({
            id: spell.id,
            name: spell.title,
            description: spell.description || "",
            level: spell.level,
            class: spellClass,
            quantity: quantity,
          });
        }
      }
    }

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
    if (!["ADMIN", "SUPERADMIN"].includes(session.user.role)) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const eventId = params.id;
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
    const eventData = (event.data as Record<string, any>) || {};
    eventData.spells = spells;

    await db.event.update({
      where: { id: eventId },
      data: {
        data: eventData,
      },
    });

    return NextResponse.json({ success: true });
  } catch {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
