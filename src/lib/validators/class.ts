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
  Attributes: z.any(),
});

export type ClassRequest = z.infer<typeof ClassValidator>;

export const UpdateValidator = z.object({
  id: z.string(),
  title: z
    .string()
    .min(3, { message: "Title must be longer than 3 characters" })
    .max(64, { message: "Title must be at most 64 characters" }),
  description: z.string().nullish(),
  grantedSkills: z.any(),
  Skills: z.any(),
  SkillTierGains: z.any(),
  Attributes: z.any(),
});

export type UpdateRequest = z.infer<typeof UpdateValidator>;

export const DeleteValidator = z.object({
  id: z.string(),
});

export type DeleteRequest = z.infer<typeof DeleteValidator>;

// model Class {
//     id                  String      @id @default(cuid())
//     Title               String
//     description         String?
//     grantedSkills       Json?
//     Skills              Json?
//     SkillTierGains      Json?
//     Attributes          Json?
//     primaryCharacters   Character[] @relation("PrimaryClass")
//     secondaryCharacters Character[] @relation("SecondaryClass")

//     @@index([Title])
//   }
