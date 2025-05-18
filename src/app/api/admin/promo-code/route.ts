import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { CreatePromoCodeValidator } from "@/lib/validators/event";
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
    const validatedData = CreatePromoCodeValidator.parse(body);

    // Check if code already exists
    const existingCode = await db.promoCode.findUnique({
      where: { code: validatedData.code },
    });

    if (existingCode) {
      return new Response("Promo code already exists", { status: 400 });
    }

    // Create promo code
    const promoCode = await db.promoCode.create({
      data: validatedData,
    });

    return new Response(JSON.stringify(promoCode));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 422 });
    }

    return new Response(
      "Could not create promo code at this time. Please try again later.",
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

    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return new Response("Event ID is required", { status: 400 });
    }

    const promoCodes = await db.promoCode.findMany({
      where: { eventId },
      orderBy: { createdAt: "desc" },
    });

    return new Response(JSON.stringify(promoCodes));
  } catch (error) {
    return new Response("Could not fetch promo codes", { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getAuthSession();

    if (
      !session?.user ||
      (session.user.role !== Role.ADMIN &&
        session.user.role !== Role.SUPERADMIN)
    ) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return new Response("Promo code ID is required", { status: 400 });
    }

    await db.promoCode.delete({
      where: { id },
    });

    return new Response(null, { status: 204 });
  } catch (error) {
    return new Response("Could not delete promo code", { status: 500 });
  }
}
