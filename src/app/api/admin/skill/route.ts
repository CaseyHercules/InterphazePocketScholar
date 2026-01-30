import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { Role, Prisma } from "@prisma/client";
import {
  SkillValidator,
  UpdateValidator,
} from "@/lib/validators/skill";

export async function GET() {
  try {
    const skills = await db.skill.findMany({
      include: {
        class: true,
        parentSkill: true,
        skillGrouping: true,
      },
      orderBy: {
        title: "asc",
      },
    });

    return new Response(JSON.stringify(skills), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Failed to fetch skills",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

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

    const body = await req.json();

    // Check if this is an update request (has id)
    if (body.id) {
      try {
        const validatedData = UpdateValidator.parse(body);
        const { id, ...updateData } = validatedData;

        const cleanUpdateData: Partial<Prisma.SkillUpdateInput> = {
          title: updateData.title,
          description: updateData.description || undefined,
          descriptionShort: updateData.descriptionShort || undefined,
          tier: updateData.tier ? Number(updateData.tier) : undefined,
          parentSkill: updateData.parentSkillId
            ? { connect: { id: updateData.parentSkillId } }
            : undefined,
          skillGrouping: updateData.skillGroupId
            ? { connect: { id: updateData.skillGroupId } }
            : undefined,
          class: updateData.classId
            ? { connect: { id: updateData.classId } }
            : undefined,
          prerequisiteSkills: updateData.prerequisiteSkills || undefined,
          permenentEpReduction: updateData.permenentEpReduction
            ? Number(updateData.permenentEpReduction)
            : undefined,
          epCost: updateData.epCost || undefined,
          activation: updateData.activation || undefined,
          duration: updateData.duration || undefined,
          abilityCheck: updateData.abilityCheck || undefined,
          canBeTakenMultiple: updateData.canBeTakenMultiple,
          playerVisable: updateData.playerVisable,
          additionalInfo: updateData.additionalInfo || undefined,
          visibilityRoles: updateData.visibilityRoles,
        };

        // Remove undefined values
        const finalUpdateData = Object.fromEntries(
          Object.entries(cleanUpdateData).filter(
            ([, value]) => value !== undefined
          )
        ) as Prisma.SkillUpdateInput;

        const updatedSkill = await db.skill.update({
          where: { id },
          data: finalUpdateData,
          include: {
            class: true,
            parentSkill: true,
            skillGrouping: true,
          },
        });

        return new Response(JSON.stringify(updatedSkill), {
          headers: { "Content-Type": "application/json" },
        });
      } catch (validationError) {
        if (validationError instanceof z.ZodError) {
          return new Response(
            JSON.stringify({
              error: "Validation failed",
              details: validationError.errors,
            }),
            {
              status: 422,
              headers: { "Content-Type": "application/json" },
            }
          );
        }
        throw validationError;
      }
    } else {
      // This is a create request
      try {
        const validatedData = SkillValidator.parse(body);

        const createData: Prisma.SkillCreateInput = {
          title: validatedData.title,
          tier: validatedData.tier ? Number(validatedData.tier) : 1, // Default to 1 if not provided
          permenentEpReduction: validatedData.permenentEpReduction
            ? Number(validatedData.permenentEpReduction)
            : 0, // Default to 0
          epCost: validatedData.epCost, // Don't default to "0"
          activation: validatedData.activation || "None", // Default to "None"
          duration: validatedData.duration || "None", // Default to "None"
          description: validatedData.description || undefined,
          descriptionShort: validatedData.descriptionShort || undefined,
          parentSkill: validatedData.parentSkillId
            ? { connect: { id: validatedData.parentSkillId } }
            : undefined,
          skillGrouping: validatedData.skillGroupId
            ? { connect: { id: validatedData.skillGroupId } }
            : undefined,
          class: validatedData.classId
            ? { connect: { id: validatedData.classId } }
            : undefined,
          prerequisiteSkills: validatedData.prerequisiteSkills || undefined,
          abilityCheck: validatedData.abilityCheck || undefined,
          canBeTakenMultiple: validatedData.canBeTakenMultiple,
          playerVisable: validatedData.playerVisable,
          additionalInfo: validatedData.additionalInfo || undefined,
          visibilityRoles: validatedData.visibilityRoles || [],
        };

        const createdSkill = await db.skill.create({
          data: createData,
          include: {
            class: true,
            parentSkill: true,
            skillGrouping: true,
          },
        });

        return new Response(JSON.stringify(createdSkill), {
          headers: { "Content-Type": "application/json" },
        });
      } catch (validationError) {
        if (validationError instanceof z.ZodError) {
          return new Response(
            JSON.stringify({
              error: "Validation failed",
              details: validationError.errors,
            }),
            {
              status: 422,
              headers: { "Content-Type": "application/json" },
            }
          );
        }
        throw validationError;
      }
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          error: "Validation failed",
          details: error.errors,
        }),
        {
          status: 422,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        error: "Couldn't process this skill request, please try again later",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export async function DELETE(req: Request) {
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

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return new Response("Skill ID is required", { status: 400 });
    }

    await db.skill.delete({
      where: { id },
    });

    return new Response("OK");
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Could not delete this skill",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
