import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ItemSelector } from "./ItemSelector";
import { revalidatePath } from "next/cache";

interface EventItemsTabProps {
  eventId: string;
}

// Define the item interface with types that match the database
interface Item {
  id: string;
  title: string;
  description?: string | null;
  type?: string | null;
}

export async function EventItemsTab({ eventId }: EventItemsTabProps) {
  // Fetch the event data
  const event = await db.event.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    return <div>Event not found</div>;
  }

  // Fetch all available items from the database
  const dbItems = await db.item.findMany({
    select: {
      id: true,
      title: true,
      description: true,
      type: true,
    },
    orderBy: { title: "asc" },
  });

  // Convert DB items to the expected format
  const allItems = dbItems.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description || undefined,
    type: item.type || undefined,
  }));

  // Extract event items from event data
  const eventData = (event.data as Record<string, any>) || {};
  const eventItems = eventData.items || [];

  // Create initial items array for the ItemSelector with quantities
  const initialItems = [];
  for (const itemEntry of eventItems) {
    if (itemEntry.itemId) {
      const item = await db.item.findUnique({
        where: { id: itemEntry.itemId },
        select: {
          id: true,
          title: true,
          description: true,
          type: true,
        },
      });

      if (item) {
        initialItems.push({
          id: item.id,
          title: item.title,
          description: item.description || undefined,
          type: item.type || undefined,
          quantity: itemEntry.quantity || 1,
        });
      }
    }
  }

  // Server action to save items
  async function saveItems(
    items: { itemId: string; quantity: number }[]
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
      eventData.items = items;

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
      console.error("Error saving items:", error);
      return false;
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Items to Event</CardTitle>
      </CardHeader>
      <CardContent>
        <ItemSelector
          eventId={eventId}
          onSave={saveItems}
          initialItems={initialItems}
          availableItems={allItems}
        />
      </CardContent>
    </Card>
  );
}
