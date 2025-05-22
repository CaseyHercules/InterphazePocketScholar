"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "@/hooks/use-toast";
import { registerForEvent } from "@/lib/actions/event";
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
}

export function EventRegistrationModal({
  isOpen,
  onClose,
  eventId,
  characters,
  hasCharacters,
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
    },
  });

  async function onSubmit(data: RegistrationFormValues) {
    setIsPending(true);
    try {
      // Convert "none" to undefined/null for the registration action
      const characterIdToSubmit =
        data.characterId === "none" ? undefined : data.characterId;

      const result = await registerForEvent(eventId, characterIdToSubmit);

      if (result.success) {
        setRegistrationStatus(result.status as "REGISTERED" | "WAITLIST");
        toast({
          title: "Registration successful",
          description:
            result.status === "REGISTERED"
              ? "You are now registered for this event."
              : "You have been added to the waitlist for this event.",
        });
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
