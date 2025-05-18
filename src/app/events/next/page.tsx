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

export default async function NextEventPage() {
  // Get only the next upcoming event
  const nextEvent = await db.event.findFirst({
    where: {
      status: EventStatus.PUBLISHED,
      date: {
        gte: new Date(), // Only future events
      },
    },
    orderBy: {
      date: "asc", // Get the earliest future event
    },
    include: {
      registrations: {
        include: {
          attendees: true,
        },
      },
      faqs: true, // Include FAQs for more event details
    },
  });

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Next Event</h1>
        <Link href="/events">
          <Button variant="outline">View All Events</Button>
        </Link>
      </div>

      {!nextEvent ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600">
            No upcoming events at this time.
          </p>
          <p className="text-gray-500 mt-2">Please check back later!</p>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">{nextEvent.title}</CardTitle>
              <CardDescription className="text-lg text-gray-600">
                {formatDate(nextEvent.date)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Event Details */}
              <div className="space-y-4">
                {nextEvent.location && (
                  <div>
                    <h3 className="font-semibold text-lg">Location</h3>
                    <p className="text-gray-600">{nextEvent.location}</p>
                    {nextEvent.address && (
                      <p className="text-sm text-gray-500 mt-1">
                        {nextEvent.address}
                      </p>
                    )}
                  </div>
                )}

                {/* Registration Status */}
                <div>
                  <h3 className="font-semibold text-lg">Registration</h3>
                  {nextEvent.capacity && (
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-600">
                        {nextEvent.registrations.reduce(
                          (sum, reg) => sum + reg.attendees.length,
                          0
                        )}{" "}
                        / {nextEvent.capacity} spots filled
                      </span>
                    </div>
                  )}
                  {nextEvent.registrationEnd && (
                    <p className="text-sm text-gray-500 mt-1">
                      Registration closes on{" "}
                      {formatDate(nextEvent.registrationEnd)}
                    </p>
                  )}
                </div>

                {/* Price Information */}
                <div>
                  <h3 className="font-semibold text-lg">Price</h3>
                  {nextEvent.price ? (
                    <p className="text-gray-600">
                      ${nextEvent.price.toFixed(2)} per person
                    </p>
                  ) : (
                    <p className="text-green-600 font-medium">Free Event</p>
                  )}
                </div>

                {/* Event Description */}
                {nextEvent.description && (
                  <div>
                    <h3 className="font-semibold text-lg">About</h3>
                    <div className="prose prose-sm max-w-none">
                      {/* Note: You might need to parse the EditorJS content here */}
                      <pre className="whitespace-pre-wrap text-gray-600">
                        {JSON.stringify(nextEvent.description, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {/* FAQs */}
                {nextEvent.faqs.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-lg">
                      Frequently Asked Questions
                    </h3>
                    <div className="space-y-4 mt-2">
                      {nextEvent.faqs.map((faq) => (
                        <div key={faq.id}>
                          <h4 className="font-medium text-gray-900">
                            {faq.question}
                          </h4>
                          <div className="mt-1 text-gray-600">
                            {/* Note: You might need to parse the EditorJS content here */}
                            <pre className="whitespace-pre-wrap">
                              {JSON.stringify(faq.answer, null, 2)}
                            </pre>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50 px-6 py-4">
              <div className="w-full">
                {nextEvent.capacity &&
                nextEvent.registrations.reduce(
                  (sum, reg) => sum + reg.attendees.length,
                  0
                ) >= nextEvent.capacity ? (
                  <div className="text-center">
                    <Button disabled className="w-full md:w-auto">
                      Event Full
                    </Button>
                    <p className="text-sm text-gray-500 mt-2">
                      Join the waitlist to be notified if spots become available
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Link href="/events/register" className="w-full">
                      <Button className="w-full md:w-auto" size="lg">
                        Register Now
                      </Button>
                    </Link>
                    {nextEvent.registrationEnd && (
                      <p className="text-sm text-gray-500 mt-2">
                        {"Don't wait! Registration closes soon."}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
