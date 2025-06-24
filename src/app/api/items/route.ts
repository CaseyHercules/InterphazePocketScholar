import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const items = await db.item.findMany({
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
  } catch (error) {
    console.error("[ITEMS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
