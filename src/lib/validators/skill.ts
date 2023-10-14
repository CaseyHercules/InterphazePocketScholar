import { z } from "zod";

export const SkillValidator = z.object({
  title: z
    .string()
    .min(3, { message: "Title must be longer than 3 characters" })
    .max(64, { message: "Title must be at most 64 characters" }),
  description: z.string(),
  descriptionShort: z.string(),
  tier: z.string().max(1),
  parentSkillId: z.string(),
  skillGroupId: z.string(),
  prerequisiteSkills: z.any(),
  permenentEpReduction: z.string().max(2),
  epCost: z.string(),
  activation: z.string(),
  duration: z.string(),
  abilityCheck: z.string(),
  canBeTakenMultiple: z.string(),
  playerVisable: z.string(),
  additionalInfo: z.any(),
});

export type SkillRequest = z.infer<typeof SkillValidator>;

export const UpdateValidator = z.object({
  id: z.string(),
  title: z
    .string()
    .min(3, { message: "Title must be longer than 3 characters" })
    .max(64, { message: "Title must be at most 64 characters" }),
  description: z.string(),
  descriptionShort: z.string(),
  tier: z.string().max(1),
  parentSkillId: z.string(),
  skillGroupId: z.string(),
  prerequisiteSkills: z.any(),
  permenentEpReduction: z.string().max(2),
  epCost: z.string(),
  activation: z.string(),
  duration: z.string(),
  abilityCheck: z.string(),
  canBeTakenMultiple: z.string(),
  playerVisable: z.string(),
  additionalInfo: z.any(),
});

export type UpdateRequest = z.infer<typeof UpdateValidator>;

export const DeleteValidator = z.object({
  id: z.string(),
});

export type DeleteRequest = z.infer<typeof DeleteValidator>;

// model Skill {
//     id                   String      @id @default(cuid())
//     title                String
//     description          String?
//     descriptionShort     String?
//     tier                 Int
//     parentSkillId        String?
//     skillGroupId         String?
//     prerequisiteSkills   Json?
//     permenentEpReduction Int
//     epCost               String
//     activation           String
//     duration             String
//     abilityCheck         String?
//     canBeTakenMultiple   Boolean     @default(false)
//     playerVisable        Boolean     @default(true)
//     additionalInfo       Json?
//     chararacterId        String?
//     parentSkill          Skill?      @relation("RelatedSkills", fields: [parentSkillId], references: [id], onDelete: NoAction, onUpdate: NoAction)
//     childSkills          Skill[]     @relation("RelatedSkills")
//     skillGrouping        SkillGroup? @relation(fields: [skillGroupId], references: [id])
//     characterSkills      Character?  @relation(fields: [chararacterId], references: [id], onDelete: NoAction, onUpdate: NoAction)

//     @@index([skillGroupId])
//     @@index([parentSkillId])
//     @@index([chararacterId])
//   }
