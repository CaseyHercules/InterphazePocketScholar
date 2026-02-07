"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Item,
  CreateItemInput,
  ITEM_TYPES,
  ItemData,
} from "@/types/item";
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
import { Checkbox } from "@/components/ui/checkbox";
import { SkillEffectsEditor } from "@/components/SkillEffectsEditor";
import { getEffectsFromJson, type SkillEffect } from "@/types/skill-effects";

const VISIBILITY_ROLE_OPTIONS = ["SPELLWRIGHT", "ADMIN", "SUPERADMIN"] as const;

const ItemFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(256),
  description: z.string().default(""),
  type: z.enum(ITEM_TYPES as unknown as [string, ...string[]]).optional(),
  quantity: z.coerce.number().min(0).default(1),
  data: z
    .object({
      adjustmentId: z.string().optional(),
      inlineEffects: z.object({ effects: z.array(z.any()) }).optional(),
      weapon: z
        .object({
          damage: z.string().optional(),
          range: z.string().optional(),
          properties: z.string().optional(),
        })
        .optional(),
      consumable: z
        .object({
          effect: z.string().optional(),
          uses: z.coerce.number().optional(),
        })
        .optional(),
    })
    .optional(),
  visibilityRoles: z
    .array(z.enum(VISIBILITY_ROLE_OPTIONS))
    .default([]),
});

type ItemFormValues = z.infer<typeof ItemFormSchema>;

interface AdjustmentOption {
  id: string;
  title: string;
}

interface ItemFormProps {
  initialItem?: Item | null;
  adjustments?: AdjustmentOption[];
  onSubmit: (item: CreateItemInput) => Promise<void>;
  onCancel?: () => void;
}

export function ItemForm({
  initialItem,
  adjustments = [],
  onSubmit,
  onCancel,
}: ItemFormProps) {
  const data = initialItem?.data as ItemData | undefined;
  const initialEffects: SkillEffect[] = Array.isArray(data?.inlineEffects?.effects)
    ? (getEffectsFromJson({ effects: data.inlineEffects.effects }) ?? [])
    : [];

  const form = useForm<ItemFormValues>({
    resolver: zodResolver(ItemFormSchema),
    defaultValues: {
      title: initialItem?.title ?? "",
      description: initialItem?.description ?? "",
      type: (initialItem?.type as ItemFormValues["type"]) ?? undefined,
      quantity: initialItem?.quantity ?? 1,
      data: {
        adjustmentId: data?.adjustmentId ?? "",
        inlineEffects: { effects: initialEffects },
        weapon: data?.weapon ?? {},
        consumable: data?.consumable ?? {},
      },
      visibilityRoles: (initialItem?.visibilityRoles ?? []) as (typeof VISIBILITY_ROLE_OPTIONS)[number][],
    },
  });

  const selectedType = form.watch("type");

  const handleSubmit = async (values: ItemFormValues) => {
    try {
      const formatted: CreateItemInput = {
        title: values.title,
        description: values.description || undefined,
        type: values.type,
        quantity: values.quantity,
      data: {
        adjustmentId:
            values.data?.adjustmentId &&
            values.data.adjustmentId.length > 0 &&
            values.data.adjustmentId !== "none"
              ? values.data.adjustmentId
              : undefined,
        inlineEffects:
          Array.isArray(values.data?.inlineEffects?.effects) &&
          values.data.inlineEffects.effects.length > 0
            ? { effects: values.data.inlineEffects.effects }
            : undefined,
        weapon:
            values.data?.weapon &&
            (values.data.weapon.damage ||
              values.data.weapon.range ||
              values.data.weapon.properties)
              ? values.data.weapon
              : undefined,
        consumable:
            values.data?.consumable &&
            (values.data.consumable.effect || values.data.consumable.uses != null)
              ? values.data.consumable
              : undefined,
        },
        visibilityRoles: values.visibilityRoles ?? [],
      };
      await onSubmit(formatted);
      toast({
        title: "Success",
        description: initialItem ? "Item updated successfully" : "Item created successfully",
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to save item";
      toast({
        title: "Error",
        description: message,
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
                      <Input placeholder="Enter item name..." {...field} />
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
                    <FormLabel>Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ITEM_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.replace(/_/g, " ")}
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
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter item description..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="visibilityRoles"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Visibility Roles</FormLabel>
                  <FormDescription>
                    Leave empty to make this item public.
                  </FormDescription>
                  <div className="flex flex-wrap gap-3">
                    {VISIBILITY_ROLE_OPTIONS.map((role) => (
                      <label
                        key={role}
                        className="flex items-center gap-2 text-sm"
                      >
                        <Checkbox
                          checked={field.value?.includes(role)}
                          onCheckedChange={(checked) => {
                            const next = new Set(field.value ?? []);
                            if (checked) next.add(role);
                            else next.delete(role);
                            field.onChange(Array.from(next));
                          }}
                        />
                        {role}
                      </label>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
            <p className="text-sm text-muted-foreground">
              Type-specific fields and linked adjustment.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="data.inlineEffects"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Inline Effects</FormLabel>
                  <FormControl>
                    <div className="rounded-md border p-4 min-h-[120px]">
                      <SkillEffectsEditor
                        value={Array.isArray(field.value?.effects) ? field.value.effects : []}
                        onChange={(newEffects) =>
                          field.onChange({ effects: newEffects })
                        }
                        mode="adjustment"
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Stat bonuses and notes stored on this item. Preferred over linked adjustment when both exist.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {adjustments.length > 0 && (
              <FormField
                control={form.control}
                name="data.adjustmentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Linked Adjustment</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? "none"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="None" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {adjustments.map((adj) => (
                          <SelectItem key={adj.id} value={adj.id}>
                            {adj.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      When this item is in a character inventory, the linked adjustment can be applied.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {selectedType === "WEAPON" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="data.weapon.damage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Damage</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 1d6" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="data.weapon.range"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Range</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 30 ft" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="data.weapon.properties"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Properties</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Finesse, Light" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
            {selectedType === "CONSUMABLE" && (
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="data.consumable.effect"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Effect</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Describe the consumable effect" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="data.consumable.uses"
                  render={({ field }) => (
                    <FormItem className="max-w-[120px]">
                      <FormLabel>Uses</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-3">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit">
            {initialItem ? "Update Item" : "Create Item"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
