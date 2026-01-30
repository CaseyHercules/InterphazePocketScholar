import { z } from "zod";

const ROLE_VALUES = [
  "USER",
  "ADMIN",
  "SUPERADMIN",
  "SPELLWRIGHT",
  "MODERATOR",
] as const;

// Skill effect schemas for structured additionalInfo
const StatBonusEffectSchema = z.object({
  type: z.literal("stat_bonus"),
  stat: z.string(),
  value: z.number(),
  condition: z.string().optional(),
  applyToTotal: z.boolean().optional(),
});

const SkillModifierEffectSchema = z.object({
  type: z.literal("skill_modifier"),
  targetSkillId: z.string(),
  targetField: z.enum(["epCost", "permenentEpReduction", "activation", "duration"]),
  modifier: z.union([z.number(), z.string()]),
});

const GrantSkillEffectSchema = z.object({
  type: z.literal("grant_skill"),
  classId: z.string().optional(),
  skillId: z.string().optional(),
  skillIds: z.array(z.string()).optional(),
  maxTier: z.number().min(1).max(4).optional(),
});

const PickSkillByTierEffectSchema = z.object({
  type: z.literal("pick_skill_by_tier"),
  maxTier: z.number().min(1).max(4),
});

const SkillEffectSchema = z.discriminatedUnion("type", [
  StatBonusEffectSchema,
  SkillModifierEffectSchema,
  GrantSkillEffectSchema,
  PickSkillByTierEffectSchema,
]);

// Structured additionalInfo schema (object with effects and notes)
const StructuredAdditionalInfoSchema = z.object({
  effects: z.array(SkillEffectSchema).optional(),
  notes: z.string().optional(),
});

// additionalInfo can be: string (legacy), array (legacy), null, or structured object
// We use z.any() with a custom refinement for flexibility while still validating structured objects
const AdditionalInfoSchema = z.any().optional().superRefine((val, ctx) => {
  // Allow null, undefined, strings, and arrays (legacy formats)
  if (val == null || typeof val === "string" || Array.isArray(val)) {
    return;
  }
  
  // If it's an object, try to validate as structured additionalInfo
  if (typeof val === "object") {
    const result = StructuredAdditionalInfoSchema.safeParse(val);
    if (!result.success) {
      result.error.issues.forEach((issue) => {
        ctx.addIssue({
          ...issue,
          path: ["additionalInfo", ...issue.path],
        });
      });
    }
  }
});

export const SkillValidator = z.object({
  title: z
    .string()
    .min(3, { message: "Title must be longer than 3 characters" })
    .max(128, { message: "Title must be at most 128 characters" }),
  description: z.string().optional(),
  descriptionShort: z.string().optional(),
  tier: z.number().min(1).max(4),
  parentSkillId: z.string().optional(),
  skillGroupId: z.string().optional(),
  classId: z.string().optional(),
  prerequisiteSkills: z.any().optional(),
  permenentEpReduction: z.number().min(0).max(15),
  epCost: z.string(),
  activation: z.string(),
  duration: z.string(),
  abilityCheck: z.string().optional(),
  canBeTakenMultiple: z.boolean(),
  playerVisable: z.boolean(),
  visibilityRoles: z.array(z.enum(ROLE_VALUES)).optional(),
  additionalInfo: AdditionalInfoSchema,
});

export type SkillRequest = z.infer<typeof SkillValidator>;

export const UpdateValidator = z.object({
  id: z.string(),
  title: z
    .string()
    .min(3, { message: "Title must be longer than 3 characters" })
    .max(128, { message: "Title must be at most 128 characters" }),
  description: z.string().optional(),
  descriptionShort: z.string().optional(),
  tier: z.number().min(1).max(4),
  parentSkillId: z.string().optional(),
  skillGroupId: z.string().optional(),
  classId: z.string().optional(),
  prerequisiteSkills: z.any().optional(),
  permenentEpReduction: z.number().min(0).max(15),
  epCost: z.string(),
  activation: z.string(),
  duration: z.string(),
  abilityCheck: z.string().optional(),
  canBeTakenMultiple: z.boolean(),
  playerVisable: z.boolean(),
  visibilityRoles: z.array(z.enum(ROLE_VALUES)).optional(),
  additionalInfo: AdditionalInfoSchema,
});

export type UpdateRequest = z.infer<typeof UpdateValidator>;

export const DeleteValidator = z.object({
  id: z.string(),
});

export type DeleteRequest = z.infer<typeof DeleteValidator>;
