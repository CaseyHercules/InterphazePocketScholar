import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
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
    const eventItems = readEventCollection<{ itemId?: string; quantity?: number }>(
      event.data,
      "items"
    );
    const itemIds = eventItems
      .map((entry) => entry.itemId)
      .filter((id): id is string => typeof id === "string" && id.length > 0);
    const uniqueIds = [...new Set(itemIds)];
    const foundItems = await db.item.findMany({
      where: { id: { in: uniqueIds } },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
      },
    });
    const itemById = new Map(foundItems.map((item) => [item.id, item]));
    const items = eventItems
      .map((eventItem) => {
        if (!eventItem.itemId) return null;
        const item = itemById.get(eventItem.itemId);
        if (!item) return null;
        return {
          id: item.id,
          title: item.title,
          description: item.description,
          type: item.type,
          quantity: eventItem.quantity || 1,
        };
      })
      .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

    return NextResponse.json(items);
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
    const { items } = body;

    if (!Array.isArray(items)) {
      return new NextResponse("Invalid items data", { status: 400 });
    }

    // Check if event exists
    const event = await db.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return new NextResponse("Event not found", { status: 404 });
    }

    // Update event with items
    const eventData = writeEventCollection(event.data, "items", items);

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
