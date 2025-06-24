import { Suspense } from "react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CalendarIcon, MapPinIcon, UsersIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { EventStatus } from "@prisma/client";

export const metadata = {
  title: "Events | Interphaze Pocket Scholar",
  description: "Browse upcoming events and game sessions",
};

async function getEvents() {
  try {
    console.log("Fetching events...");
    const now = new Date();
    console.log("Current time:", now.toISOString());

    // First, let's check if there are any events at all
    const allEvents = await db.event.findMany();
    console.log("Total events in database:", allEvents.length);
    if (allEvents.length > 0) {
      console.log("Sample event:", {
        id: allEvents[0].id,
        title: allEvents[0].title,
        status: allEvents[0].status,
        date: allEvents[0].date,
      });
    }

    // Get all published future events
    const events = await db.event.findMany({
      where: {
        status: "PUBLISHED",
        date: {
          gt: now,
        },
      },
      orderBy: {
        date: "asc",
      },
      include: {
        _count: {
          select: {
            registrations: true,
          },
        },
      },
    });

    console.log("Found published future events:", events.length);
    if (events.length > 0) {
      console.log("First event date:", events[0].date);
      console.log("First event status:", events[0].status);
    }

    return events;
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
  }
}

export default async function EventsPage() {
  const session = await getServerSession(authOptions);
  const isAdmin =
    session?.user?.role === "ADMIN" || session?.user?.role === "SUPERADMIN";

  return (
    <div className="container max-w-7xl mx-auto py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Upcoming Events</h1>
          <p className="text-muted-foreground mt-1">
            Browse and register for upcoming game sessions and events
          </p>
        </div>

        {isAdmin && (
          <div className="mt-4 sm:mt-0">
            <Button asChild>
              <Link href="/admin/events/create">Create Event</Link>
            </Button>
          </div>
        )}
      </div>

      <Suspense fallback={<div>Loading events...</div>}>
        <EventsList />
      </Suspense>
    </div>
  );
}

async function EventsList() {
  const events = await getEvents();

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium mb-2">No upcoming events</h3>
        <p className="text-muted-foreground mb-6">
          Check back soon for new events and game sessions.
        </p>
      </div>
    );
  }

  return (
    <div className="">
      {events.map((event) => {
        // Extract synopsis from event data
        const synopsis =
          event.data && typeof event.data === "object"
            ? (event.data as any).synopsis
            : null;

        return (
          <Card
            key={event.id}
            className="flex flex-col hover:shadow-md transition-shadow"
          >
            <CardHeader>
              <CardTitle className="text-xl line-clamp-2">
                {event.title}
              </CardTitle>
              <CardDescription className="flex items-center">
                <CalendarIcon className="h-4 w-4 mr-1" />
                {formatDate(event.date)}
              </CardDescription>
            </CardHeader>

            <CardContent className="flex-grow">
              <div className="space-y-2">
                {event.location && (
                  <div className="flex items-start">
                    <MapPinIcon className="h-4 w-4 mr-2 mt-1" />
                    <div>
                      <p className="font-medium">{event.location}</p>
                      {event.address && (
                        <p className="text-xs text-muted-foreground">
                          {event.address}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {event.capacity && (
                  <div className="flex items-center">
                    <UsersIcon className="h-4 w-4 mr-2" />
                    <p>
                      {event._count?.registrations || 0} / {event.capacity}{" "}
                      registered
                    </p>
                  </div>
                )}

                {event.price && (
                  <div className="flex items-center">
                    <span className="font-medium">
                      ${event.price.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              <Separator className="my-4" />

              <div className="line-clamp-3 text-sm">
                {synopsis ? (
                  synopsis
                ) : (
                  <span className="text-muted-foreground">
                    {event.description
                      ? "Click for event details and registration"
                      : "No description available. Click for more details."}
                  </span>
                )}
              </div>
            </CardContent>

            <CardFooter className="pt-2">
              <Button asChild className="w-full">
                <Link href={`/events/${event.id}`}>View Details</Link>
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
