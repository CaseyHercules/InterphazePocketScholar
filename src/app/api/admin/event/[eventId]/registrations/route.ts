import { db } from "@/lib/db";
import {
  withAdminAuth,
  validateRequest,
  validateResourceOwnership,
  getQueryParam,
} from "@/lib/api-utils";
import { z } from "zod";

const UpdateRegistrationStatusValidator = z.object({
  registrationId: z.string(),
  status: z.enum(["REGISTERED", "WAITLIST", "CANCELLED"]),
});

type UpdateRegistrationData = z.infer<typeof UpdateRegistrationStatusValidator>;

export async function GET(
  req: Request,
  { params }: { params: { eventId: string } }
) {
  return withAdminAuth<any>(async () => {
    const registrations = await db.eventRegistration.findMany({
      where: { eventId: params.eventId },
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return { data: registrations, status: 200 };
  });
}

export async function PUT(
  req: Request,
  { params }: { params: { eventId: string } }
) {
  return withAdminAuth<any>(async () => {
    const { data, error } = await validateRequest<UpdateRegistrationData>(
      req,
      UpdateRegistrationStatusValidator
    );
    if (error) {
      return { error, status: 422 };
    }

    if (!data) {
      return { error: "Invalid request data", status: 422 };
    }

    const { registrationId, status } = data;

    // Verify registration belongs to this event
    const { resource: existingRegistration, error: findError } =
      await validateResourceOwnership(
        () =>
          db.eventRegistration.findFirst({
            where: {
              id: registrationId,
              eventId: params.eventId,
            },
          }),
        "Registration not found"
      );

    if (findError) {
      return { error: findError, status: 404 };
    }

    const updatedRegistration = await db.eventRegistration.update({
      where: { id: registrationId },
      data: { status },
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
    });

    return { data: updatedRegistration, status: 200 };
  });
}

export async function DELETE(
  req: Request,
  { params }: { params: { eventId: string } }
) {
  return withAdminAuth<void>(async () => {
    const registrationId = getQueryParam(req, "id");
    if (!registrationId) {
      return { error: "Registration ID is required", status: 400 };
    }

    // Verify registration belongs to this event
    const { resource: existingRegistration, error: findError } =
      await validateResourceOwnership(
        () =>
          db.eventRegistration.findFirst({
            where: {
              id: registrationId,
              eventId: params.eventId,
            },
          }),
        "Registration not found"
      );

    if (findError) {
      return { error: findError, status: 404 };
    }

    // Delete registration and related attendees
    await db.$transaction([
      db.attendee.deleteMany({
        where: { registrationId },
      }),
      db.eventRegistration.delete({
        where: { id: registrationId },
      }),
    ]);

    return { status: 204 };
  });
}
