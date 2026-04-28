import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { SPELL_PUBLICATION_STATUS } from "@/types/spell";
import { authOptions } from "@/lib/auth";
import { canReviewSpells } from "@/lib/spell-queries";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!canReviewSpells(session.user.role)) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const spells = await prisma.spell.findMany({
      where: { publicationStatus: SPELL_PUBLICATION_STATUS.IN_REVIEW },
      orderBy: [{ level: "asc" }, { title: "asc" }],
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
      },
    });

    return NextResponse.json(spells);
  } catch {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
