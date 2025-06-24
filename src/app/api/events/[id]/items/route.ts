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

    // Extract items from event data
    const eventItems = eventData.items || [];

    // Get item details for the event items
    const items = [];

    for (const eventItem of eventItems) {
      if (eventItem.itemId) {
        const item = await db.item.findUnique({
          where: { id: eventItem.itemId },
          select: {
            id: true,
            title: true,
            description: true,
            type: true,
          },
        });

        if (item) {
          items.push({
            id: item.id,
            title: item.title,
            description: item.description,
            type: item.type,
            quantity: eventItem.quantity || 1,
          });
        }
      }
    }

    return NextResponse.json(items);
  } catch (error) {
    console.error("[EVENT_ITEMS_GET]", error);
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
    const eventData = (event.data as Record<string, any>) || {};
    eventData.items = items;

    await db.event.update({
      where: { id: eventId },
      data: {
        data: eventData,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[EVENT_ITEMS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
