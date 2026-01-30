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

    // Check if event exists - without including registrations to avoid schema issues
    const event = await db.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return new NextResponse("Event not found", { status: 404 });
    }

    // Get registration count separately
    const registrationCount = await db.eventRegistration.count({
      where: { eventId },
    });

    // Add registration count to event
    const eventWithRegistrationCount = {
      ...event,
      registrationCount,
    };

    // Limit access to detailed data to admins only
    const isAdmin = ["ADMIN", "SUPERADMIN"].includes(session.user.role);

    // If the user is not an admin, only return public event details
    if (!isAdmin) {
      const { data: _data, ...publicEvent } = eventWithRegistrationCount;
      return NextResponse.json(publicEvent);
    }

    // Return full event data to admins
    return NextResponse.json(eventWithRegistrationCount);
  } catch {
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PUT(req: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Only admins can update events
    if (!["ADMIN", "SUPERADMIN"].includes(session.user.role)) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const eventId = params.id;
    const body = await req.json();

    // Check if event exists
    const eventExists = await db.event.findUnique({
      where: { id: eventId },
    });

    if (!eventExists) {
      return new NextResponse("Event not found", { status: 404 });
    }

    // Update event
    const updatedEvent = await db.event.update({
      where: { id: eventId },
      data: body,
    });

    return NextResponse.json(updatedEvent);
  } catch {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
