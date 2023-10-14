import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { Role } from "@prisma/client";
import { SkillValidator, UpdateValidator } from "@/lib/validators/skill";

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    const user = session?.user
      ? await db.user.findFirst({
          where: { id: session?.user?.id },
        })
      : null;

    if (
      !session?.user ||
      !(user?.role === Role.ADMIN || user?.role === Role.SUPERADMIN)
    ) {
      return new Response("Unauthorized", { status: 401 });
    }
    let id: string;
    let title: string;
    let description: string;
    let descriptionShort: string;
    let tier: number;
    let parentSkillId: string;
    let skillGroupId: string;
    let prerequisiteSkills: string[];
    let permenentEpReduction: number;
    let epCost: string;
    let activation: string;
    let duration: string;
    let canBeTakenMultiple: any;
    let playerVisable: any;
    let additionalInfo: string[];

    const body = await req.json();
    if (body["id"]) {
      const {
        id,
        title,
        description,
        descriptionShort,
        tier,
        parentSkillId,
        skillGroupId,
        prerequisiteSkills,
        permenentEpReduction,
        epCost,
        activation,
        duration,
        canBeTakenMultiple,
        playerVisable,
        additionalInfo,
      } = UpdateValidator.parse(body);
      await db.skill.update({
        where: { id },
        data: {
          title,
          description,
          descriptionShort,
          tier: Number(tier),
          parentSkillId,
          skillGroupId,
          prerequisiteSkills: {},
          permenentEpReduction: Number(permenentEpReduction),
          epCost,
          activation,
          duration,
          canBeTakenMultiple: canBeTakenMultiple === "true" ? true : false,
          playerVisable: playerVisable === "true" ? true : false,
          additionalInfo: {},
        },
      });
    } else {
      const {
        title,
        description,
        descriptionShort,
        tier,
        parentSkillId,
        skillGroupId,
        prerequisiteSkills,
        permenentEpReduction,
        epCost,
        activation,
        duration,
        canBeTakenMultiple,
        playerVisable,
        additionalInfo,
      } = SkillValidator.parse(body);

      await db.skill.create({
        data: {
          title,
          description,
          descriptionShort,
          tier: Number(tier),
          parentSkillId,
          skillGroupId,
          prerequisiteSkills: JSON.parse(prerequisiteSkills),
          permenentEpReduction: Number(permenentEpReduction),
          epCost,
          activation,
          duration,
          canBeTakenMultiple: canBeTakenMultiple === "true" ? true : false,
          playerVisable: playerVisable === "true" ? true : false,
          additionalInfo: JSON.parse(additionalInfo),
        },
      });
    }

    return new Response("OK");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 422 });
    }

    return new Response(
      "Couldn't process this skill request, please try again later",
      { status: 500 }
    );
  }
}
