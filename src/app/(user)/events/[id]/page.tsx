import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { EventDisplay } from "@/components/EventDisplay";
import { EventRegistrationSection } from "./components/EventRegistrationSection";
import { SignInPrompt } from "./components/SignInPrompt";

interface EventPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: EventPageProps) {
  const { id } = await params;
  const event = await db.event.findUnique({
    where: { id },
    select: { title: true },
  });

  return {
    title: event ? `${event.title} | Events` : "Event Details",
    description: "Event details and registration",
  };
}

export default async function EventPage({ params }: EventPageProps) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const isAdmin =
    session?.user?.role === "ADMIN" || session?.user?.role === "SUPERADMIN";

  const event = await db.event.findUnique({
    where: { id },
  });

  if (!event) {
    notFound();
  }

  // Get registration count
  const registrationCount = await db.eventRegistration.count({
    where: { eventId: event.id },
  });

  // Add registration count to event and process FAQ data
  const eventWithCount = {
    ...event,
    _count: {
      registrations: registrationCount,
    },
    // Extract FAQs from data field if present
    faqs:
      event.data && typeof event.data === "object"
        ? (event.data as any).faqs || []
        : [],
  };

  // If event is not published and user is not admin, don't show it
  if (eventWithCount.status !== "PUBLISHED" && !isAdmin) {
    notFound();
  }

  // Check if the current user is already registered
  let isRegistered = false;
  if (session?.user) {
    const registration = await db.eventRegistration.findFirst({
      where: {
        eventId: eventWithCount.id,
        userId: session.user.id,
      },
    });
    isRegistered = !!registration;
  }

  // Fetch user's characters if logged in
  const characters = session?.user
    ? await db.character.findMany({
        where: {
          userId: session.user.id,
        },
        select: {
          id: true,
          name: true,
          primaryClass: {
            select: {
              Title: true,
            },
          },
        },
        orderBy: {
          name: "asc",
        },
      })
    : [];

  return (
    <div className="container max-w-5xl mx-auto py-8">
      <EventDisplay
        event={{
          ...eventWithCount,
          isRegistered,
        }}
        isAdmin={isAdmin}
      />

      {session?.user ? (
        <EventRegistrationSection
          eventId={eventWithCount.id}
          isRegistered={isRegistered}
          characters={characters}
          hasCharacters={characters.length > 0}
        />
      ) : (
        <SignInPrompt eventId={eventWithCount.id} />
      )}
    </div>
  );
}
