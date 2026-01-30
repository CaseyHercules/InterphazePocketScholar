"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { AdjustmentSourceType } from "@prisma/client";
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
import { Textarea } from "@/components/ui/textarea";
import { SkillEffectsEditor } from "@/components/SkillEffectsEditor";
import {
  getEffectsFromJson,
  createEffectsJson,
  type SkillEffect,
} from "@/types/skill-effects";

const jsonString = z
  .string()
  .min(1, { message: "JSON is required" })
  .refine((value) => {
    try {
      JSON.parse(value);
      return true;
    } catch {
      return false;
    }
  }, "Must be valid JSON");

const optionalJsonString = z
  .string()
  .optional()
  .refine((value) => {
    if (!value || value.trim().length === 0) return true;
    try {
      JSON.parse(value);
      return true;
    } catch {
      return false;
    }
  }, "Tags must be valid JSON");

const FormSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(2, { message: "Title is required" }),
  description: z.string().optional(),
  sourceType: z.nativeEnum(AdjustmentSourceType),
  effectsJson: jsonString,
  tags: optionalJsonString,
});

export type AdjustmentFormValues = z.infer<typeof FormSchema>;

const defaultEffectsTemplate = `{
  "effects": [
    { "type": "stat_bonus", "stat": "Tough", "value": 5 },
    { "type": "restriction", "note": "Unable to use heavy armor" }
  ]
}`;

interface AdjustmentFormProps {
  data?: {
    id?: string;
    title?: string;
    description?: string | null;
    sourceType?: AdjustmentSourceType;
    effectsJson?: any;
    tags?: any;
    archived?: boolean;
  } | null;
  onSubmit: (data: AdjustmentFormValues) => Promise<void>;
  onCancel: () => void;
}

export function AdjustmentForm({ data: formData, onSubmit, onCancel }: AdjustmentFormProps) {
  const form = useForm<AdjustmentFormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      id: formData?.id,
      title: formData?.title ?? "",
      description: formData?.description ?? "",
      sourceType: formData?.sourceType ?? AdjustmentSourceType.CUSTOM,
      effectsJson:
        formData?.effectsJson != null
          ? JSON.stringify(formData.effectsJson, null, 2)
          : defaultEffectsTemplate,
      tags:
        formData?.tags != null ? JSON.stringify(formData.tags, null, 2) : "",
    },
  });

  const handleSubmit = async (formData: AdjustmentFormValues) => {
    await onSubmit(formData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Adjustment title..." {...field} />
              </FormControl>
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
                  placeholder="Describe the adjustment..."
                  className="min-h-[80px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sourceType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Source Type</FormLabel>
              <FormControl>
                <select
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  {...field}
                >
                  {Object.values(AdjustmentSourceType).map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="effectsJson"
          render={({ field }) => {
            let effects: SkillEffect[] = [];
            try {
              const parsed = field.value?.trim() ? JSON.parse(field.value) : {};
              effects = getEffectsFromJson(parsed);
            } catch {
              effects = [];
            }
            return (
              <FormItem>
                <FormLabel>Effects</FormLabel>
                <FormControl>
                  <div className="rounded-md border p-4 min-h-[200px]">
                    <SkillEffectsEditor
                      value={effects}
                      onChange={(newEffects) =>
                        field.onChange(
                          JSON.stringify(createEffectsJson(newEffects), null, 2)
                        )
                      }
                      mode="adjustment"
                    />
                  </div>
                </FormControl>
                <FormDescription>
                  Add stat bonuses or custom effects. Stat bonuses modify
                  character stats; custom notes display as-is (e.g., restrictions).
                </FormDescription>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags JSON (optional)</FormLabel>
              <FormControl>
                <Textarea className="min-h-[100px] font-mono text-xs" {...field} />
              </FormControl>
              <FormDescription>
                Optional metadata or labels as JSON.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Save Adjustment</Button>
        </div>
      </form>
    </Form>
  );
}

