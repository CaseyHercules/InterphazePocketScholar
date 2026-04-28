import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";

type SpellbookPayload = {
  id?: string;
  name?: string;
  spellIds?: string[];
  styleId?: string;
};

async function requireAdmin() {
  const session = await getAuthSession();
  const user = session?.user
    ? await db.user.findFirst({ where: { id: session.user.id } })
    : null;

  if (!session?.user || !(user?.role === Role.ADMIN || user?.role === Role.SUPERADMIN)) {
    return null;
  }

  return user;
}

export async function GET() {
  const user = await requireAdmin();
  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const spellbooks = await db.spellbook.findMany({
    where: { createdById: user.id },
    orderBy: [{ updatedAt: "desc" }],
  });

  return NextResponse.json(spellbooks);
}

export async function POST(req: Request) {
  const user = await requireAdmin();
  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const body = (await req.json()) as SpellbookPayload;
  const name = (body.name || "").trim();
  const spellIds = Array.isArray(body.spellIds) ? body.spellIds : [];

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const created = await db.spellbook.create({
    data: {
      name,
      spellIds,
      styleId: body.styleId || null,
      createdById: user.id,
    },
  });

  return NextResponse.json(created);
}

export async function PUT(req: Request) {
  const user = await requireAdmin();
  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const body = (await req.json()) as SpellbookPayload;
  const id = (body.id || "").trim();
  const name = (body.name || "").trim();
  const spellIds = Array.isArray(body.spellIds) ? body.spellIds : [];

  if (!id || !name) {
    return NextResponse.json({ error: "ID and name are required" }, { status: 400 });
  }

  const updated = await db.spellbook.updateMany({
    where: { id, createdById: user.id },
    data: {
      name,
      spellIds,
      styleId: body.styleId || null,
    },
  });

  if (updated.count === 0) {
    return NextResponse.json({ error: "Spellbook not found" }, { status: 404 });
  }

  const spellbook = await db.spellbook.findUnique({ where: { id } });
  return NextResponse.json(spellbook);
}

export async function DELETE(req: Request) {
  const user = await requireAdmin();
  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = (searchParams.get("id") || "").trim();
  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }

  const deleted = await db.spellbook.deleteMany({
    where: { id, createdById: user.id },
  });

  if (deleted.count === 0) {
    return NextResponse.json({ error: "Spellbook not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
