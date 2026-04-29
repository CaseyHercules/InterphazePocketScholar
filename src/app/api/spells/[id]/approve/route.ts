import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import {
  type SpellPublicationStatus,
} from "@/types/spell";
import { authOptions } from "@/lib/auth";
import { canReviewSpells } from "@/lib/spell-queries";
import { isApprovalPublicationStatus } from "@/lib/spell-status";

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!canReviewSpells(session.user.role)) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const { id } = await params;
    const body = (await req.json()) as {
      publicationStatus?: SpellPublicationStatus;
    };

    if (!id) {
      return NextResponse.json({ error: "Spell ID is required" }, { status: 400 });
    }

    if (!isApprovalPublicationStatus(body.publicationStatus)) {
      return NextResponse.json(
        { error: "Approval requires a published status" },
        { status: 400 }
      );
    }

    const spell = await prisma.spell.update({
      where: { id },
      data: { publicationStatus: body.publicationStatus },
    });

    return NextResponse.json(spell);
  } catch {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
