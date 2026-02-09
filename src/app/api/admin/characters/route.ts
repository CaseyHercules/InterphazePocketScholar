import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { Prisma, Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { adjustmentMatchesRace } from "@/lib/utils/adjustments";

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

export async function GET(req: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const unassigned = searchParams.get("unassigned") === "true";
    const userId = searchParams.get("userId") ?? undefined;

    const where: Prisma.CharacterWhereInput = {};
    if (unassigned) {
      where.userId = null;
    }
    if (userId) {
      where.userId = userId;
    }

    const characters = await db.character.findMany({
      where,
      select: {
        id: true,
        name: true,
        primaryClassId: true,
        secondaryClassId: true,
        primaryClassLvl: true,
        secondaryClassLvl: true,
        userId: true,
        phazians: true,
        primaryClass: { select: { Title: true } },
        secondaryClass: { select: { Title: true } },
        user: {
          select: { id: true, name: true, email: true, username: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(characters);
  } catch {
    return new NextResponse("Failed to fetch characters", { status: 500 });
  }
}

const createBodySchema = {
  name: (v: unknown) => typeof v === "string" && v.trim().length > 0,
  race: (v: unknown) => typeof v === "string" && v.trim().length > 0,
  primaryClassId: (v: unknown) => v == null || typeof v === "string",
  primaryClassLvl: (v: unknown) =>
    typeof v === "number" && Number.isInteger(v) && v >= 1,
  secondaryClassId: (v: unknown) => v == null || typeof v === "string",
  secondaryClassLvl: (v: unknown) =>
    typeof v === "number" && Number.isInteger(v) && v >= 0,
  phazians: (v: unknown) =>
    typeof v === "number" && Number.isInteger(v) && v >= 0,
  userId: (v: unknown) => v == null || (typeof v === "string" && v.length > 0),
  claimEmail: (v: unknown) => v == null || (typeof v === "string" && v.trim().length >= 0),
  attributes: (v: unknown) => v == null || typeof v === "object",
  notes: (v: unknown) => v == null || typeof v === "object",
  inlineEffectsJson: (v: unknown) => v == null || typeof v === "object",
};

function normalizeClaimEmail(v: unknown): string | null {
  if (v == null || typeof v !== "string") return null;
  const t = v.trim().toLowerCase();
  return t.length > 0 && t.includes("@") ? t : null;
}

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    if (
      !createBodySchema.name(body.name) ||
      !createBodySchema.race(body.race) ||
      !createBodySchema.primaryClassLvl(body.primaryClassLvl) ||
      !createBodySchema.secondaryClassLvl(body.secondaryClassLvl) ||
      !createBodySchema.phazians(body.phazians) ||
      !createBodySchema.userId(body.userId)
    ) {
      return new NextResponse("Invalid body: name, race, primaryClassLvl, secondaryClassLvl, phazians required", {
        status: 400,
      });
    }

    if (body.userId) {
      const userExists = await db.user.findUnique({
        where: { id: body.userId },
        select: { id: true },
      });
      if (!userExists) {
        return new NextResponse("User not found", { status: 404 });
      }
    }

    let matchingRaceAdjustmentId: string | null = null;
    if (body.race?.trim()) {
      const raceAdjustments = await db.adjustment.findMany({
        where: { sourceType: "RACE", archived: false },
        select: { id: true, title: true, tags: true },
      });
      const matching = raceAdjustments.find((a: { title?: string; tags?: unknown }) =>
        adjustmentMatchesRace(a, body.race)
      );
      if (matching?.id) matchingRaceAdjustmentId = matching.id;
    }

    const inlineEffectsJson =
      body.inlineEffectsJson != null && typeof body.inlineEffectsJson === "object"
        ? (body.inlineEffectsJson as Record<string, unknown>)
        : null;

    const character = await db.$transaction(async (tx) => {
      const created = await tx.character.create({
        data: {
          name: body.name.trim(),
          primaryClassId: body.primaryClassId?.trim() || null,
          primaryClassLvl: body.primaryClassLvl ?? 1,
          secondaryClassId:
            body.secondaryClassId === "none" || !body.secondaryClassId?.trim()
              ? null
              : body.secondaryClassId.trim(),
          secondaryClassLvl: body.secondaryClassLvl ?? 0,
          Attributes: {
            ...(body.attributes || {}),
            race: body.race.trim(),
          },
          notes: body.notes || {},
          phazians: body.phazians ?? 0,
          userId: body.userId?.trim() || null,
          claimEmail: normalizeClaimEmail(body.claimEmail),
          inlineEffectsJson:
            inlineEffectsJson === null
              ? Prisma.JsonNull
              : (inlineEffectsJson as Prisma.InputJsonValue),
        },
      });

      if (matchingRaceAdjustmentId) {
        await tx.characterAdjustment.upsert({
          where: {
            characterId_adjustmentId: {
              characterId: created.id,
              adjustmentId: matchingRaceAdjustmentId,
            },
          },
          create: { characterId: created.id, adjustmentId: matchingRaceAdjustmentId },
          update: {},
        });
      }

      return created;
    });

    return NextResponse.json({
      id: character.id,
      characterId: character.id,
    });
  } catch {
    return new NextResponse("Failed to create character", { status: 500 });
  }
}
