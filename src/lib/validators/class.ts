import { z } from "zod";

export const ClassValidator = z.object({
  title: z
    .string()
    .min(3, { message: "Title must be longer than 3 characters" })
    .max(64, { message: "Title must be at most 64 characters" }),
  description: z.string(),
  grantedSkills: z.any(),
  Skills: z.any(),
  SkillTierGains: z.any(),
  HP: z.any(),
  EP: z.any(),
  Attack: z.any(),
  Accuracy: z.any(),
  Defense: z.any(),
  Resistance: z.any(),
  Tough: z.any(),
  Mind: z.any(),
  Quick: z.any(),
});

export type ClassRequest = z.infer<typeof ClassValidator>;

export const UpdateValidator = z.object({
  id: z.string(),
  title: z
    .string()
    .min(3, { message: "Title must be longer than 3 characters" })
    .max(64, { message: "Title must be at most 64 characters" }),
  description: z.string(),
  grantedSkills: z.any(),
  Skills: z.any(),
  SkillTierGains: z.any(),
  HP: z.any(),
  EP: z.any(),
  Attack: z.any(),
  Accuracy: z.any(),
  Defense: z.any(),
  Resistance: z.any(),
  Tough: z.any(),
  Mind: z.any(),
  Quick: z.any(),
});

export type UpdateRequest = z.infer<typeof UpdateValidator>;

export const DeleteValidator = z.object({
  id: z.string(),
});

export type DeleteRequest = z.infer<typeof DeleteValidator>;
