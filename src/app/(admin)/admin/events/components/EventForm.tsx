"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "@/hooks/use-toast";
import { createEvent, updateEvent } from "@/lib/actions/event";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, Loader2 } from "lucide-react";
import { EventStatus } from "@prisma/client";
import "quill/dist/quill.snow.css";
import "@/styles/quill.css";
import type Quill from "quill";

// Define form schema
const eventFormSchema = z.object({
  title: z.string().min(1, "Event title is required").max(100),
  date: z.string().min(1, "Start date and time is required"),
  endDate: z.string().optional(),
  location: z.string().optional(),
  address: z.string().optional(),
  capacity: z.string().optional(),
  price: z.string().optional(),
  status: z
    .enum(["DRAFT", "PUBLISHED", "CANCELLED", "COMPLETED"])
    .default("DRAFT"),
  description: z.any().optional(),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

interface EventFormProps {
  event?: {
    id: string;
    title: string;
    date: Date;
    endDate?: Date | null;
    location?: string | null;
    address?: string | null;
    capacity?: number | null;
    price?: number | null;
    status: string;
    description?: any;
    data?: any;
  };
}

export function EventForm({ event }: EventFormProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const quillRef = useRef<Quill>();
  const editorRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // Format date for input
  const formatDateForInput = (date?: Date | null) => {
    if (!date) return "";
    return new Date(date).toISOString().slice(0, 16);
  };

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: event?.title || "",
      date: formatDateForInput(event?.date),
      endDate: formatDateForInput(event?.endDate),
      location: event?.location || "",
      address: event?.address || "",
      capacity: event?.capacity ? String(event.capacity) : "",
      price: event?.price ? String(event.price) : "",
      status: (event?.status as EventStatus) || "DRAFT",
      description: event?.description || null,
    },
  });

  // Initialize Quill editor
  const initializeEditor = useCallback(async () => {
    if (!editorRef.current) return;

    const { default: Quill } = await import("quill");

    const toolbarOptions = [
      ["bold", "italic", "underline", "strike"],
      ["blockquote", "code-block"],
      [{ header: 1 }, { header: 2 }],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ indent: "-1" }, { indent: "+1" }],
      ["link", "image"],
      ["clean"],
    ];

    const quill = new Quill(editorRef.current, {
      modules: {
        toolbar: toolbarOptions,
      },
      placeholder: "Write event description and details...",
      theme: "snow",
    });

    // Set quillRef.current first
    quillRef.current = quill;

    // Then set initial content if available
    if (isMounted && event?.description) {
      try {
        // Make sure to parse the ops if needed
        let content;
        if (typeof event.description.content === "string") {
          content = JSON.parse(event.description.content);
        } else {
          content = event.description.content;
        }

        if (content && content.ops) {
          quill.setContents(content.ops);
        } else if (content) {
          quill.setContents(content);
        }
      } catch {
        // Silently ignore parse errors for initial content
      }
    }
  }, [isMounted, event?.description]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsMounted(true);
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      initializeEditor();
    }
  }, [isMounted, initializeEditor]);

  const onSubmit = async (data: EventFormValues) => {
    setIsPending(true);
    try {
      const safeFormData = JSON.parse(
        JSON.stringify({
          title: data.title,
          date: data.date,
          endDate: data.endDate || undefined,
          location: data.location || undefined,
          address: data.address || undefined,
          capacity: data.capacity ? parseInt(data.capacity) : undefined,
          price: data.price ? parseFloat(data.price) : undefined,
          status: data.status,
        })
      );

      const eventData = {
        ...(event?.data || {}),
      };

      safeFormData.data = eventData;

      if (quillRef.current) {
        const quillContent = quillRef.current.getContents();
        const safeContent = JSON.parse(JSON.stringify(quillContent));
        safeFormData.description = {
          type: "doc",
          content: safeContent,
        };
      }

      let result;
      if (event?.id) {
        result = await updateEvent(event.id, safeFormData);
      } else {
        result = await createEvent(safeFormData);
      }

      if (result.success) {
        toast({
          title: event?.id ? "Event updated" : "Event created",
          description: event?.id
            ? "The event has been updated successfully."
            : "Your event has been created successfully.",
        });

        router.push(`/admin/events/${result.eventId}`);
      }
    } catch (error) {
      toast({
        title: "Something went wrong",
        description:
          error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Card className="p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Event Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter event title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date & Time</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Date & Time (Optional)</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter location name" {...field} />
                  </FormControl>
                  <FormDescription>
                    e.g. Game Store, Online, etc.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Capacity (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter capacity"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Maximum number of attendees</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Enter price"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Leave empty for free events</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="PUBLISHED">Published</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Only published events are visible to users
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={() => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormDescription>
                  Provide details about the event, what to expect, what to
                  bring, etc.
                </FormDescription>
                <div className="quill mt-2">
                  <div ref={editorRef} className="min-h-[300px]" />
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {event?.id ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  {event?.id ? "Update Event" : "Create Event"}
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
}
