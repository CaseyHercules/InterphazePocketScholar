"use client";

import { FC, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CreateEventValidator,
  type CreateEventPayload,
} from "@/lib/validators/event";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { EventEditor } from "./EventEditor";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { DateTimePicker } from "./DateTimePicker";

interface EventFormProps {
  initialData?: any; // Event data for editing
}

export const EventForm: FC<EventFormProps> = ({ initialData }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  // State for date/time fields
  const [startDate, setStartDate] = useState<Date | undefined>(
    initialData?.date ? new Date(initialData.date) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    initialData?.endDate ? new Date(initialData.endDate) : undefined
  );
  const [registrationDeadline, setRegistrationDeadline] = useState<
    Date | undefined
  >(
    initialData?.registrationEnd
      ? new Date(initialData.registrationEnd)
      : undefined
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<CreateEventPayload>({
    resolver: zodResolver(CreateEventValidator),
    defaultValues: initialData || {
      status: "DRAFT",
    },
  });

  const onSubmit = async (data: CreateEventPayload) => {
    if (!startDate) {
      toast({
        title: "Error",
        description: "Please select a start date and time",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      const payload = {
        ...data,
        date: startDate.toISOString(),
        endDate: endDate?.toISOString(),
        registrationEnd: registrationDeadline?.toISOString(),
      };

      if (initialData?.id) {
        await axios.post("/api/admin/event", {
          ...payload,
          id: initialData.id,
        });
        toast({
          title: "Success",
          description: "Event updated successfully",
        });
      } else {
        await axios.post("/api/admin/event", payload);
        toast({
          title: "Success",
          description: "Event created successfully",
        });
      }

      router.push("/admin/events");
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Event Title</Label>
          <Input
            id="title"
            {...register("title")}
            className="mt-1"
            placeholder="Enter event title"
          />
          {errors.title && (
            <p className="text-sm text-red-500">{errors.title.message}</p>
          )}
        </div>

        <div>
          <Label>Description</Label>
          <EventEditor
            onChange={(content) => setValue("description", content)}
            initialContent={initialData?.description}
          />
        </div>

        <div className="space-y-4">
          <DateTimePicker
            date={startDate}
            setDate={setStartDate}
            label="Event Start Date & Time"
          />
          <DateTimePicker
            date={endDate}
            setDate={setEndDate}
            label="Event End Date & Time (Optional)"
          />
          <DateTimePicker
            date={registrationDeadline}
            setDate={setRegistrationDeadline}
            label="Registration Deadline (Optional)"
          />
        </div>

        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            {...register("location")}
            className="mt-1"
            placeholder="Event location"
          />
          {errors.location && (
            <p className="text-sm text-red-500">{errors.location.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="address">Full Address</Label>
          <Textarea
            id="address"
            {...register("address")}
            className="mt-1"
            placeholder="Detailed address for map"
          />
          {errors.address && (
            <p className="text-sm text-red-500">{errors.address.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="capacity">Capacity (Optional)</Label>
            <Input
              id="capacity"
              type="number"
              {...register("capacity", { valueAsNumber: true })}
              className="mt-1"
              placeholder="Maximum attendees"
            />
          </div>

          <div>
            <Label htmlFor="price">Price (Optional)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              {...register("price", { valueAsNumber: true })}
              className="mt-1"
              placeholder="Event price"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            {...register("status")}
            className="w-full mt-1 rounded-md border border-input bg-transparent px-3 py-2"
          >
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {initialData ? "Updating..." : "Creating..."}
          </>
        ) : (
          <>{initialData ? "Update Event" : "Create Event"}</>
        )}
      </Button>
    </form>
  );
};
