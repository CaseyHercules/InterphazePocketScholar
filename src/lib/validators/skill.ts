import { z } from "zod";

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
  additionalInfo: z.any().optional(),
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
  additionalInfo: z.any().optional(),
});

export type UpdateRequest = z.infer<typeof UpdateValidator>;

export const DeleteValidator = z.object({
  id: z.string(),
});

export type DeleteRequest = z.infer<typeof DeleteValidator>;
