import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SpellSelector } from "./SpellSelector";
import { revalidatePath } from "next/cache";

interface EventSpellsTabProps {
  eventId: string;
}

export async function EventSpellsTab({ eventId }: EventSpellsTabProps) {
  // Fetch the event data
  const event = await db.event.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    return <div>Event not found</div>;
  }

  // Fetch all available spells from the database
  const dbSpells = await db.spell.findMany({
    select: {
      id: true,
      title: true,
      description: true,
      level: true,
      data: true,
      type: true,
    },
    orderBy: { level: "asc" },
  });

  // Convert DB spells to the expected format
  const allSpells = dbSpells.map((spell) => {
    // Try to extract class from data or type
    let spellClass = undefined;
    if (spell.data && typeof spell.data === "object") {
      try {
        const data = spell.data as any;
        if (data.class) {
          spellClass = data.class;
        }
      } catch (e) {
        console.error("Error parsing spell data", e);
      }
    }
    // Fallback to type field if class not found in data
    if (!spellClass && spell.type) {
      spellClass = spell.type;
    }

    return {
      id: spell.id,
      name: spell.title,
      description: spell.description || undefined,
      level: spell.level,
      class: spellClass,
    };
  });

  // Extract event spells from event data
  const eventData = (event.data as Record<string, any>) || {};
  const eventSpells = eventData.spells || [];

  // Create initial spells array for the SpellSelector with quantities
  const initialSpells = [];
  for (const spellEntry of eventSpells) {
    const spellId = typeof spellEntry === "string" ? spellEntry : spellEntry.id;
    const quantity =
      typeof spellEntry === "string" ? 1 : spellEntry.quantity || 1;

    if (spellId) {
      const spell = await db.spell.findUnique({
        where: { id: spellId },
        select: {
          id: true,
          title: true,
          description: true,
          level: true,
          data: true,
          type: true,
        },
      });

      if (spell) {
        // Try to extract class from data or type
        let spellClass = undefined;
        if (spell.data && typeof spell.data === "object") {
          try {
            const data = spell.data as any;
            if (data.class) {
              spellClass = data.class;
            }
          } catch (e) {
            console.error("Error parsing spell data", e);
          }
        }
        // Fallback to type field if class not found in data
        if (!spellClass && spell.type) {
          spellClass = spell.type;
        }

        initialSpells.push({
          id: spell.id,
          name: spell.title,
          description: spell.description || undefined,
          level: spell.level,
          class: spellClass,
          quantity: quantity,
        });
      }
    }
  }

  // Server action to save spells
  async function saveSpells(
    spells: { id: string; quantity: number }[]
  ): Promise<boolean> {
    "use server";

    try {
      // Fetch the existing event
      const event = await db.event.findUnique({
        where: { id: eventId },
      });

      if (!event) {
        return false;
      }

      // Update the event's data
      const eventData = (event.data as Record<string, any>) || {};
      eventData.spells = spells;

      // Save the updated event
      await db.event.update({
        where: { id: eventId },
        data: { data: eventData },
      });

      // Revalidate multiple paths to ensure the UI updates
      revalidatePath(`/admin/events/${eventId}/addthings`);
      revalidatePath(`/admin/events/${eventId}`);
      return true;
    } catch (error) {
      console.error("Error saving spells:", error);
      return false;
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Spells to Event</CardTitle>
      </CardHeader>
      <CardContent>
        <SpellSelector
          eventId={eventId}
          onSave={saveSpells}
          initialSpells={initialSpells}
          availableSpells={allSpells}
        />
      </CardContent>
    </Card>
  );
}
