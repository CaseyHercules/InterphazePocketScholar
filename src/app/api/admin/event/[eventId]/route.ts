import { db } from "@/lib/db";
import {
  withAdminAuth,
  validateResourceOwnership,
  type ApiResponse,
} from "@/lib/api-utils";

export async function GET(
  req: Request,
  { params }: { params: { eventId: string } }
) {
  return withAdminAuth<any>(async () => {
    const { resource: event, error } = await validateResourceOwnership(
      () =>
        db.event.findUnique({
          where: { id: params.eventId },
          include: {
            faqs: true,
            registrations: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
                attendees: true,
              },
            },
            promoCodes: true,
          },
        }),
      "Event not found"
    );

    if (error) {
      return { error, status: 404 };
    }

    return { data: event, status: 200 };
  });
}

export async function DELETE(
  req: Request,
  { params }: { params: { eventId: string } }
) {
  return withAdminAuth<void>(async () => {
    // Check if event exists with registrations
    const { resource: event, error } = await validateResourceOwnership(
      () =>
        db.event.findUnique({
          where: { id: params.eventId },
          include: { registrations: true },
        }),
      "Event not found"
    );

    if (error) {
      return { error, status: 404 };
    }

    if (!event) {
      return { error: "Event not found", status: 404 };
    }

    // If event has registrations, don't allow deletion
    if (event.registrations.length > 0) {
      return {
        error: "Cannot delete event with existing registrations",
        status: 400,
      };
    }

    // Delete event and related data
    await db.$transaction([
      db.eventFAQ.deleteMany({
        where: { eventId: params.eventId },
      }),
      db.promoCode.deleteMany({
        where: { eventId: params.eventId },
      }),
      db.event.delete({
        where: { id: params.eventId },
      }),
    ]);

    return { status: 204 };
  });
}
