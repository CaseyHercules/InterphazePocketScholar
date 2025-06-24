import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventItemsTab } from "./components/EventItemsTab";
import { EventSpellsTab } from "./components/EventSpellsTab";
import { EventRewardsTab } from "./components/EventRewardsTab";
import { EventDashboard } from "./components/EventDashboard";
import { db } from "@/lib/db";
import { Separator } from "@/components/ui/separator";

export const metadata = {
  title: "Add Things to Event",
  description: "Add items, spells, and rewards to an event",
};

interface AddThingsPageProps {
  params: {
    id: string;
  };
}

export default async function AddThingsPage({ params }: AddThingsPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user || !["ADMIN", "SUPERADMIN"].includes(session.user.role)) {
    redirect("/unauthorized");
  }

  const event = await db.event.findUnique({
    where: {
      id: params.id,
    },
  });

  if (!event) {
    notFound();
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Add Things to Event</h1>
        <p className="text-muted-foreground">
          Add items, spells, and rewards to {event.title}
        </p>
      </div>

      <EventDashboard eventId={event.id} />

      <Separator className="my-8" />

      <Tabs defaultValue="items" className="space-y-4">
        <TabsList>
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="spells">Spells</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
        </TabsList>
        <TabsContent value="items">
          <EventItemsTab eventId={event.id} />
        </TabsContent>
        <TabsContent value="spells">
          <EventSpellsTab eventId={event.id} />
        </TabsContent>
        <TabsContent value="rewards">
          <EventRewardsTab eventId={event.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
