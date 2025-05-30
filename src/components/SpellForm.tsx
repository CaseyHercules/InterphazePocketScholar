import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Spell,
  CreateSpellInput,
  SPELL_TYPES,
  SPELL_DESCRIPTORS,
} from "@/types/spell";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

const SpellFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z.string().min(1, "Spell type is required"),
  description: z.string().default(""),
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
    isInSpellLibrary: z.boolean().default(false),
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
        isInSpellLibrary: initialSpell?.data?.isInSpellLibrary || false,
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
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
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
            </div>

            <div className="flex items-center space-x-4">
              <FormField
                control={form.control}
                name="level"
                render={({ field }) => (
                  <FormItem className="flex-1">
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

              <FormField
                control={form.control}
                name="data.isInSpellLibrary"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-end space-x-2 mt-6">
                    <FormLabel className="font-normal">
                      Is In Spell Library
                    </FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Spell Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </CardContent>
        </Card>

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
