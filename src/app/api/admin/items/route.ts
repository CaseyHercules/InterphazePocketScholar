import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { Prisma, Role, ItemType } from "@prisma/client";
import {
  CreateItemValidator,
  UpdateItemValidator,
} from "@/lib/validators/item";
import { getVisibilityWhere } from "@/lib/visibility";

async function requireAdmin() {
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
    return { authorized: false as const, session: null, user: null };
  }
  return { authorized: true as const, session, user };
}

export async function GET(req: Request) {
  try {
    const { authorized, session } = await requireAdmin();
    if (!authorized || !session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const includeArchived = searchParams.get("includeArchived") === "true";

    const visibilityWhere = getVisibilityWhere(session.user.role);
    const hasVisibilityFilter = Object.keys(visibilityWhere).length > 0;

    const baseWhere: Prisma.ItemWhereInput = {
      characterId: null,
      ...(includeArchived ? {} : { archived: false }),
    };

    const finalWhere: Prisma.ItemWhereInput = hasVisibilityFilter
      ? { AND: [baseWhere, visibilityWhere] }
      : baseWhere;

    const items = await db.item.findMany({
      where: finalWhere,
      orderBy: { title: "asc" },
    });

    return new Response(JSON.stringify(items), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Failed to fetch items",
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
    const { authorized } = await requireAdmin();
    if (!authorized) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();

    if (body.id) {
      const validatedData = UpdateItemValidator.parse(body);
      const { id, ...updateData } = validatedData;

      const item = await db.item.update({
        where: { id },
        data: {
          title: updateData.title,
          description: updateData.description ?? undefined,
          type: (updateData.type as ItemType) ?? undefined,
          quantity: updateData.quantity ?? 1,
          data: updateData.data
            ? JSON.parse(JSON.stringify(updateData.data))
            : undefined,
          visibilityRoles: (updateData.visibilityRoles ?? []) as Role[],
        },
      });

      return new Response(JSON.stringify(item), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const validatedData = CreateItemValidator.parse(body);

    const item = await db.item.create({
      data: {
        title: validatedData.title,
        description: validatedData.description ?? undefined,
        type: validatedData.type ?? undefined,
        quantity: validatedData.quantity ?? 1,
        characterId: null,
        data: validatedData.data
          ? JSON.parse(JSON.stringify(validatedData.data))
          : undefined,
        visibilityRoles: (validatedData.visibilityRoles ?? []) as Role[],
      },
    });

    return new Response(JSON.stringify(item), {
      headers: { "Content-Type": "application/json" },
    });
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
        error: "Could not process item request",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export async function PUT(req: Request) {
  return POST(req);
}

export async function DELETE(req: Request) {
  try {
    const { authorized } = await requireAdmin();
    if (!authorized) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return new Response("Item ID is required", { status: 400 });
    }

    await db.item.update({
      where: { id },
      data: { archived: true },
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Could not archive item",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
