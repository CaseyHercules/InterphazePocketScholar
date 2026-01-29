"use client";

import { useState, useRef, useCallback, useEffect } from "react";
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
import { Check, Loader2 } from "lucide-react";
import "quill/dist/quill.snow.css";
import "@/styles/quill.css";
import type Quill from "quill";

// Define form schema
const characterFormSchema = z.object({
  name: z.string().min(1, "Character name is required").max(100),
  race: z.string().min(1, "Race is required"),
  primaryClassId: z.string().min(1, "Primary class is required"),
  secondaryClassId: z.string().default("cmaufwsx600004x0vo5v8afxu"),
  backstory: z.any().optional(),
});

type CharacterFormValues = z.infer<typeof characterFormSchema>;

type CharacterFormProps = {
  classes: { id: string; Title: string }[];
  races?: { id: string; name: string }[];
  character?: any;
  isEditing?: boolean;
};

export function CharacterForm({
  classes,
  races,
  character,
  isEditing,
}: CharacterFormProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const quillRef = useRef<Quill>();
  const editorRef = useRef<HTMLDivElement>(null);
  const isEditMode = Boolean(isEditing && character?.id);

  // Default values for the form
  const defaultValues: Partial<CharacterFormValues> = {
    name: "",
    race: "",
    primaryClassId: "",
    secondaryClassId: "cmaufwsx600004x0vo5v8afxu",
    backstory: null,
  };

  const form = useForm<CharacterFormValues>({
    resolver: zodResolver(characterFormSchema),
    defaultValues,
    mode: "onChange",
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
      ["link"],
      ["clean"],
    ];

    const quill = new Quill(editorRef.current, {
      modules: {
        toolbar: toolbarOptions,
      },
      placeholder: "Write your character's backstory...",
      theme: "snow",
    });

    quillRef.current = quill;
    setIsEditorReady(true);
  }, []);

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

  useEffect(() => {
    if (!isEditMode || !character) return;

    form.reset({
      name: character.name ?? "",
      race: character.Attributes?.race ?? "",
      primaryClassId: character.primaryClassId ?? "",
      secondaryClassId:
        character.secondaryClassId ?? "cmaufwsx600004x0vo5v8afxu",
      backstory: null,
    });
  }, [form, isEditMode, character]);

  useEffect(() => {
    if (
      !isEditMode ||
      !isEditorReady ||
      !quillRef.current ||
      !character?.notes?.backstory
    ) {
      return;
    }

    try {
      const parsed = JSON.parse(character.notes.backstory);
      quillRef.current.setContents(parsed);
    } catch {
      // Ignore invalid stored backstory content
    }
  }, [isEditMode, isEditorReady, character]);

  const onSubmit = async (data: CharacterFormValues) => {
    setIsPending(true);
    try {
      // Get content from Quill editor and serialize it properly
      let backstoryContent = null;
      if (quillRef.current) {
        const quillContent = quillRef.current.getContents();
        backstoryContent = JSON.stringify(quillContent);
      }

      // Convert form data to the expected format for the server action
      const existingAttributes =
        character && typeof character.Attributes === "object"
          ? character.Attributes
          : {};
      const existingNotes =
        character && typeof character.notes === "object" ? character.notes : {};
      const formData: CharacterFormData = {
        name: data.name,
        race: data.race,
        primaryClassId: data.primaryClassId,
        primaryClassLvl: character?.primaryClassLvl ?? 1,
        secondaryClassId: data.secondaryClassId,
        secondaryClassLvl: character?.secondaryClassLvl ?? 0,
        attributes: {
          ...existingAttributes,
          race: data.race,
        },
        notes: {
          ...existingNotes,
          backstory: backstoryContent ? backstoryContent : "",
        },
        phazians: character?.phazians ?? 0,
      };

      const result = isEditMode
        ? await updateCharacter(character.id, formData)
        : await createCharacter(formData);

      if (result.success) {
        toast({
          title: isEditMode ? "Character updated" : "Character created",
          description: isEditMode
            ? "Your character has been updated successfully."
            : "Your character has been created successfully.",
        });

        router.push(`/passport/${result.characterId}`);
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

          <FormField
            control={form.control}
            name="race"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Race</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a race" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {races?.map((race) => (
                      <SelectItem key={race.id} value={race.id}>
                        {race.name}
                      </SelectItem>
                    )) || <SelectItem value="human">Human</SelectItem>}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="primaryClassId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Primary Class</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
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
                <FormDescription>You&apos;ll start at Level 1</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="backstory"
            render={() => (
              <FormItem>
                <FormLabel>Backstory</FormLabel>
                <FormDescription>
                  Tell the story of your character&apos;s origins and
                  motivations
                </FormDescription>
                <div className="quill mt-2">
                  <div ref={editorRef} className="min-h-[200px]" />
                </div>
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
                  {isEditMode ? "Saving..." : "Creating..."}
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  {isEditMode ? "Save Changes" : "Create Character"}
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
}
