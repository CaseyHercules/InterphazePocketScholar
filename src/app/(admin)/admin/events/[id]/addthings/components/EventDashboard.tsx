import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2 } from "lucide-react";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

interface EventDashboardProps {
  eventId: string;
}

interface Item {
  id: string;
  title: string;
  description?: string;
  type?: string;
  quantity: number;
}

interface Spell {
  id: string;
  name: string;
  description: string;
  level: number;
  class?: string;
  quantity: number;
}

interface Reward {
  id: string;
  name: string;
  description: string;
  type: string;
  value: string;
  quantity: number;
}

// Server component for fetching and displaying event resources
export async function EventDashboard({ eventId }: EventDashboardProps) {
  // Fetch event data directly on the server
  const event = await db.event.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    return <div className="text-destructive">Event not found</div>;
  }

  // Server action to remove an item
  async function removeItem(itemId: string) {
    "use server";

    try {
      const event = await db.event.findUnique({
        where: { id: eventId },
      });

      if (!event) return;

      const eventData = (event.data as Record<string, any>) || {};
      const currentItems = eventData.items || [];

      // Remove the item completely
      eventData.items = currentItems.filter(
        (item: any) => item.itemId !== itemId
      );

      await db.event.update({
        where: { id: eventId },
        data: { data: eventData },
      });

      revalidatePath(`/admin/events/${eventId}/addthings`);
      revalidatePath(`/admin/events/${eventId}`);
    } catch (error) {
      console.error("Error removing item:", error);
    }
  }

  // Server action to remove a spell
  async function removeSpell(spellId: string) {
    "use server";

    try {
      const event = await db.event.findUnique({
        where: { id: eventId },
      });

      if (!event) return;

      const eventData = (event.data as Record<string, any>) || {};
      const currentSpells = eventData.spells || [];

      // Remove the spell completely
      eventData.spells = currentSpells.filter((spell: any) => {
        const id = typeof spell === "string" ? spell : spell.id;
        return id !== spellId;
      });

      await db.event.update({
        where: { id: eventId },
        data: { data: eventData },
      });

      revalidatePath(`/admin/events/${eventId}/addthings`);
      revalidatePath(`/admin/events/${eventId}`);
    } catch (error) {
      console.error("Error removing spell:", error);
    }
  }

  // Server action to remove a reward
  async function removeReward(rewardId: string) {
    "use server";

    try {
      const event = await db.event.findUnique({
        where: { id: eventId },
      });

      if (!event) return;

      const eventData = (event.data as Record<string, any>) || {};
      const currentRewards = eventData.rewards || [];

      // Remove the reward completely
      eventData.rewards = currentRewards.filter(
        (reward: any) => reward.id !== rewardId
      );

      await db.event.update({
        where: { id: eventId },
        data: { data: eventData },
      });

      revalidatePath(`/admin/events/${eventId}/addthings`);
      revalidatePath(`/admin/events/${eventId}`);
    } catch (error) {
      console.error("Error removing reward:", error);
    }
  }

  // Get event data for rewards
  const eventData = (event.data as Record<string, any>) || {};
  const rewards = (eventData.rewards as Reward[]) || [];

  // Process items from event data
  const eventItems = eventData.items || [];
  const items: Item[] = [];

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
        items.push({
          id: item.id,
          title: item.title,
          description: item.description || undefined,
          type: item.type || undefined,
          quantity: itemEntry.quantity || 1,
        });
      }
    }
  }

  // Process spells from event data
  const eventSpells = eventData.spells || [];
  const spells: Spell[] = [];

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
          type: true,
          data: true,
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

        spells.push({
          id: spell.id,
          name: spell.title,
          description: spell.description || "",
          level: spell.level,
          class: spellClass,
          quantity: quantity,
        });
      }
    }
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Event Resources Dashboard</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="items">Items ({items.length})</TabsTrigger>
            <TabsTrigger value="spells">Spells ({spells.length})</TabsTrigger>
            <TabsTrigger value="rewards">
              Rewards ({rewards.length})
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="py-4">
                  <CardTitle className="text-base">Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {items.reduce((sum, item) => sum + item.quantity, 0)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {items.length} unique items
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="py-4">
                  <CardTitle className="text-base">Spells</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {spells.reduce((sum, spell) => sum + spell.quantity, 0)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {spells.length} unique spells
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="py-4">
                  <CardTitle className="text-base">Rewards</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {rewards.reduce(
                      (sum, reward) => sum + (reward.quantity || 1),
                      0
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {rewards.length} unique rewards
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Items Tab */}
          <TabsContent value="items">
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {items.length > 0 ? (
                  items.map((item) => (
                    <Card key={item.id}>
                      <CardContent className="p-4 flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{item.title}</h3>
                            <Badge variant="outline" className="ml-2">
                              x{item.quantity}
                            </Badge>
                            {item.type && (
                              <Badge variant="secondary" className="ml-1">
                                {item.type}
                              </Badge>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {item.description}
                            </p>
                          )}
                        </div>
                        <form action={removeItem.bind(null, item.id)}>
                          <Button variant="ghost" size="icon" type="submit">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </form>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No items added to this event yet
                  </p>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Spells Tab */}
          <TabsContent value="spells">
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {spells.length > 0 ? (
                  spells.map((spell) => (
                    <Card key={spell.id}>
                      <CardContent className="p-4 flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-medium">{spell.name}</h3>
                            <Badge variant="outline" className="ml-2">
                              x{spell.quantity}
                            </Badge>
                            <Badge variant="default" className="ml-1">
                              Level {spell.level}
                            </Badge>
                            {spell.class && (
                              <Badge variant="secondary" className="ml-1">
                                {spell.class}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {spell.description}
                          </p>
                        </div>
                        <form action={removeSpell.bind(null, spell.id)}>
                          <Button variant="ghost" size="icon" type="submit">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </form>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No spells added to this event yet
                  </p>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Rewards Tab */}
          <TabsContent value="rewards">
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {rewards.length > 0 ? (
                  rewards.map((reward) => (
                    <Card key={reward.id}>
                      <CardContent className="p-4 flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-medium">{reward.name}</h3>
                            <Badge variant="outline" className="ml-2">
                              x{reward.quantity || 1}
                            </Badge>
                            <Badge variant="secondary" className="ml-1">
                              {reward.type}
                            </Badge>
                            {reward.value && (
                              <Badge variant="outline" className="ml-1">
                                Value: {reward.value}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {reward.description}
                          </p>
                        </div>
                        <form action={removeReward.bind(null, reward.id)}>
                          <Button variant="ghost" size="icon" type="submit">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </form>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No rewards added to this event yet
                  </p>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
