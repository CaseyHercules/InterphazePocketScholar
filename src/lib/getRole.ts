import { Role } from "@prisma/client"
import { Session } from "next-auth"
import { db } from "./db"

export async function getRole(session: Session | null): Promise<Role> {
    const UserObj = session?.user ? await db.user.findFirst({
        where: { id: session?.user?.id },
      }) : null;
      const role = UserObj?.role ?? "USER";
      return role;
  }