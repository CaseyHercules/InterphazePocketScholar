import { Role } from "@prisma/client";
import { Session } from "next-auth";
import { db } from "./db";

export async function getRole(session: Session | null): Promise<Role> {
  if (!session?.user) {
    return Role.USER;
  }

  const UserObj = await db.user.findFirst({
    where: { id: session.user.id },
  });

  return UserObj?.role ?? Role.USER;
}
