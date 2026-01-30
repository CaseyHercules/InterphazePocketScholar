import { z } from "zod";

const ROLE_VALUES = [
  "USER",
  "ADMIN",
  "SUPERADMIN",
  "SPELLWRIGHT",
  "MODERATOR",
] as const;

const statArrayValidator = z.array(z.number().min(0).nullable()).length(20);
const skillTierValidator = z.array(z.number().min(0).max(4)).length(20);

export const ClassValidator = z.object({
  Title: z
    .string()
    .min(3, { message: "Title must be longer than 3 characters" })
    .max(64, { message: "Title must be at most 64 characters" }),
  description: z.string(),
  grantedSkills: z.array(z.string()),
  Skills: z.array(z.string()),
  SkillTierGains: skillTierValidator,
  HP: statArrayValidator,
  EP: statArrayValidator,
  Attack: statArrayValidator,
  Accuracy: statArrayValidator,
  Defense: statArrayValidator,
  Resistance: statArrayValidator,
  Tough: statArrayValidator,
  Mind: statArrayValidator,
  Quick: statArrayValidator,
  visibilityRoles: z.array(z.enum(ROLE_VALUES)).optional(),
});

export type ClassRequest = z.infer<typeof ClassValidator>;

export const UpdateValidator = ClassValidator.extend({
  id: z.string(),
});

export type UpdateRequest = z.infer<typeof UpdateValidator>;

export const DeleteValidator = z.object({
  id: z.string(),
});

export type DeleteRequest = z.infer<typeof DeleteValidator>;
