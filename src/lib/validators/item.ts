import { z } from "zod";

const ROLE_VALUES = [
  "USER",
  "ADMIN",
  "SUPERADMIN",
  "SPELLWRIGHT",
  "MODERATOR",
] as const;

const ITEM_TYPE_VALUES = [
  "WEAPON",
  "ARMOR",
  "CONSUMABLE",
  "MISC",
  "MAGIC_ITEM",
  "INCARNATE_ITEM",
] as const;

const InlineEffectsSchema = z
  .object({
    effects: z.array(z.any()).optional(),
  })
  .optional();

const ItemDataSchema = z
  .object({
    adjustmentId: z.string().optional(),
    inlineEffects: InlineEffectsSchema,
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
        uses: z.number().optional(),
      })
      .optional(),
    magicItem: z.record(z.string()).optional(),
    incarnateItem: z.record(z.string()).optional(),
  })
  .optional();

export const CreateItemValidator = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(256, "Title must be at most 256 characters"),
  description: z.string().optional(),
  type: z.enum(ITEM_TYPE_VALUES).optional(),
  quantity: z.coerce.number().min(0).default(1),
  data: ItemDataSchema,
  visibilityRoles: z.array(z.enum(ROLE_VALUES)).optional(),
});

export const UpdateItemValidator = CreateItemValidator.extend({
  id: z.string().min(1, "ID is required"),
});

export type CreateItemRequest = z.infer<typeof CreateItemValidator>;
export type UpdateItemRequest = z.infer<typeof UpdateItemValidator>;
