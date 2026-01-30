import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { revalidatePath } from "next/cache";
import { RewardsSelector } from "./RewardsSelector";

interface EventRewardsTabProps {
  eventId: string;
}

interface Reward {
  id: string;
  name: string;
  description: string;
  type: "ITEM" | "SPELL" | "GOLD" | "XP" | "OTHER";
  value: string;
  quantity: number;
}

export async function EventRewardsTab({ eventId }: EventRewardsTabProps) {
  // Fetch the event data
  const event = await db.event.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    return <div>Event not found</div>;
  }

  // Extract event rewards from event data
  const eventData = (event.data as Record<string, any>) || {};
  const rewards = (eventData.rewards as Reward[]) || [];

  // Server action to save rewards
  async function saveRewards(rewards: Reward[]): Promise<boolean> {
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
      eventData.rewards = rewards;

      // Save the updated event
      await db.event.update({
        where: { id: eventId },
        data: { data: eventData },
      });

      // Revalidate multiple paths to ensure the UI updates
      revalidatePath(`/admin/events/${eventId}/addthings`);
      revalidatePath(`/admin/events/${eventId}`);
      return true;
    } catch {
      return false;
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Rewards to Event</CardTitle>
      </CardHeader>
      <CardContent>
        <RewardsSelector
          eventId={eventId}
          onSave={saveRewards}
          initialRewards={rewards}
        />
      </CardContent>
    </Card>
  );
}
