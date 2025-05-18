import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { z } from "zod";

// Validate the payment request
const PaymentRequestValidator = z.object({
  eventId: z.string(),
  registrationId: z.string(),
});

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { eventId, registrationId } = PaymentRequestValidator.parse(body);

    // Get the event and registration details
    const registration = await db.eventRegistration.findFirst({
      where: {
        id: registrationId,
        eventId,
        userId: session.user.id,
      },
      include: {
        event: true,
        attendees: true,
      },
    });

    if (!registration) {
      return new Response("Registration not found", { status: 404 });
    }

    if (!registration.totalAmount) {
      return new Response("No payment required", { status: 400 });
    }

    // Create a Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(registration.totalAmount * 100), // Convert to cents
      currency: "usd",
      metadata: {
        eventId,
        registrationId,
        userId: session.user.id,
      },
    });

    // Update registration with payment intent ID
    await db.eventRegistration.update({
      where: { id: registrationId },
      data: {
        stripePaymentId: paymentIntent.id,
      },
    });

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
      })
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 422 });
    }

    console.error("Payment error:", error);
    return new Response(
      "Could not process payment at this time. Please try again later.",
      { status: 500 }
    );
  }
}

// Webhook handler for Stripe events
export async function POST_webhook(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object;
        // Update registration status
        await db.eventRegistration.update({
          where: { stripePaymentId: paymentIntent.id },
          data: {
            status: "REGISTERED",
          },
        });
        break;

      case "payment_intent.payment_failed":
        // Handle failed payment
        const failedPayment = event.data.object;
        await db.eventRegistration.update({
          where: { stripePaymentId: failedPayment.id },
          data: {
            status: "CANCELLED",
          },
        });
        break;
    }

    return new Response(null, { status: 200 });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response(
      `Webhook Error: ${err instanceof Error ? err.message : "Unknown Error"}`,
      { status: 400 }
    );
  }
}
