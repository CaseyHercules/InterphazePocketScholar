"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export type EventFormData = {
  title: string;
  date: Date | string;
  endDate?: Date | string;
  location?: string;
  address?: string;
  capacity?: number;
  price?: number;
  description?: any;
  status?: "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED";
  data?: any;
};

export type EventFAQFormData = {
  question: string;
  answer: any;
  eventId: string;
};

export async function createEvent(formData: EventFormData) {
  const session = await getServerSession(authOptions);

  if (
    !session?.user ||
    (session.user.role !== "ADMIN" && session.user.role !== "SUPERADMIN")
  ) {
    throw new Error("You must be an admin to create an event");
  }

  try {
    // Ensure dates are stored as ISO strings for serialization
    const date =
      formData.date instanceof Date
        ? formData.date
        : new Date(formData.date as string);

    const endDate = formData.endDate
      ? formData.endDate instanceof Date
        ? formData.endDate
        : new Date(formData.endDate as string)
      : undefined;

    // Handle description data safely
    let processedDescription = null;
    if (formData.description) {
      // Ensure description is properly structured for Quill
      if (typeof formData.description === "string") {
        try {
          processedDescription = JSON.parse(formData.description);
        } catch (e) {
          console.error("Error parsing description string:", e);
          processedDescription = {
            type: "doc",
            content: { ops: [{ insert: formData.description }] },
          };
        }
      } else if (typeof formData.description === "object") {
        // Make sure we have the right format for Quill
        if (!formData.description.type) {
          processedDescription = {
            type: "doc",
            content: formData.description,
          };
        } else {
          processedDescription = formData.description;
        }
      }
    }

    // Create a clean event object with only serializable data
    const cleanedData = {
      title: String(formData.title),
      date,
      endDate,
      location: formData.location ? String(formData.location) : null,
      address: formData.address ? String(formData.address) : null,
      capacity:
        typeof formData.capacity === "number" ? formData.capacity : null,
      price: typeof formData.price === "number" ? formData.price : null,
      description: processedDescription,
      data: formData.data ? JSON.parse(JSON.stringify(formData.data)) : null,
      status: formData.status || "DRAFT",
      updatedAt: new Date(),
    };

    // Perform a final check to ensure the description is valid
    if (cleanedData.description) {
      try {
        // Test if it can be properly serialized/deserialized
        JSON.parse(JSON.stringify(cleanedData.description));
      } catch (e) {
        console.error("Error serializing description:", e);
        cleanedData.description = {
          type: "doc",
          content: { ops: [{ insert: "Event description unavailable" }] },
        };
      }
    }

    const event = await db.event.create({
      data: cleanedData,
    });

    revalidatePath("/events");
    revalidatePath("/admin/events");
    return { success: true, eventId: event.id };
  } catch (error) {
    console.error("Error creating event:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to create event"
    );
  }
}

export async function updateEvent(eventId: string, formData: EventFormData) {
  const session = await getServerSession(authOptions);

  if (
    !session?.user ||
    (session.user.role !== "ADMIN" && session.user.role !== "SUPERADMIN")
  ) {
    throw new Error("You must be an admin to update an event");
  }

  try {
    // Ensure dates are stored as ISO strings for serialization
    const date =
      formData.date instanceof Date
        ? formData.date
        : new Date(formData.date as string);

    const endDate = formData.endDate
      ? formData.endDate instanceof Date
        ? formData.endDate
        : new Date(formData.endDate as string)
      : undefined;

    // Handle description data safely
    let processedDescription = null;
    if (formData.description) {
      // Ensure description is properly structured for Quill
      if (typeof formData.description === "string") {
        try {
          processedDescription = JSON.parse(formData.description);
        } catch (e) {
          console.error("Error parsing description string:", e);
          processedDescription = {
            type: "doc",
            content: { ops: [{ insert: formData.description }] },
          };
        }
      } else if (typeof formData.description === "object") {
        // Make sure we have the right format for Quill
        if (!formData.description.type) {
          processedDescription = {
            type: "doc",
            content: formData.description,
          };
        } else {
          processedDescription = formData.description;
        }
      }
    }

    // Create a clean event object with only serializable data
    const cleanedData = {
      title: String(formData.title),
      date,
      endDate,
      location: formData.location ? String(formData.location) : null,
      address: formData.address ? String(formData.address) : null,
      capacity:
        typeof formData.capacity === "number" ? formData.capacity : null,
      price: typeof formData.price === "number" ? formData.price : null,
      description: processedDescription,
      data: formData.data ? JSON.parse(JSON.stringify(formData.data)) : null,
      status: formData.status,
      updatedAt: new Date(),
    };

    // Perform a final check to ensure the description is valid
    if (cleanedData.description) {
      try {
        // Test if it can be properly serialized/deserialized
        JSON.parse(JSON.stringify(cleanedData.description));
      } catch (e) {
        console.error("Error serializing description:", e);
        cleanedData.description = {
          type: "doc",
          content: { ops: [{ insert: "Event description unavailable" }] },
        };
      }
    }

    const event = await db.event.update({
      where: {
        id: eventId,
      },
      data: cleanedData,
    });

    revalidatePath("/events");
    revalidatePath(`/events/${eventId}`);
    revalidatePath("/admin/events");
    return { success: true, eventId: event.id };
  } catch (error) {
    console.error("Error updating event:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to update event"
    );
  }
}

