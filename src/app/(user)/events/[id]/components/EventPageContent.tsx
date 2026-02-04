"use client";

import { useState } from "react";
import { EventDisplay } from "@/components/EventDisplay";
import { EventRegistrationSection } from "./EventRegistrationSection";
import { Event } from "@prisma/client";

interface Character {
  id: string;
  name: string;
  primaryClass?: { Title: string } | null;
}

type EventWithData = Event & {
  _count?: { registrations: number };
  isRegistered?: boolean;
};

interface EventPageContentProps {
  event: EventWithData;
  isAdmin: boolean;
  isRegistered: boolean;
  characters: Character[];
}

export function EventPageContent({
  event,
  isAdmin,
  isRegistered,
  characters,
}: EventPageContentProps) {
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);

  return (
    <>
      <EventDisplay
        event={{ ...event, isRegistered }}
        isAdmin={isAdmin}
        onRegister={() => setShowRegistrationModal(true)}
      />
      <EventRegistrationSection
        eventId={event.id}
        isRegistered={isRegistered}
        characters={characters}
        hasCharacters={characters.length > 0}
        showRegistrationModal={showRegistrationModal}
        onShowRegistrationModalChange={setShowRegistrationModal}
      />
    </>
  );
}
