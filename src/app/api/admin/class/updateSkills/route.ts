import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { Role } from "@prisma/client";

// Simple validator for skill updates only
const UpdateSkillsValidator = z.object({
  id: z.string(),
  grantedSkills: z.array(z.string()),
  Skills: z.array(z.string()),
});

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

    try {
      // Validate the update data
      const validatedData = UpdateSkillsValidator.parse(body);
      const { id, grantedSkills, Skills } = validatedData;

      // Get the current class data to preserve other fields
      const existingClass = await db.class.findUnique({
        where: { id },
      });

      if (!existingClass) {
        return new Response("Class not found", { status: 404 });
      }

      try {
        // Update only the skills fields
        const updated = await db.class.update({
          where: { id },
          data: {
            grantedSkills,
            Skills,
          },
        });

        return new Response(JSON.stringify(updated), {
          headers: { "Content-Type": "application/json" },
        });
      } catch {
        return new Response("Failed to update class skills in database", {
          status: 500,
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
      "Could not process this class skills update, please try again later",
      { status: 500 }
    );
  }
}
