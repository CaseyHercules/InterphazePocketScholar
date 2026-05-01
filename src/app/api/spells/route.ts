import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/db";
import {
  CreateSpellInput,
  UpdateSpellInput,
  type SpellPublicationStatus,
  SPELL_PUBLICATION_STATUSES,
} from "@/types/spell";
import { authOptions } from "@/lib/auth";
import { canReviewSpells, getSpellBrowseWhere } from "@/lib/spell-queries";
import {
  createSpellRecord,
} from "@/lib/spell-create";
import { parseSpellPublicationStatus } from "@/lib/spell-status";
import {
  prismaSpellReviewColumns,
  spellStatusShouldRecordReviewer,
} from "@/lib/staff-approval";

function getPublicationStatus(value?: string): SpellPublicationStatus | undefined {
  return parseSpellPublicationStatus(value);
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: CreateSpellInput = await req.json();

    const result = await createSpellRecord(body, {
      actingAsReviewer: canReviewSpells(session.user.role),
      reviewerUserId: session.user.id,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(result.spell);
  } catch {
    return NextResponse.json(
      { error: "Error creating spell" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const spells = await prisma.spell.findMany({
      where: getSpellBrowseWhere(session.user.role),
      orderBy: [
        {
          level: "asc",
        },
        {
          title: "asc",
        },
      ],
      select: {
        id: true,
        title: true,
        description: true,
        level: true,
        type: true,
        data: true,
        author: true,
        publicationStatus: true,
        supersedesSpellId: true,
        reworkedAt: true,
        createdAt: true,
        visibilityRoles: true,
        reviewedByUserId: true,
        reviewedAt: true,
      },
    });

    const formattedSpells = spells.map((spell) => {
      if (spell.data && typeof spell.data === "object") {
        try {
          const data = spell.data as any;
        } catch (e) {
          console.error("Error parsing spell data", e);
        }
      }

      return {
        id: spell.id,
        title: spell.title,
        // Keep name for any legacy consumers still expecting it.
        name: spell.title,
        description: spell.description || "",
        level: spell.level,
        type: spell.type || undefined,
        author: spell.author ?? undefined,
        publicationStatus: spell.publicationStatus,
        supersedesSpellId: spell.supersedesSpellId ?? undefined,
        reworkedAt: spell.reworkedAt ?? undefined,
        createdAt: spell.createdAt ?? undefined,
        visibilityRoles: spell.visibilityRoles,
        data: spell.data ?? undefined,
        reviewedByUserId: spell.reviewedByUserId ?? undefined,
        reviewedAt: spell.reviewedAt ?? undefined,
      };
    });

    return NextResponse.json(formattedSpells);
  } catch (error) {
    console.error("[GET /api/spells]", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        error: "Internal Error",
        message: process.env.NODE_ENV === "development" ? message : undefined,
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!canReviewSpells(session.user.role)) {
      return NextResponse.json(
        { error: "Only spell reviewers can update spells" },
        { status: 403 }
      );
    }

    const body: UpdateSpellInput = await req.json();
    const {
      id,
      type,
      characterId,
      visibilityRoles,
      publicationStatus,
      author,
      supersedesSpellId,
      reworkedAt,
      ...updateData
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Spell ID is required" },
        { status: 400 }
      );
    }

    const status = getPublicationStatus(publicationStatus);
    if (publicationStatus && !status) {
      return NextResponse.json(
        { error: "Invalid publication status" },
        { status: 400 }
      );
    }

    const reviewStamp =
      status && spellStatusShouldRecordReviewer(status)
        ? prismaSpellReviewColumns(session.user.id)
        : {};

    const spell = await prisma.spell.update({
      where: { id },
      data: {
        ...updateData,
        data: updateData.data
          ? JSON.parse(JSON.stringify(updateData.data))
          : undefined,
        type: type || null,
        characterId: characterId || null,
        author: author === undefined ? undefined : author || null,
        supersedesSpellId:
          supersedesSpellId === undefined ? undefined : supersedesSpellId || null,
        reworkedAt:
          reworkedAt === undefined
            ? undefined
            : reworkedAt
            ? new Date(reworkedAt)
            : null,
        ...(status ? { publicationStatus: status } : {}),
        ...(visibilityRoles ? { visibilityRoles: visibilityRoles as Role[] } : {}),
        ...reviewStamp,
      },
    });

    return NextResponse.json(spell);
  } catch (error) {
    console.error("Error updating spell:", error);
    return NextResponse.json(
      { error: "Error updating spell" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!canReviewSpells(session.user.role)) {
      return NextResponse.json(
        { error: "Only spell reviewers can delete spells" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Spell ID is required" },
        { status: 400 }
      );
    }

    await prisma.spell.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Error deleting spell" },
      { status: 500 }
    );
  }
}
