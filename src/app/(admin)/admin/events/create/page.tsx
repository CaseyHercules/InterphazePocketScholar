import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { EventForm } from "../components/EventForm";

export const metadata = {
  title: "Create Event | Admin",
  description: "Create a new event or game session",
};

export default async function CreateEventPage() {
  const session = await getServerSession(authOptions);

  if (
    !session?.user ||
    (session.user.role !== "ADMIN" && session.user.role !== "SUPERADMIN")
  ) {
    redirect("/auth/signin");
  }

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Create Event</h1>
      <p className="text-muted-foreground mb-6">
        Fill out the form below to create a new event. You&apos;ll be able to
        add FAQs after creating the event.
      </p>

      <EventForm />
    </div>
  );
}
