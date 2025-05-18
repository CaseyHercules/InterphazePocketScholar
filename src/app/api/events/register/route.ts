import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { EventRegistrationValidator } from "@/lib/validators/event";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const validatedData = EventRegistrationValidator.parse(body);
    const { eventId, attendees, promoCode } = validatedData;

    // Get the event and current registration count
    const event = await db.event.findFirst({
      where: { id: eventId },
      include: {
        registrations: {
          include: {
            attendees: true,
          },
        },
      },
    });

    if (!event) {
      return new Response("Event not found", { status: 404 });
    }

    // Calculate total attendees and check capacity
    const currentAttendees = event.registrations.reduce(
      (sum, reg) => sum + reg.attendees.length,
      0
    );
    const newAttendeesCount = attendees.length;

    // Check if adding these attendees would exceed capacity
    if (
      event.capacity &&
      currentAttendees + newAttendeesCount > event.capacity
    ) {
      return new Response("Event capacity would be exceeded", { status: 400 });
    }

    // If a promo code was provided, validate it
    let appliedDiscount = 0;
    if (promoCode && event.price) {
      const promoCodeRecord = await db.promoCode.findFirst({
        where: {
          code: promoCode,
          eventId: event.id,
          validFrom: { lte: new Date() },
          OR: [{ validUntil: null }, { validUntil: { gt: new Date() } }],
        },
      });

      if (!promoCodeRecord) {
        return new Response("Invalid or expired promo code", { status: 400 });
      }

      if (
        promoCodeRecord.maxUses &&
        promoCodeRecord.usedCount >= promoCodeRecord.maxUses
      ) {
        return new Response("Promo code has reached maximum uses", {
          status: 400,
        });
      }

      // Calculate discount
      appliedDiscount = promoCodeRecord.isPercentage
        ? (event.price * promoCodeRecord.discount) / 100
        : promoCodeRecord.discount;

      // Update promo code usage
      await db.promoCode.update({
        where: { id: promoCodeRecord.id },
        data: { usedCount: { increment: 1 } },
      });
    }

    // Calculate total amount
    const baseAmount = event.price ? event.price * attendees.length : 0;
    const totalAmount = Math.max(0, baseAmount - appliedDiscount);

    // Create registration with attendees
    const registration = await db.eventRegistration.create({
      data: {
        eventId,
        userId: session.user.id,
        status: "REGISTERED",
        promoCode: promoCode,
        totalAmount,
        attendees: {
          create: attendees,
        },
      },
      include: {
        event: true,
        attendees: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return new Response(JSON.stringify(registration));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 422 });
    }

    return new Response(
      "Could not register for this event at this time. Please try again later.",
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return new Response("Event ID is required", { status: 400 });
    }

    const registrations = await db.eventRegistration.findMany({
      where: {
        eventId,
        userId: session.user.id,
      },
      include: {
        event: true,
        attendees: true,
      },
    });

    return new Response(JSON.stringify(registrations));
  } catch (error) {
    return new Response("Could not fetch registration status", { status: 500 });
  }
}
