import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { EventForm } from "../../components/EventForm";

interface EditEventPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: EditEventPageProps) {
  const event = await db.event.findUnique({
    where: { id: params.id },
    select: { title: true },
  });

  return {
    title: event ? `Edit ${event.title}` : "Edit Event",
  };
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin");
  }

  if (session.user.role !== "ADMIN" && session.user.role !== "SUPERADMIN") {
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
    <div className="container px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Edit Event</h1>
        <p className="text-muted-foreground mt-1">
          Update event details and content
        </p>
      </div>
      <EventForm event={event} />
    </div>
  );
}
