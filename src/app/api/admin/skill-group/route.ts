import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";

export async function GET() {
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

    const skillGroups = await db.skillGroup.findMany({
      orderBy: { title: "asc" },
    });

    return new Response(JSON.stringify(skillGroups), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching skill groups:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to fetch skill groups",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
