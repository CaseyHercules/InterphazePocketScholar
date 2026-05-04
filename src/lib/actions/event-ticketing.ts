"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getStripeClient } from "@/lib/stripe";
import { requireAdminUser, requireSuperAdminUser } from "@/lib/api-auth";
import {
  sendAdminAssignedRegistration,
  sendRefundNotice,
} from "@/lib/email";

const ticketTypeSchema = z.object({
  eventId: z.string().min(1),
  title: z.string().min(1).max(120),
  slug: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[a-z0-9_-]+$/),
  description: z.string().max(500).optional(),
  amountCents: z.number().int().min(0),
  sortOrder: z.number().int().min(0).default(0),
  capacity: z.number().int().positive().optional(),
});

const promoCodeSchema = z.object({
  eventId: z.string().min(1),
  code: z.string().trim().min(3).max(32),
  discount: z.number().positive(),
  isPercentage: z.boolean().default(true),
  maxUses: z.number().int().positive().optional(),
  validUntil: z.string().optional(),
});

const assignRegistrationSchema = z.object({
  eventId: z.string().min(1),
  userEmail: z.string().email(),
  ticketTypeId: z.string().optional(),
  discountAmountCents: z.number().int().min(0).optional(),
});

const refundSchema = z.object({
  registrationId: z.string().min(1),
  reason: z.string().trim().min(3).max(300).optional(),
});

export async function upsertEventTicketType(input: z.infer<typeof ticketTypeSchema>) {
  const admin = await requireAdminUser();
  if (!admin) {
    throw new Error("Unauthorized");
  }

  const parsed = ticketTypeSchema.parse(input);
  const stripe = getStripeClient();

  const product = await stripe.products.create({
    name: parsed.title,
    description: parsed.description || undefined,
    metadata: { eventId: parsed.eventId, slug: parsed.slug },
  });

  const price = await stripe.prices.create({
    currency: "usd",
    unit_amount: parsed.amountCents,
    product: product.id,
  });

  const ticket = await db.eventTicketType.upsert({
    where: {
      eventId_slug: {
        eventId: parsed.eventId,
        slug: parsed.slug,
      },
    },
    create: {
      eventId: parsed.eventId,
      slug: parsed.slug,
      title: parsed.title,
      description: parsed.description || null,
      amountCents: parsed.amountCents,
      sortOrder: parsed.sortOrder,
      capacity: parsed.capacity || null,
      stripeProductId: product.id,
      stripePriceId: price.id,
      metadata: null,
    },
    update: {
      title: parsed.title,
      description: parsed.description || null,
      amountCents: parsed.amountCents,
      sortOrder: parsed.sortOrder,
      capacity: parsed.capacity || null,
      stripeProductId: product.id,
      stripePriceId: price.id,
      updatedAt: new Date(),
    },
  });

  revalidatePath(`/admin/events/${parsed.eventId}`);
  revalidatePath(`/events/${parsed.eventId}`);
  return ticket;
}

export async function createEventPromoCode(input: z.infer<typeof promoCodeSchema>) {
  const admin = await requireAdminUser();
  if (!admin) {
    throw new Error("Unauthorized");
  }

  const parsed = promoCodeSchema.parse(input);
  const promoCode = await db.promoCode.create({
    data: {
      id: crypto.randomUUID(),
      eventId: parsed.eventId,
      code: parsed.code.toUpperCase(),
      discount: parsed.discount,
      isPercentage: parsed.isPercentage,
      maxUses: parsed.maxUses ?? null,
      validUntil: parsed.validUntil ? new Date(parsed.validUntil) : null,
      updatedAt: new Date(),
    },
  });

  revalidatePath(`/admin/events/${parsed.eventId}`);
  return promoCode;
}