export async function createEventFAQ(formData: EventFAQFormData) {
  const session = await getServerSession(authOptions);

  if (
    !session?.user ||
    (session.user.role !== "ADMIN" && session.user.role !== "SUPERADMIN")
  ) {
    throw new Error("You must be an admin to add FAQ");
  }

  // Get the event
  const event = await db.event.findUnique({
    where: {
      id: formData.eventId,
    },
    select: {
      data: true,
    },
  });

  if (!event) {
    throw new Error("Event not found");
  }

  // Create a new FAQ entry
  const faqId = crypto.randomUUID();
  const faqEntry = {
    id: faqId,
    question: formData.question,
    answer: formData.answer,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Update the event's data field to include the new FAQ
  const existingData = event.data ? (event.data as Record<string, any>) : {};
  const existingFaqs = existingData.faqs || [];

  const updatedEvent = await db.event.update({
    where: {
      id: formData.eventId,
    },
    data: {
      data: {
        ...existingData,
        faqs: [...existingFaqs, faqEntry],
      },
      updatedAt: new Date(),
    },
  });

  revalidatePath(`/events/${formData.eventId}`);
  return { success: true, faqId };
}

export async function registerForEvent(eventId: string, characterId?: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    throw new Error("You must be logged in to register for an event");
  }

  // Check if the event exists and has capacity
  const event = await db.event.findUnique({
    where: {
      id: eventId,
    },
  });

  if (!event) {
    throw new Error("Event not found");
  }

  // Check if the user is already registered
  const existingRegistration = await db.eventRegistration.findFirst({
    where: {
      eventId,
      userId: session.user.id,
    },
  });

  if (existingRegistration) {
    throw new Error("You are already registered for this event");
  }

  let status: "REGISTERED" | "WAITLIST" = "REGISTERED";

  // If the event has a capacity, check if it's full
  if (event.capacity) {
    const registrationCount = await db.eventRegistration.count({
      where: {
        eventId,
        status: "REGISTERED",
      },
    });

    if (registrationCount >= event.capacity) {
      status = "WAITLIST";
    }
  }

  // Create the registration
  const registration = await db.eventRegistration.create({
    data: {
      id: crypto.randomUUID(),
      eventId,
      userId: session.user.id,
      status,
      updatedAt: new Date(),
    },
  });

  // If a character was specified, connect it to the event
  if (characterId) {
    // Verify the character belongs to the user
    const character = await db.character.findUnique({
      where: {
        id: characterId,
        userId: session.user.id,
      },
    });

    if (!character) {
      throw new Error("Character not found or does not belong to you");
    }

    // Connect the character to the event
    await db.character.update({
      where: {
        id: characterId,
      },
      data: {
        events: {
          connect: {
            id: eventId,
          },
        },
      },
    });
  }

  revalidatePath(`/events/${eventId}`);
  return {
    success: true,
    registrationId: registration.id,
    status,
  };
}
