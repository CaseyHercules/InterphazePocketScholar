import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { EventDisplay } from "@/components/EventDisplay";
import { PenSquare, ArrowLeft } from "lucide-react";

interface EventPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: EventPageProps) {
  const event = await db.event.findUnique({
    where: { id: params.id },
    select: { title: true },
  });

  return {
    title: event ? `${event.title} | Admin` : "Event Details",
    description: "Event administration view",
  };
}

export default async function EventPage({ params }: EventPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin");
  }

  if (session.user.role !== "ADMIN" && session.user.role !== "SUPERADMIN") {
    redirect("/unauthorized");
  }

  // Fetch the event
  const event = await db.event.findUnique({
    where: {
      id: params.id,
    },
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

  return (
    <div className="container px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Event Details</h1>
          <p className="text-muted-foreground mt-1">
            View and manage event information
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" asChild>
            <Link href="/admin/events">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Events
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href={`/admin/events/${params.id}/edit`}>
              <PenSquare className="h-4 w-4 mr-1" />
              Edit Event
            </Link>
          </Button>
        </div>
      </div>

      <EventDisplay event={eventWithCount} isAdmin={true} />

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Event Statistics</h2>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm text-muted-foreground">Registrations</dt>
              <dd className="text-2xl font-bold">{registrationCount}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Status</dt>
              <dd className="text-xl font-semibold">{event.status}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Created</dt>
              <dd className="text-sm">
                {new Date(event.createdAt).toLocaleDateString()}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Last Updated</dt>
              <dd className="text-sm">
                {new Date(event.updatedAt).toLocaleDateString()}
              </dd>
            </div>
          </dl>
        </div>

        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <Button className="w-full justify-start" size="sm" asChild>
              <Link href={`/admin/events/${params.id}/edit`}>
                <PenSquare className="h-4 w-4 mr-2" />
                Edit Event Details
              </Link>
            </Button>
            <Button className="w-full justify-start" size="sm" asChild>
              <Link href={`/events/${params.id}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                View Public Page
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
