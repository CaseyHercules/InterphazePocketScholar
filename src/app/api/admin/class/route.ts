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
    console.log("API received request body:", body);
    console.log("Request body ID:", body.id);
    console.log("Is update operation:", !!body.id);

    // Ensure SkillTierGains is properly formatted
    if (Array.isArray(body.SkillTierGains)) {
      body.SkillTierGains = body.SkillTierGains.map((tier: any) => {
        const numTier = typeof tier === "number" ? tier : parseInt(tier);
        return isNaN(numTier) ? 0 : Math.min(Math.max(0, numTier), 4);
      });
    }

    try {
      if (body.id) {
        console.log("Updating class with ID:", body.id);

        // Validate the update data
        const validatedData = UpdateValidator.parse(body);
        console.log("Validated update data:", validatedData);

        const { id, ...updateData } = validatedData;

        // Convert arrays to JSONB for Prisma
        const prismaData = {
          ...updateData,
          SkillTierGains: JSON.stringify(updateData.SkillTierGains),
          HP: JSON.stringify(updateData.HP),
          EP: JSON.stringify(updateData.EP),
          Attack: JSON.stringify(updateData.Attack),
          Accuracy: JSON.stringify(updateData.Accuracy),
          Defense: JSON.stringify(updateData.Defense),
          Resistance: JSON.stringify(updateData.Resistance),
          Tough: JSON.stringify(updateData.Tough),
          Mind: JSON.stringify(updateData.Mind),
          Quick: JSON.stringify(updateData.Quick),
          Skills: JSON.stringify(updateData.Skills),
          grantedSkills: JSON.stringify(updateData.grantedSkills),
        };

        console.log("Prisma update data:", prismaData);
        console.log("Updating with ID:", id);

        try {
          const updated = await db.class.update({
            where: { id },
            data: prismaData,
          });

          console.log("Update successful:", updated);
          return new Response(JSON.stringify(updated), {
            headers: { "Content-Type": "application/json" },
          });
        } catch (dbError) {
          console.error("Database update error:", dbError);
          return new Response("Failed to update class in database", {
            status: 500,
          });
        }
      } else {
        console.log("Creating new class");

        // Validate the create data
        const validatedData = ClassValidator.parse(body);
        console.log("Validated create data:", validatedData);

        // Convert arrays to JSONB for Prisma
        const prismaData = {
          ...validatedData,
          SkillTierGains: JSON.stringify(validatedData.SkillTierGains),
          HP: JSON.stringify(validatedData.HP),
          EP: JSON.stringify(validatedData.EP),
          Attack: JSON.stringify(validatedData.Attack),
          Accuracy: JSON.stringify(validatedData.Accuracy),
          Defense: JSON.stringify(validatedData.Defense),
          Resistance: JSON.stringify(validatedData.Resistance),
          Tough: JSON.stringify(validatedData.Tough),
          Mind: JSON.stringify(validatedData.Mind),
          Quick: JSON.stringify(validatedData.Quick),
          Skills: JSON.stringify(validatedData.Skills),
          grantedSkills: JSON.stringify(validatedData.grantedSkills),
        };

        console.log("Prisma create data:", prismaData);

        const created = await db.class.create({
          data: prismaData,
        });

        console.log("Creation successful:", created);
        return new Response(JSON.stringify(created), {
          headers: { "Content-Type": "application/json" },
        });
      }
    } catch (error) {
      console.error("Database operation failed:", error);
      if (error instanceof z.ZodError) {
        return new Response(error.message, { status: 422 });
      }
      throw error;
    }
  } catch (error) {
    console.error("Request processing failed:", error);

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
    console.error("Error fetching classes:", error);
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
    console.error("Error deleting class:", error);
    return new Response("Could not delete this class", { status: 500 });
  }
}
