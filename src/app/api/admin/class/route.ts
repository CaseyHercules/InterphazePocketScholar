import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { Role } from "@prisma/client";
import { ClassValidator, UpdateValidator } from "@/lib/validators/class";
import { NextResponse } from "next/server";

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

    // Ensure SkillTierGains is properly formatted
    if (Array.isArray(body.SkillTierGains)) {
      body.SkillTierGains = body.SkillTierGains.map((tier: any) => {
        const numTier = typeof tier === "number" ? tier : parseInt(tier);
        return isNaN(numTier) ? 0 : Math.min(Math.max(0, numTier), 4);
      });
    }

    try {
      if (body.id) {
        // Validate the update data
        const validatedData = UpdateValidator.parse(body);

        const { id, ...updateData } = validatedData;

        // Convert arrays to JSONB for Prisma - no need to stringify as Prisma handles this
        const prismaData = {
          ...updateData,
          SkillTierGains: updateData.SkillTierGains,
          HP: updateData.HP,
          EP: updateData.EP,
          Attack: updateData.Attack,
          Accuracy: updateData.Accuracy,
          Defense: updateData.Defense,
          Resistance: updateData.Resistance,
          Tough: updateData.Tough,
          Mind: updateData.Mind,
          Quick: updateData.Quick,
          Skills: updateData.Skills,
          grantedSkills: updateData.grantedSkills,
        };

        try {
          const updated = await db.class.update({
            where: { id },
            data: prismaData,
          });

          return new Response(JSON.stringify(updated), {
            headers: { "Content-Type": "application/json" },
          });
        } catch (dbError) {
          return new Response("Failed to update class in database", {
            status: 500,
          });
        }
      } else {
        // Validate the create data
        const validatedData = ClassValidator.parse(body);

        // Convert arrays to JSONB for Prisma - no need to stringify as Prisma handles this
        const prismaData = {
          ...validatedData,
          SkillTierGains: validatedData.SkillTierGains,
          HP: validatedData.HP,
          EP: validatedData.EP,
          Attack: validatedData.Attack,
          Accuracy: validatedData.Accuracy,
          Defense: validatedData.Defense,
          Resistance: validatedData.Resistance,
          Tough: validatedData.Tough,
          Mind: validatedData.Mind,
          Quick: validatedData.Quick,
          Skills: validatedData.Skills,
          grantedSkills: validatedData.grantedSkills,
        };

        const created = await db.class.create({
          data: prismaData,
        });

        return new Response(JSON.stringify(created), {
          headers: { "Content-Type": "application/json" },
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return new Response(error.message, { status: 422 });
      }
      throw error;
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 422 });
    }

    return new Response(
      "Could not process this class request, please try again later",
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const classes = await db.class.findMany({
      select: {
        id: true,
        Title: true,
        description: true,
        grantedSkills: true,
        Skills: true,
        SkillTierGains: true,
        HP: true,
        EP: true,
        Attack: true,
        Accuracy: true,
        Defense: true,
        Resistance: true,
        Tough: true,
        Mind: true,
        Quick: true,
      },
    });

    return NextResponse.json(classes);
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
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
      return new Response("Class ID is required", { status: 400 });
    }

    await db.class.delete({
      where: { id },
    });

    return new Response("OK");
  } catch (error) {
    return new Response("Could not delete this class", { status: 500 });
  }
}
