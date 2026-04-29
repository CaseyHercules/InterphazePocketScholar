import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Spell,
  CreateSpellInput,
  SPELL_TYPES,
  SPELL_DESCRIPTORS,
  SPELL_PUBLICATION_STATUSES,
} from "@/types/spell";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

const STATUS_LABELS = {
  IN_REVIEW: "Needs Review",
  PUBLISHED: "Published",
  PUBLISHED_IN_LIBRARY: "Published in Library",
  ARCHIVED_PRIVATE: "Archived",
  ARCHIVED_PUBLIC_LEGACY: "Archived (Legacy)",
} as const;

const SpellFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z.string().min(1, "Spell type is required"),
  description: z.string().default(""),
  author: z.string().default(""),
  publicationStatus: z.enum(SPELL_PUBLICATION_STATUSES).default("PUBLISHED"),
  level: z.coerce
    .number()
    .min(1, "Level must be 1 or higher")
    .max(20, "Level must be 20 or lower"),
  data: z.object({
    castingTime: z.string().default(""),
    effect: z.string().default(""),
    range: z.string().default(""),
    areaOfEffect: z.string().default(""),
    duration: z.string().default(""),
    save: z.string().default(""),
    method: z.string().default(""),
    descriptor: z.array(z.string()).default([]),
  }),
});

type SpellFormValues = z.infer<typeof SpellFormSchema>;

interface SpellFormProps {
  initialSpell?: Spell;
  onSubmit: (spell: CreateSpellInput) => Promise<void>;
  onCancel?: () => void;
}

