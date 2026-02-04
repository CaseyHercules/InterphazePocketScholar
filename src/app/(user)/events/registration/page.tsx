import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CalendarIcon, MapPinIcon, ChevronRightIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = {
  title: "My Registrations | Interphaze Pocket Scholar",
  description: "View your event registrations",
};

export default async function RegistrationPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/events/registration");
  }

  const registrations = await db.eventRegistration.findMany({
    where: { userId: session.user.id },
    include: {
      event: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const now = new Date();
  const upcoming = registrations.filter(
    (r) => r.event.status === "PUBLISHED" && new Date(r.event.date) > now
  );
  const past = registrations.filter(
    (r) => new Date(r.event.date) <= now || r.event.status !== "PUBLISHED"
  );

  return (
    <div className="container max-w-5xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-2">My Registrations</h1>
      <p className="text-muted-foreground mb-8">
        Events you&apos;ve registered for
      </p>

      {registrations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              You haven&apos;t registered for any events yet.
            </p>
            <Button asChild>
              <Link href="/events">Browse Upcoming Events</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {upcoming.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4">Upcoming</h2>
              <div className="space-y-4">
                {upcoming.map((reg) => (
                  <Card key={reg.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-xl line-clamp-2">
                        {reg.event.title}
                      </CardTitle>
                      <CardDescription className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        {formatDate(reg.event.date)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {reg.event.location && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPinIcon className="h-4 w-4 mr-2" />
                          {reg.event.location}
                        </div>
                      )}
                      <p className="text-sm mt-2">
                        Status:{" "}
                        <span
                          className={
                            reg.status === "REGISTERED"
                              ? "text-green-600 font-medium"
                              : "text-amber-600"
                          }
                        >
                          {reg.status}
                        </span>
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/events/${reg.event.id}`}>
                          View Event
                          <ChevronRightIcon className="h-4 w-4 ml-1" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {past.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4">Past</h2>
              <div className="space-y-4">
                {past.map((reg) => (
                  <Card
                    key={reg.id}
                    className="opacity-75 hover:opacity-100 transition-opacity"
                  >
                    <CardHeader>
                      <CardTitle className="text-lg line-clamp-2">
                        {reg.event.title}
                      </CardTitle>
                      <CardDescription className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        {formatDate(reg.event.date)}
                      </CardDescription>
                    </CardHeader>
                    <CardFooter>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/events/${reg.event.id}`}>
                          View Details
                          <ChevronRightIcon className="h-4 w-4 ml-1" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
