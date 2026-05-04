import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getAppBaseUrl, getStripeClient } from "@/lib/stripe";
import { sendTicketConfirmation } from "@/lib/email";

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: eventId } = await params;
    const body = (await req.json()) as {
      ticketTypeId?: string;
      promoCode?: string;
      characterId?: string;
      answers?: unknown;
    };

    const event = await db.event.findUnique({
      where: { id: eventId },
      include: { ticketTypes: true },
    });
    if (!event || event.status !== "PUBLISHED") {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const existingRegistration = await db.eventRegistration.findFirst({
      where: { eventId, userId: session.user.id },
      select: { id: true },
    });
    if (existingRegistration) {
      return NextResponse.json(
        { error: "You are already registered for this event." },
        { status: 400 }
      );
    }

    const ticketType = body.ticketTypeId
      ? event.ticketTypes.find((ticket) => ticket.id === body.ticketTypeId)
      : event.ticketTypes[0];
    if (!ticketType) {
      return NextResponse.json(
        { error: "No ticket type is configured for this event." },
        { status: 400 }
      );
    }

    let discountAmountCents = 0;
    let promoCodeId: string | null = null;
    let promoCodeValue: string | null = null;

    if (body.promoCode) {
      const code = body.promoCode.trim().toUpperCase();
      const promo = await db.promoCode.findFirst({
        where: {
          eventId,
          code,
          validFrom: { lte: new Date() },
          OR: [{ validUntil: null }, { validUntil: { gte: new Date() } }],
        },
      });

      if (!promo) {
        return NextResponse.json({ error: "Invalid promo code." }, { status: 400 });
      }
      if (promo.maxUses !== null && promo.usedCount >= promo.maxUses) {
        return NextResponse.json(
          { error: "This promo code has reached its usage limit." },
          { status: 400 }
        );
      }

      promoCodeId = promo.id;
      promoCodeValue = promo.code;
      discountAmountCents = promo.isPercentage
        ? Math.floor((ticketType.amountCents * promo.discount) / 100)
        : Math.floor(promo.discount * 100);
    }

    const amountCents = Math.max(0, ticketType.amountCents - discountAmountCents);
    const baseUrl = getAppBaseUrl();

    if (amountCents === 0) {
      const registration = await db.eventRegistration.create({
        data: {
          id: crypto.randomUUID(),
          eventId,
          userId: session.user.id,
          ticketTypeId: ticketType.id,
          status: "REGISTERED",
          promoCode: promoCodeValue,
          promoCodeId,
          totalAmount: 0,
          amountPaidCents: 0,
          discountAmountCents,
          currency: "usd",
          answers:
            body.answers && typeof body.answers === "object" ? body.answers : null,
          updatedAt: new Date(),
        },
      });

      if (promoCodeId) {
        await db.promoCode.update({
          where: { id: promoCodeId },
          data: { usedCount: { increment: 1 }, updatedAt: new Date() },
        });
      }

      if (session.user.email) {
        await sendTicketConfirmation({
          to: session.user.email,
          eventTitle: event.title,
          ticketTitle: ticketType.title,
          amountLabel: "$0.00",
          manageUrl: `${baseUrl}/events/registration`,
        });
      }

      return NextResponse.json({
        success: true,
        registrationId: registration.id,
        mode: "free",
      });
    }

    const stripe = getStripeClient();
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: `${baseUrl}/events/${eventId}?checkout=success`,
      cancel_url: `${baseUrl}/events/${eventId}?checkout=cancelled`,
      line_items: [
        {
          price: ticketType.stripePriceId ?? undefined,
          quantity: 1,
          ...(ticketType.stripePriceId
            ? {}
            : {
                price_data: {
                  currency: "usd",
                  unit_amount: amountCents,
                  product_data: {
                    name: `${event.title} - ${ticketType.title}`,
                  },
                },
              }),
        },
      ],
      metadata: {
        eventId,
        userId: session.user.id,
        ticketTypeId: ticketType.id,
        promoCodeId: promoCodeId ?? "",
        promoCode: promoCodeValue ?? "",
        discountAmountCents: String(discountAmountCents),
        characterId: body.characterId ?? "",
      },
    });

    return NextResponse.json({
      success: true,
      checkoutUrl: checkoutSession.url,
      mode: "stripe",
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json({ error: "Failed to start checkout." }, { status: 500 });
  }
}
