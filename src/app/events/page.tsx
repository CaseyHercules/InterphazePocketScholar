import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { EventStatus } from "@prisma/client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const events = await db.event.findMany({
    where: {
      status: EventStatus.PUBLISHED,
      date: {
        gte: new Date(), // Only future events
      },
    },
    orderBy: {
      date: "asc", // Earliest events first
    },
    include: {
      registrations: {
        include: {
          attendees: true,
        },
      },
    },
  });

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Upcoming Events</h1>
        <Link href="/events/next">
          <Button variant="outline">View Next Event</Button>
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600">
            No upcoming events at this time.
          </p>
          <p className="text-gray-500 mt-2">Please check back later!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => {
            const totalAttendees = event.registrations.reduce(
              (sum, reg) => sum + reg.attendees.length,
              0
            );
            const isFull = event.capacity
              ? totalAttendees >= event.capacity
              : false;

            return (
              <Card key={event.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle>{event.title}</CardTitle>
                  <CardDescription>{formatDate(event.date)}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="space-y-2">
                    {event.location && (
                      <p className="text-sm">
                        <span className="font-medium">Location:</span>{" "}
                        {event.location}
                      </p>
                    )}
                    {event.capacity && (
                      <p className="text-sm">
                        <span className="font-medium">Capacity:</span>{" "}
                        {totalAttendees}/{event.capacity} spots filled
                      </p>
                    )}
                    {event.price ? (
                      <p className="text-sm">
                        <span className="font-medium">Price:</span> $
                        {event.price.toFixed(2)} per person
                      </p>
                    ) : (
                      <p className="text-sm text-green-600 font-medium">
                        Free Event
                      </p>
                    )}
                    {event.registrationEnd && (
                      <p className="text-sm text-gray-500">
                        Registration closes on{" "}
                        {formatDate(event.registrationEnd)}
                      </p>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  {isFull ? (
                    <div className="w-full text-center">
                      <Button className="w-full" variant="secondary" disabled>
                        Event Full
                      </Button>
                      <p className="text-xs text-gray-500 mt-2">
                        Join waitlist for notifications
                      </p>
                    </div>
                  ) : (
                    <Link href="/events/register" className="w-full">
                      <Button className="w-full">Register Now</Button>
                    </Link>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