export async function assignUserToEvent(input: z.infer<typeof assignRegistrationSchema>) {
  const admin = await requireAdminUser();
  if (!admin) {
    throw new Error("Unauthorized");
  }

  const parsed = assignRegistrationSchema.parse(input);
  const event = await db.event.findUnique({
    where: { id: parsed.eventId },
    select: { id: true, title: true },
  });
  if (!event) throw new Error("Event not found");

  const user = await db.user.findUnique({
    where: { email: parsed.userEmail.toLowerCase() },
    select: { id: true, email: true },
  });
  if (!user) throw new Error("User not found");

  const ticketType = parsed.ticketTypeId
    ? await db.eventTicketType.findFirst({
        where: { id: parsed.ticketTypeId, eventId: parsed.eventId },
      })
    : null;

  const existing = await db.eventRegistration.findFirst({
    where: { eventId: parsed.eventId, userId: user.id },
    select: { id: true },
  });
  if (existing) throw new Error("User is already assigned to this event");

  const amountCents = Math.max(
    0,
    (ticketType?.amountCents ?? 0) - (parsed.discountAmountCents ?? 0)
  );

  const registration = await db.eventRegistration.create({
    data: {
      id: crypto.randomUUID(),
      eventId: parsed.eventId,
      userId: user.id,
      ticketTypeId: ticketType?.id,
      status: "REGISTERED",
      totalAmount: amountCents / 100,
      amountPaidCents: amountCents,
      discountAmountCents: parsed.discountAmountCents ?? 0,
      currency: "usd",
      updatedAt: new Date(),
    },
  });

  if (user.email) {
    await sendAdminAssignedRegistration({
      to: user.email,
      eventTitle: event.title,
      ticketTitle: ticketType?.title || "Admin assignment",
      amountLabel: `$${(amountCents / 100).toFixed(2)}`,
      manageUrl: `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/events/registration`,
    });
  }

  revalidatePath(`/admin/events/${parsed.eventId}`);
  return registration;
}

export async function refundRegistration(input: z.infer<typeof refundSchema>) {
  const superAdmin = await requireSuperAdminUser();
  if (!superAdmin) {
    throw new Error("Only super admins can process refunds");
  }

  const parsed = refundSchema.parse(input);
  const registration = await db.eventRegistration.findUnique({
    where: { id: parsed.registrationId },
    include: {
      event: { select: { id: true, title: true } },
      user: { select: { email: true } },
    },
  });
  if (!registration) throw new Error("Registration not found");
  if (!registration.stripePaymentIntentId) {
    throw new Error("No Stripe payment is attached to this registration");
  }

  const stripe = getStripeClient();
  const refund = await stripe.refunds.create({
    payment_intent: registration.stripePaymentIntentId,
    reason: "requested_by_customer",
    metadata: {
      registrationId: registration.id,
      eventId: registration.eventId,
      reason: parsed.reason ?? "n/a",
      requestedBy: superAdmin.id,
    },
  });

  await db.eventRegistration.update({
    where: { id: registration.id },
    data: {
      status: "CANCELLED",
      updatedAt: new Date(),
    },
  });

  if (registration.user.email) {
    await sendRefundNotice({
      to: registration.user.email,
      eventTitle: registration.event.title,
      refundLabel: `$${((refund.amount ?? 0) / 100).toFixed(2)}`,
    });
  }

  revalidatePath(`/admin/events/${registration.event.id}`);
  revalidatePath(`/events/registration`);
  return refund;
}

export async function seedMiniphazeTicketTypes(eventId: string) {
  const admin = await requireAdminUser();
  if (!admin) {
    throw new Error("Unauthorized");
  }

  const event = await db.event.findUnique({
    where: { id: eventId },
    select: { id: true },
  });
  if (!event) {
    throw new Error("Event not found");
  }

  const defaults = [
    {
      title: "Miniphaze Player Registration",
      slug: "miniphaze-player",
      amountCents: 6000,
      sortOrder: 0,
    },
    {
      title: "Miniphaze NPC / Chaperone",
      slug: "miniphaze-npc-chaperone",
      amountCents: 2500,
      sortOrder: 1,
    },
    {
      title: "Miniphaze Youth 8-17",
      slug: "miniphaze-youth-8-17",
      amountCents: 4000,
      sortOrder: 2,
    },
    {
      title: "Miniphaze Youth 3 pack",
      slug: "miniphaze-youth-3-pack",
      amountCents: 8000,
      sortOrder: 3,
    },
  ];

  for (const ticket of defaults) {
    await upsertEventTicketType({
      eventId,
      title: ticket.title,
      slug: ticket.slug,
      amountCents: ticket.amountCents,
      sortOrder: ticket.sortOrder,
    });
  }

  revalidatePath(`/admin/events/${eventId}`);
}
