"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";

// Define form schema
const registrationFormSchema = z.object({
  characterId: z.string(),
  ticketTypeId: z.string().min(1, "Select a ticket type"),
  promoCode: z.string().optional(),
  notes: z.string().optional(),
});

type RegistrationFormValues = z.infer<typeof registrationFormSchema>;

interface Character {
  id: string;
  name: string;
  primaryClass?: { Title: string } | null;
}

interface EventRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  characters: Character[];
  hasCharacters: boolean;
  ticketTypes: Array<{
    id: string;
    title: string;
    amountCents: number;
  }>;
}

export function EventRegistrationModal({
  isOpen,
  onClose,
  eventId,
  characters,
  hasCharacters,
  ticketTypes,
}: EventRegistrationModalProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState<
    "REGISTERED" | "WAITLIST" | null
  >(null);

  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationFormSchema),
    defaultValues: {
      characterId: "none",
      ticketTypeId: ticketTypes[0]?.id ?? "",
      promoCode: "",
      notes: "",
    },
  });

  async function onSubmit(data: RegistrationFormValues) {
    setIsPending(true);
    try {
      const characterIdToSubmit =
        data.characterId === "none" ? undefined : data.characterId;
      const response = await fetch(`/api/events/${eventId}/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          characterId: characterIdToSubmit,
          ticketTypeId: data.ticketTypeId,
          promoCode: data.promoCode,
          answers: data.notes ? { notes: data.notes } : null,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Checkout could not be started.");
      }

      if (result.success) {
        if (result.checkoutUrl) {
          window.location.href = result.checkoutUrl;
          return;
        }
        setRegistrationStatus("REGISTERED");
        toast({ title: "Registration successful", description: "You are now registered for this event." });
        router.refresh();
      }
    } catch (error) {
      toast({
        title: "Registration failed",
        description:
          error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsPending(false);
    }
  }

  // Handle close - reset form when closed
  const handleClose = () => {
    if (!isPending) {
      form.reset();
      setRegistrationStatus(null);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Register for Event</DialogTitle>
          <DialogDescription>
            {hasCharacters
              ? "Select a character to register for this event."
              : "You'll need to create a character before registering for this event."}
          </DialogDescription>
        </DialogHeader>

        {registrationStatus ? (
          <div className="py-4">
            <Alert
              className={
                registrationStatus === "REGISTERED"
                  ? "bg-green-50"
                  : "bg-yellow-50"
              }
            >
              <AlertCircle
                className={
                  registrationStatus === "REGISTERED"
                    ? "h-4 w-4 text-green-500"
                    : "h-4 w-4 text-yellow-500"
                }
              />
              <AlertTitle>
                {registrationStatus === "REGISTERED"
                  ? "Successfully Registered!"
                  : "Added to Waitlist"}
              </AlertTitle>
              <AlertDescription>
                {registrationStatus === "REGISTERED"
                  ? "You are now registered for this event. Check your email for more details."
                  : "This event is at capacity. You've been added to the waitlist and will be notified if a spot becomes available."}
              </AlertDescription>
            </Alert>

            <DialogFooter className="mt-6">
              <Button onClick={handleClose}>Close</Button>
            </DialogFooter>
          </div>
        ) : hasCharacters ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="ticketTypeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ticket</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select ticket type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ticketTypes.map((ticketType) => (
                          <SelectItem key={ticketType.id} value={ticketType.id}>
                            {ticketType.title} - ${(ticketType.amountCents / 100).toFixed(2)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="characterId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Character</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a character" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">
                          Register without character
                        </SelectItem>
                        {characters.map((character) => (
                          <SelectItem key={character.id} value={character.id}>
                            {character.name}
                            {character.primaryClass &&
                              ` - ${character.primaryClass.Title}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      You can register without selecting a character, or create
                      a new one during the process.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="promoCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Promo code (optional)</FormLabel>
                    <FormControl>
                      <input
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        placeholder="Enter promo code"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customization notes (optional)</FormLabel>
                    <FormControl>
                      <input
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        placeholder="Any special requests"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    "Register"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        ) : (
          <div className="py-4">
            <p className="mb-4">
              You don&apos;t have any characters yet. Create one to join this
              event!
            </p>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose} className="mr-2">
                Cancel
              </Button>
              <Button asChild>
                <Link href="/characters/create">Create Character</Link>
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
