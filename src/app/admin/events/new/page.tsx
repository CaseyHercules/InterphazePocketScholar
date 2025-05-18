import { getAuthSession } from "@/lib/auth";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { EventForm } from "@/components/EventForm";

export default async function NewEventPage() {
  const session = await getAuthSession();

  if (
    !session?.user ||
    (session.user.role !== Role.ADMIN && session.user.role !== Role.SUPERADMIN)
  ) {
    redirect("/unauthorized");
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-8">Create New Event</h1>
      <EventForm />
    </div>
  );
}
