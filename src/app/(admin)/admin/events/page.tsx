import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PlusIcon, PencilIcon, EyeIcon, CalendarIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Manage Events | Admin",
  description: "Manage events and registrations",
};

export default async function EventsAdminPage() {
  const session = await getServerSession(authOptions);

  if (
    !session?.user ||
    (session.user.role !== "ADMIN" && session.user.role !== "SUPERADMIN")
  ) {
    redirect("/auth/signin");
  }

  const events = await db.event.findMany({
    orderBy: [
      {
        status: "asc",
      },
      {
        date: "desc",
      },
    ],
    include: {
      _count: {
        select: {
          registrations: true,
        },
      },
    },
  });

  // Function to get status badge variant
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return "success";
      case "DRAFT":
        return "outline";
      case "CANCELLED":
        return "destructive";
      case "COMPLETED":
        return "secondary";
      default:
        return "default";
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Events Management</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage events, view registrations
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/events/create">
            <PlusIcon className="mr-2 h-4 w-4" />
            Create Event
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Events</CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="text-center py-8">
              <p>No events have been created yet.</p>
              <Button className="mt-4" asChild>
                <Link href="/admin/events/create">Create Your First Event</Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/4">Event</TableHead>
                  <TableHead className="w-1/3">Synopsis</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Registrations</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => {
                  // Extract synopsis from event data
                  const synopsis =
                    event.data && typeof event.data === "object"
                      ? (event.data as any).synopsis
                      : null;

                  return (
                    <TableRow key={event.id}>
                      <TableCell className="font-medium">
                        {event.title}
                      </TableCell>
                      <TableCell>
                        <div className="line-clamp-2 text-sm">
                          {synopsis || (
                            <span className="text-muted-foreground italic">
                              No synopsis available
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                          {formatDate(event.date)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadge(event.status)}>
                          {event.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {event._count?.registrations || 0}
                        {event.capacity && ` / ${event.capacity}`}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/admin/events/${event.id}`}>
                              <EyeIcon className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/admin/events/${event.id}/edit`}>
                              <PencilIcon className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
