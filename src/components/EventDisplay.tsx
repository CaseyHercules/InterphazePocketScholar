"use client";

import { useState } from "react";
import { formatDate } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Calendar, MapPin, Clock, Users, BookText } from "lucide-react";
import Link from "next/link";
import { Event } from "@prisma/client";
import dynamic from "next/dynamic";

// Dynamically import the EditorOutput to avoid SSR issues
const EditorOutput = dynamic(() => import("@/components/EditorOutput"), {
  ssr: false,
  loading: () => <p className="text-muted-foreground">Loading...</p>,
});

// Client component for registration button
function RegistrationButton({
  isRegistered,
  onRegister,
  isAdmin,
  eventId,
}: {
  isRegistered?: boolean;
  onRegister?: () => void;
  isAdmin?: boolean;
  eventId: string;
}) {
  return (
    <div className="space-x-2">
      {isAdmin && (
        <Button variant="outline" asChild>
          <Link href={`/admin/events/${eventId}/edit`}>Edit Event</Link>
        </Button>
      )}

      {!isRegistered ? (
        <Button type="button" onClick={onRegister}>
          Register Now
        </Button>
      ) : (
        <Button disabled>Already Registered</Button>
      )}
    </div>
  );
}

type EventWithData = Event & {
  _count?: {
    registrations: number;
  };
  isRegistered?: boolean;
};

interface EventDisplayProps {
  event: EventWithData;
  isAdmin?: boolean;
  onRegister?: () => void;
}

export function EventDisplay({
  event,
  isAdmin = false,
  onRegister,
}: EventDisplayProps) {
  const formattedStartDate = formatDate(event.date);
  const formattedEndDate = event.endDate ? formatDate(event.endDate) : null;

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-2xl">{event.title}</CardTitle>
        <CardDescription className="flex items-center mt-2">
          <Calendar className="h-4 w-4 mr-1" />
          {formattedStartDate}
          {formattedEndDate && <> - {formattedEndDate}</>}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-2" />
            <span>{event.location || "Location TBA"}</span>
          </div>
          {event.address && (
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2 opacity-0" />
              <span className="text-sm text-muted-foreground">
                {event.address}
              </span>
            </div>
          )}
          {event.capacity && (
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              <span>
                Capacity: {event._count?.registrations || 0} / {event.capacity}
              </span>
            </div>
          )}
        </div>

        <div className="prose prose-stone dark:prose-invert max-w-none">
          {event.description ? (
            <EditorOutput content={event.description} />
          ) : (
            <p className="text-muted-foreground">
              No details have been added for this event yet.
            </p>
          )}
        </div>

        <div className="mt-6 flex justify-between items-center">
          <div>
            {event.price ? (
              <p className="font-medium text-lg">
                Price: ${event.price.toFixed(2)}
              </p>
            ) : (
              <p className="font-medium text-lg">Free Event</p>
            )}
          </div>

          <RegistrationButton
            isRegistered={event.isRegistered}
            onRegister={onRegister}
            isAdmin={isAdmin}
            eventId={event.id}
          />
        </div>
      </CardContent>
    </Card>
  );
}
