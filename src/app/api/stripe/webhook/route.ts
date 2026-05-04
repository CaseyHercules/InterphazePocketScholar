import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { db } from "@/lib/db";
import { sendTicketConfirmation } from "@/lib/email";
import { getAppBaseUrl, getStripeClient, getStripeWebhookSecret } from "@/lib/stripe";

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const metadata = session.metadata ?? {};
  const eventId = metadata.eventId;
  const userId = metadata.userId;
  const ticketTypeId = metadata.ticketTypeId;
  const promoCodeId = metadata.promoCodeId || null;
  const promoCode = metadata.promoCode || null;
  const discountAmountCents = Number(metadata.discountAmountCents || 0);
  const characterId = metadata.characterId || null;

  if (!eventId || !userId || !ticketTypeId || !session.id) return;

  const existing = await db.eventRegistration.findFirst({
    where: {
      OR: [
        { stripeCheckoutSessionId: session.id },
        { eventId, userId },
      ],
    },
    select: { id: true },
  });
  if (existing) return;

  const ticketType = await db.eventTicketType.findUnique({
    where: { id: ticketTypeId },
    include: { event: true },
  });
  if (!ticketType) return;

  const amountTotal = session.amount_total ?? ticketType.amountCents;

  await db.eventRegistration.create({
    data: {
      id: crypto.randomUUID(),
      eventId,
      userId,
      ticketTypeId,
      status: "REGISTERED",
      promoCode,
      promoCodeId,
      stripeCheckoutSessionId: session.id,
      stripePaymentIntentId:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : null,
      amountPaidCents: amountTotal,
      totalAmount: amountTotal / 100,
      discountAmountCents,
      currency: session.currency ?? "usd",
      updatedAt: new Date(),
    },
  });

  if (promoCodeId) {
    await db.promoCode.update({
      where: { id: promoCodeId },
      data: { usedCount: { increment: 1 }, updatedAt: new Date() },
    });
  }

  if (characterId) {
    const character = await db.character.findFirst({
      where: { id: characterId, userId },
      select: { id: true },
    });
    if (character) {
      await db.character.update({
        where: { id: character.id },
        data: {
          events: {
            connect: {
              id: eventId,
            },
          },
        },
      });
    }
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });

  if (user?.email) {
    await sendTicketConfirmation({
      to: user.email,
      eventTitle: ticketType.event.title,
      ticketTitle: ticketType.title,
      amountLabel: `$${(amountTotal / 100).toFixed(2)}`,
      manageUrl: `${getAppBaseUrl()}/events/registration`,
    });
  }
}

export async function POST(req: Request) {
  try {
    const stripe = getStripeClient();
    const signature = (await headers()).get("stripe-signature");
    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    const body = await req.text();
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      getStripeWebhookSecret()
    );

    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        if (charge.payment_intent && typeof charge.payment_intent === "string") {
          await db.eventRegistration.updateMany({
            where: { stripePaymentIntentId: charge.payment_intent },
            data: { status: "CANCELLED", updatedAt: new Date() },
          });
        }
        break;
      }
      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook error:", error);
    return NextResponse.json({ error: "Webhook error" }, { status: 400 });
  }
}
