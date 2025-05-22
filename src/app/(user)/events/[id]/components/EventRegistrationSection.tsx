"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { EventRegistrationModal } from "@/components/EventRegistrationModal";
import { Users, CheckCircle } from "lucide-react";

interface Character {
  id: string;
  name: string;
  primaryClass?: { Title: string } | null;
}

interface EventRegistrationSectionProps {
  eventId: string;
  isRegistered: boolean;
  characters: Character[];
  hasCharacters: boolean;
}

export function EventRegistrationSection({
  eventId,
  isRegistered,
  characters,
  hasCharacters,
}: EventRegistrationSectionProps) {
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);

  return (
    <div className="mt-8 p-6 border rounded-lg">
      <div className="flex flex-col sm:flex-row items-center justify-between">
        <div className="flex items-center mb-4 sm:mb-0">
          {isRegistered ? (
            <>
              <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
              <div>
                <h3 className="text-lg font-medium">
                  You&apos;re registered for this event
                </h3>
                <p className="text-sm text-muted-foreground">
                  You&apos;ll receive updates and reminders as the event
                  approaches
                </p>
              </div>
            </>
          ) : (
            <>
              <Users className="h-6 w-6 text-primary mr-2" />
              <div>
                <h3 className="text-lg font-medium">Join this event</h3>
                <p className="text-sm text-muted-foreground">
                  Register now to secure your spot
                </p>
              </div>
            </>
          )}
        </div>

        {!isRegistered && (
          <Button
            onClick={() => setShowRegistrationModal(true)}
            className="min-w-[150px]"
          >
            Register Now
          </Button>
        )}
      </div>

      <EventRegistrationModal
        isOpen={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        eventId={eventId}
        characters={characters}
        hasCharacters={hasCharacters}
      />
    </div>
  );
}
