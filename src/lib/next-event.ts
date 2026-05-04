import "server-only";

import { db } from "@/lib/db";

export type NextEventPayload = {
  id: string;
  title: string;
  date: string;
  location: string | null;
};

export async function getNextPublishedEvent(): Promise<NextEventPayload | null> {
  const now = new Date();
  const event = await db.event.findFirst({
    where: {
      status: "PUBLISHED",
      date: { gt: now },
    },
    orderBy: { date: "asc" },
    select: {
      id: true,
      title: true,
      date: true,
      location: true,
    },
  });

  if (!event) return null;

  return {
    id: event.id,
    title: event.title,
    date: event.date.toISOString(),
    location: event.location,
  };
}