export function SpellForm({
  initialSpell,
  onSubmit,
  onCancel,
}: SpellFormProps) {
  const form = useForm<SpellFormValues>({
    resolver: zodResolver(SpellFormSchema),
    defaultValues: {
      title: initialSpell?.title || "",
      type: initialSpell?.type || "",
      description: initialSpell?.description || "",
      author: initialSpell?.author || "",
      publicationStatus: initialSpell?.publicationStatus || "PUBLISHED",
      level: initialSpell?.level || 1,
      data: {
        castingTime: initialSpell?.data?.castingTime || "",
        effect: initialSpell?.data?.effect || "",
        range: initialSpell?.data?.range || "",
        areaOfEffect: initialSpell?.data?.areaOfEffect || "",
        duration: initialSpell?.data?.duration || "",
        save: initialSpell?.data?.save || "",
        method: initialSpell?.data?.method || "",
        descriptor: initialSpell?.data?.descriptor || [],
      },
    },
  });

  const handleSubmit = async (values: SpellFormValues) => {
    try {
      console.log("Submitting form values:", values);

      // Format the values to match the expected API structure
      const formattedValues: CreateSpellInput = {
        title: values.title,
        type: values.type,
        description: values.description || undefined,
        author: values.author || undefined,
        publicationStatus: values.publicationStatus,
        level: Number(values.level),
        data: {
          ...Object.fromEntries(
            Object.entries(values.data).map(([key, value]) => [
              key,
              value || undefined,
            ])
          ),
        },
      };

      console.log("Sending to API:", formattedValues);
      await onSubmit(formattedValues);

      toast({
        title: "Success",
        description: initialSpell
          ? "Spell updated successfully"
          : "Spell created successfully",
      });
    } catch (err: any) {
      console.error("Form submission error details:", {
        error: err,
        response: err.response,
        data: err.response?.data,
        status: err.response?.status,
        message: err.message,
      });

      // Handle specific error cases
      if (err.response?.status === 401) {
        toast({
          title: "Authentication Error",
          description: "Please log in to create or edit spells",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Error",
        description:
          err.response?.data?.error ||
          err.message ||
          "An error occurred while saving the spell",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-10">
        <section className="space-y-6">
          <h2 className="text-lg font-semibold tracking-tight">Basic Information</h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-5 md:gap-6 md:items-start lg:gap-10">
              <div className="min-w-0 space-y-4 md:col-span-3">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter spell name..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem className="md:col-span-7">
                        <FormLabel>Spell Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {SPELL_TYPES.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type.charAt(0).toUpperCase() + type.slice(1)}
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
                    name="level"
                    render={({ field }) => (
                      <FormItem className="md:col-span-5">
                        <FormLabel>Level</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            max={20}
                            {...field}
                            onChange={(e) => {
                              const value = parseInt(e.target.value);
                              if (value > 20) {
                                field.onChange(20);
                              } else {
                                field.onChange(value);
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="author"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Spell Author</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter spell author..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="min-w-0 space-y-3 border-t border-border/50 pt-6 md:col-span-2 md:border-t-0 md:border-l md:pl-6 md:pt-0 lg:pl-8">
                <FormField
                  control={form.control}
                  name="publicationStatus"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-3 text-xs text-muted-foreground">
                        <span>Status</span>
                        <span className="font-medium text-foreground">
                          {STATUS_LABELS[field.value]}
                        </span>
                      </div>
                      <FormControl>
                        <div className="space-y-2">
                          <label className="flex cursor-pointer items-center justify-between gap-2 rounded-md px-1 py-2 text-sm transition-colors hover:bg-muted/60">
                            <span className="min-w-0 shrink font-medium leading-snug">
                              Needs Review
                            </span>
                            <Switch
                              checked={field.value === "IN_REVIEW"}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  field.onChange("IN_REVIEW");
                                } else if (field.value === "IN_REVIEW") {
                                  field.onChange("ARCHIVED_PRIVATE");
                                }
                              }}
                            />
                          </label>
                          <label className="flex cursor-pointer items-center justify-between gap-2 rounded-md px-1 py-2 text-sm transition-colors hover:bg-muted/60">
                            <span className="min-w-0 shrink font-medium leading-snug">
                              Published / Archived
                            </span>
                            <Switch
                              checked={
                                field.value === "PUBLISHED" ||
                                field.value === "PUBLISHED_IN_LIBRARY"
                              }
                              onCheckedChange={(checked) => {
                                const inLibrary =
                                  field.value === "PUBLISHED_IN_LIBRARY";
                                if (checked) {
                                  field.onChange(
                                    inLibrary
                                      ? "PUBLISHED_IN_LIBRARY"
                                      : "PUBLISHED"
                                  );
                                } else {
                                  field.onChange("ARCHIVED_PRIVATE");
                                }
                              }}
                            />
                          </label>
                          <label className="flex cursor-pointer items-center justify-between gap-2 rounded-md px-1 py-2 text-sm transition-colors hover:bg-muted/60">
                            <span className="min-w-0 shrink font-medium leading-snug">
                              In Spell Library
                            </span>
                            <Switch
                              checked={field.value === "PUBLISHED_IN_LIBRARY"}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  field.onChange("PUBLISHED_IN_LIBRARY");
                                } else if (
                                  field.value === "PUBLISHED_IN_LIBRARY"
                                ) {
                                  field.onChange("PUBLISHED");
                                }
                              }}
                            />
                          </label>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="data.descriptor"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Descriptors</FormLabel>
                  <div className="flex flex-wrap gap-2">
                    {SPELL_DESCRIPTORS.map((descriptor) => (
                      <Badge
                        key={descriptor}
                        variant={
                          field.value?.includes(descriptor)
                            ? "default"
                            : "outline"
                        }
                        className="cursor-pointer hover:bg-primary/80"
                        onClick={() => {
                          const newValue = field.value?.includes(descriptor)
                            ? field.value.filter((x) => x !== descriptor)
                            : [...(field.value || []), descriptor];
                          field.onChange(newValue);
                        }}
                      >
                        {descriptor}
                      </Badge>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Enter spell description..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold tracking-tight">Spell Details</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {[
                "castingTime",
                "effect",
                "range",
                "areaOfEffect",
                "duration",
                "save",
              ].map((fieldName) => (
                <FormField
                  key={fieldName}
                  control={form.control}
                  name={`data.${fieldName}` as any}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {fieldName
                          .replace(/([A-Z])/g, " $1")
                          .replace(/^./, (str) => str.toUpperCase())}
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>

            <FormField
              control={form.control}
              name="data.method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Method</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
        </section>

        <div className="flex justify-end space-x-3">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit">
            {initialSpell ? "Update Spell" : "Create Spell"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
