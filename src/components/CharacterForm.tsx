"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "@/hooks/use-toast";
import {
  createCharacter,
  updateCharacter,
  CharacterFormData,
} from "@/lib/actions/character";
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
import { Textarea } from "@/components/ui/textarea";
import { Check, Loader2 } from "lucide-react";

// Define form schema
const characterFormSchema = z.object({
  name: z.string().min(1, "Character name is required").max(100),
  primaryClassId: z.string().optional(),
  primaryClassLvl: z.coerce.number().int().min(1).default(1),
  secondaryClassId: z.string().optional(),
  secondaryClassLvl: z.coerce.number().int().min(0).default(0),
  notes: z.string().optional(),
  phazians: z.coerce.number().int().min(0).default(0),
});

type CharacterFormValues = z.infer<typeof characterFormSchema>;

type CharacterFormProps = {
  character?: any;
  classes: { id: string; Title: string }[];
  isEditing?: boolean;
};

export function CharacterForm({
  character,
  classes,
  isEditing = false,
}: CharacterFormProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  // Default values for the form
  const defaultValues: Partial<CharacterFormValues> = {
    name: character?.name || "",
    primaryClassId: character?.primaryClassId || "",
    primaryClassLvl: character?.primaryClassLvl || 1,
    secondaryClassId: character?.secondaryClassId || "",
    secondaryClassLvl: character?.secondaryClassLvl || 0,
    notes: character?.notes ? JSON.stringify(character.notes) : "",
    phazians: character?.phazians || 0,
  };

  const form = useForm<CharacterFormValues>({
    resolver: zodResolver(characterFormSchema),
    defaultValues,
    mode: "onChange",
  });

  const onSubmit = async (data: CharacterFormValues) => {
    setIsPending(true);
    try {
      // Convert form data to the expected format for the server action
      const formData: CharacterFormData = {
        name: data.name,
        primaryClassId: data.primaryClassId,
        primaryClassLvl: data.primaryClassLvl,
        secondaryClassId: data.secondaryClassId,
        secondaryClassLvl: data.secondaryClassLvl,
        notes: data.notes ? JSON.parse(data.notes) : {},
        phazians: data.phazians,
      };

      let result;
      if (isEditing && character?.id) {
        result = await updateCharacter(character.id, formData);
      } else {
        result = await createCharacter(formData);
      }

      if (result.success) {
        toast({
          title: isEditing ? "Character updated" : "Character created",
          description: isEditing
            ? "Your character has been updated successfully."
            : "Your character has been created successfully.",
        });

        if (isEditing) {
          router.push(`/passport/${character.id}`);
        } else {
          router.push(`/passport/${result.characterId}`);
        }
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
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Character Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter character name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="primaryClassId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Class</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a primary class" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {classes.map((classItem) => (
                          <SelectItem key={classItem.id} value={classItem.id}>
                            {classItem.Title}
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
                name="primaryClassLvl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Class Level</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-6">
              <FormField
                control={form.control}
                name="secondaryClassId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Secondary Class (Optional)</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a secondary class" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {classes.map((classItem) => (
                          <SelectItem key={classItem.id} value={classItem.id}>
                            {classItem.Title}
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
                name="secondaryClassLvl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Secondary Class Level</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <FormField
            control={form.control}
            name="phazians"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phazians</FormLabel>
                <FormControl>
                  <Input type="number" min="0" {...field} />
                </FormControl>
                <FormDescription>Currency of the game</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes (JSON format)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='{"key": "value"}'
                    className="font-mono"
                    rows={5}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Enter any additional notes in JSON format
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end space-x-4">
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
                  {isEditing ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  {isEditing ? "Update Character" : "Create Character"}
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
}
