import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  CreateEventValidator,
  UpdateEventValidator,
} from "@/lib/validators/event";
import { Role } from "@prisma/client";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();

    if (
      !session?.user ||
      (session.user.role !== Role.ADMIN &&
        session.user.role !== Role.SUPERADMIN)
    ) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();

    try {
      if (body.id) {
        // Update existing event
        const validatedData = UpdateEventValidator.parse(body);
        const { id, ...updateData } = validatedData;

        const updated = await db.event.update({
          where: { id },
          data: {
            ...updateData,
            coordinates: updateData.coordinates
              ? JSON.stringify(updateData.coordinates)
              : null,
          },
          include: {
            faqs: true,
          },
        });

        return new Response(JSON.stringify(updated));
      } else {
        // Create new event
        const validatedData = CreateEventValidator.parse(body);

        const created = await db.event.create({
          data: {
            ...validatedData,
            coordinates: validatedData.coordinates
              ? JSON.stringify(validatedData.coordinates)
              : null,
          },
          include: {
            faqs: true,
          },
        });

        return new Response(JSON.stringify(created));
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return new Response(error.message, { status: 422 });
      }
      throw error;
    }
  } catch (error) {
    return new Response(
      "Could not process this event request at this time. Please try again later.",
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await getAuthSession();

    if (
      !session?.user ||
      (session.user.role !== Role.ADMIN &&
        session.user.role !== Role.SUPERADMIN)
    ) {
      return new Response("Unauthorized", { status: 401 });
    }

    const events = await db.event.findMany({
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
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    return new Response(JSON.stringify(events));
  } catch (error) {
    return new Response("Could not fetch events", { status: 500 });
  }
}
