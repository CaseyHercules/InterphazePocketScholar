import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { getVisibilityWhere } from "@/lib/visibility";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const visibilityWhere = getVisibilityWhere(session?.user?.role);
    const items = await db.item.findMany({
      where: {
        ...visibilityWhere,
        archived: false,
      },
      orderBy: {
        title: "asc",
      },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
      },
    });

    return NextResponse.json(items);
  } catch {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
