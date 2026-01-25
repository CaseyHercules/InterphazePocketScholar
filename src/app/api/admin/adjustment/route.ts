import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdjustmentSourceType, Role } from "@prisma/client";
import { NextResponse } from "next/server";

const parseJsonValue = (value: unknown, fieldName: string) => {
  if (value === null || value === undefined) {
    throw new Error(`${fieldName} is required`);
  }
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch (error) {
      throw new Error(`${fieldName} must be valid JSON`);
    }
  }
  if (typeof value === "object") {
    return value;
  }
  throw new Error(`${fieldName} must be valid JSON`);
};

const requireAdmin = async () => {
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
    return null;
  }

  return user;
};

export async function GET() {
  try {
    const user = await requireAdmin();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const adjustments = await db.adjustment.findMany({
      orderBy: { title: "asc" },
    });

    return NextResponse.json(adjustments);
  } catch (error) {
    return new NextResponse("Failed to fetch adjustments", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAdmin();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const title = typeof body.title === "string" ? body.title.trim() : "";

    if (!title) {
      return new NextResponse("Title is required", { status: 422 });
    }

    if (!Object.values(AdjustmentSourceType).includes(body.sourceType)) {
      return new NextResponse("Invalid source type", { status: 422 });
    }

    let effectsJson;
    try {
      effectsJson = parseJsonValue(body.effectsJson, "effectsJson");
    } catch (error) {
      return new NextResponse(
        error instanceof Error ? error.message : "Invalid effectsJson",
        { status: 422 }
      );
    }

    let tagsJson = null;
    if (body.tags !== undefined) {
      try {
        tagsJson = parseJsonValue(body.tags, "tags");
      } catch (error) {
        return new NextResponse(
          error instanceof Error ? error.message : "Invalid tags",
          { status: 422 }
        );
      }
    }

    if (body.id) {
      const updated = await db.adjustment.update({
        where: { id: body.id },
        data: {
          title,
          description: body.description ?? null,
          sourceType: body.sourceType,
          effectsJson,
          tags: tagsJson,
          archived: body.archived ?? false,
        },
      });

      return NextResponse.json(updated);
    }

    const created = await db.adjustment.create({
      data: {
        title,
        description: body.description ?? null,
        sourceType: body.sourceType,
        effectsJson,
        tags: tagsJson,
        archived: body.archived ?? false,
      },
    });

    return NextResponse.json(created);
  } catch (error) {
    return new NextResponse("Failed to save adjustment", { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await requireAdmin();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    if (!body.id) {
      return new NextResponse("Adjustment ID is required", { status: 400 });
    }

    const updated = await db.adjustment.update({
      where: { id: body.id },
      data: { archived: Boolean(body.archived) },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return new NextResponse("Failed to update adjustment", { status: 500 });
  }
}

