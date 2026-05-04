"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  assignUserToEvent,
  createEventPromoCode,
  refundRegistration,
  seedMiniphazeTicketTypes,
  upsertEventTicketType,
} from "@/lib/actions/event-ticketing";
import { toast } from "@/hooks/use-toast";

type TicketType = {
  id: string;
  title: string;
  slug: string;
  amountCents: number;
  sortOrder: number;
  stripePriceId: string | null;
};

type PromoCode = {
  id: string;
  code: string;
  discount: number;
  isPercentage: boolean;
  maxUses: number | null;
  usedCount: number;
};

type Registration = {
  id: string;
  status: string;
  totalAmount: number | null;
  stripePaymentIntentId: string | null;
  user: {
    email: string | null;
    name: string | null;
  };
  ticketType: {
    title: string;
  } | null;
};

interface TicketingAdminPanelProps {
  eventId: string;
  isSuperAdmin: boolean;
  ticketTypes: TicketType[];
  promoCodes: PromoCode[];
  registrations: Registration[];
}

export function TicketingAdminPanel({
  eventId,
  isSuperAdmin,
  ticketTypes,
  promoCodes,
  registrations,
}: TicketingAdminPanelProps) {
  const [isPending, startTransition] = useTransition();
  const [ticketTitle, setTicketTitle] = useState("");
  const [ticketSlug, setTicketSlug] = useState("");
  const [ticketAmount, setTicketAmount] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [promoDiscount, setPromoDiscount] = useState("");
  const [assignEmail, setAssignEmail] = useState("");
  const [assignTicketTypeId, setAssignTicketTypeId] = useState("");
  const [assignDiscount, setAssignDiscount] = useState("0");

  function runAction(action: () => Promise<unknown>, successMessage: string) {
    startTransition(async () => {
      try {
        await action();
        toast({ title: "Saved", description: successMessage });
      } catch (error) {
        toast({
          title: "Action failed",
          description:
            error instanceof Error ? error.message : "Please try again.",
          variant: "destructive",
        });
      }
    });
  }

  return (
    <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Ticket types</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            variant="outline"
            disabled={isPending}
            onClick={() =>
              runAction(
                () => seedMiniphazeTicketTypes(eventId),
                "Miniphaze defaults added."
              )
            }
          >
            Seed Miniphaze defaults
          </Button>
          <div className="space-y-2">
            {ticketTypes.map((ticket) => (
              <div key={ticket.id} className="border rounded p-3 text-sm">
                <div className="font-medium">{ticket.title}</div>
                <div className="text-muted-foreground">
                  {ticket.slug} · ${(ticket.amountCents / 100).toFixed(2)}
                </div>
                {ticket.stripePriceId && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Stripe price: {ticket.stripePriceId}
                  </div>
                )}
              </div>
            ))}
            {ticketTypes.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No ticket types configured yet.
              </p>
            )}
          </div>
          <div className="border-t pt-4 space-y-3">
            <div>
              <Label htmlFor="ticket-title">Title</Label>
              <Input
                id="ticket-title"
                value={ticketTitle}
                onChange={(e) => setTicketTitle(e.target.value)}
                placeholder="Miniphaze Player Registration"
              />
            </div>
            <div>
              <Label htmlFor="ticket-slug">Slug</Label>
              <Input
                id="ticket-slug"
                value={ticketSlug}
                onChange={(e) => setTicketSlug(e.target.value)}
                placeholder="player"
              />
            </div>
            <div>
              <Label htmlFor="ticket-amount">Amount (USD)</Label>
              <Input
                id="ticket-amount"
                value={ticketAmount}
                onChange={(e) => setTicketAmount(e.target.value)}
                placeholder="60.00"
              />
            </div>
            <Button
              disabled={isPending}
              onClick={() =>
                runAction(
                  () =>
                    upsertEventTicketType({
                      eventId,
                      title: ticketTitle,
                      slug: ticketSlug,
                      amountCents: Math.round(Number(ticketAmount || "0") * 100),
                      sortOrder: ticketTypes.length,
                    }),
                  "Ticket type saved."
                )
              }
            >
              Save ticket type
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Promo codes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {promoCodes.map((promo) => (
              <div key={promo.id} className="border rounded p-3 text-sm">
                <div className="font-medium">{promo.code}</div>
                <div className="text-muted-foreground">
                  {promo.isPercentage
                    ? `${promo.discount}% off`
                    : `$${promo.discount.toFixed(2)} off`}{" "}
                  · used {promo.usedCount}
                  {promo.maxUses ? ` / ${promo.maxUses}` : ""}
                </div>
              </div>
            ))}
          </div>
          <div className="border-t pt-4 space-y-3">
            <div>
              <Label htmlFor="promo-code">Code</Label>
              <Input
                id="promo-code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="YOUTH10"
              />
            </div>
            <div>
              <Label htmlFor="promo-discount">Discount (%)</Label>
              <Input
                id="promo-discount"
                value={promoDiscount}
                onChange={(e) => setPromoDiscount(e.target.value)}
                placeholder="10"
              />
            </div>
            <Button
              disabled={isPending}
              onClick={() =>
                runAction(
                  () =>
                    createEventPromoCode({
                      eventId,
                      code: promoCode,
                      discount: Number(promoDiscount || "0"),
                      isPercentage: true,
                    }),
                  "Promo code created."
                )
              }
            >
              Add promo code
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Assign existing user</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label htmlFor="assign-email">User email</Label>
            <Input
              id="assign-email"
              value={assignEmail}
              onChange={(e) => setAssignEmail(e.target.value)}
              placeholder="player@example.com"
            />
          </div>
          <div>
            <Label htmlFor="assign-ticket">Ticket type ID (optional)</Label>
            <Input
              id="assign-ticket"
              value={assignTicketTypeId}
              onChange={(e) => setAssignTicketTypeId(e.target.value)}
              placeholder={ticketTypes[0]?.id || "Paste ticket type id"}
            />
          </div>
          <div>
            <Label htmlFor="assign-discount">Discount (cents)</Label>
            <Input
              id="assign-discount"
              value={assignDiscount}
              onChange={(e) => setAssignDiscount(e.target.value)}
            />
          </div>
          <Button
            disabled={isPending}
            onClick={() =>
              runAction(
                () =>
                  assignUserToEvent({
                    eventId,
                    userEmail: assignEmail,
                    ticketTypeId: assignTicketTypeId || undefined,
                    discountAmountCents: Number(assignDiscount || "0"),
                  }),
                "User assigned to event."
              )
            }
          >
            Assign user
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Registrations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {registrations.map((registration) => (
            <div
              key={registration.id}
              className="border rounded p-3 flex items-center justify-between gap-3"
            >
              <div className="text-sm">
                <div className="font-medium">
                  {registration.user.email || registration.user.name || "Unknown user"}
                </div>
                <div className="text-muted-foreground">
                  {registration.ticketType?.title || "No ticket type"} ·{" "}
                  {registration.status} · $
                  {(registration.totalAmount ?? 0).toFixed(2)}
                </div>
              </div>
              {isSuperAdmin && registration.stripePaymentIntentId && (
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={isPending}
                  onClick={() =>
                    runAction(
                      () =>
                        refundRegistration({
                          registrationId: registration.id,
                          reason: "Admin-initiated refund",
                        }),
                      "Refund processed."
                    )
                  }
                >
                  Refund
                </Button>
              )}
            </div>
          ))}
          {registrations.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No registrations yet.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
