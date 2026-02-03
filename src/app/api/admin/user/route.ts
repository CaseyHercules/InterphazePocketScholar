import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { Prisma, Role } from "@prisma/client";
import { NextResponse } from "next/server";

const ROLES = Object.values(Role);

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

    const users = await db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        image: true,
        UnallocatedLevels: true,
        UnrequestedSkills: true,
        role: true,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(users);
  } catch (error) {
    return new NextResponse("Failed to fetch users", { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await requireAdmin();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const id = typeof body.id === "string" ? body.id.trim() : "";

    if (!id) {
      return new NextResponse("User ID is required", { status: 400 });
    }

    const targetUser = await db.user.findUnique({ where: { id } });
    if (!targetUser) {
      return new NextResponse("User not found", { status: 404 });
    }

    if (body.role !== undefined) {
      if (user.role !== Role.SUPERADMIN) {
        return new NextResponse("Only SUPERADMIN can change roles", {
          status: 403,
        });
      }
      if (!ROLES.includes(body.role)) {
        return new NextResponse("Invalid role", { status: 422 });
      }
    }

    const updateData: Prisma.UserUpdateInput = {};

    if (body.name !== undefined) {
      updateData.name =
        typeof body.name === "string" ? body.name.trim() || null : null;
    }
    if (body.email !== undefined) {
      const email =
        typeof body.email === "string" ? body.email.trim() || null : null;
      if (email) {
        const existing = await db.user.findFirst({
          where: { email, NOT: { id } },
        });
        if (existing) {
          return NextResponse.json(
            { error: "Email already in use" },
            { status: 422 }
          );
        }
      }
      updateData.email = email;
    }
    if (body.username !== undefined) {
      const username =
        typeof body.username === "string"
          ? body.username.trim() || null
          : null;
      if (username) {
        const existing = await db.user.findFirst({
          where: { username, NOT: { id } },
        });
        if (existing) {
          return NextResponse.json(
            { error: "Username already in use" },
            { status: 422 }
          );
        }
      }
      updateData.username = username;
    }
    if (body.UnallocatedLevels !== undefined) {
      const val = Number(body.UnallocatedLevels);
      updateData.UnallocatedLevels = Number.isFinite(val) ? val : 0;
    }
    if (body.UnrequestedSkills !== undefined) {
      const val = Number(body.UnrequestedSkills);
      updateData.UnrequestedSkills = Number.isFinite(val) ? val : 0;
    }
    if (body.role !== undefined) {
      updateData.role = body.role as Role;
    }

    const updated = await db.user.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "Email or username already in use" },
          { status: 422 }
        );
      }
    }
    return new NextResponse("Failed to update user", { status: 500 });
  }
}
