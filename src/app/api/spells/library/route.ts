import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { getSpellLibraryWhere } from "@/lib/spell-queries";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const spells = await prisma.spell.findMany({
      where: getSpellLibraryWhere(session.user.role),
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
      },
    });

    return NextResponse.json(spells);
  } catch {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
