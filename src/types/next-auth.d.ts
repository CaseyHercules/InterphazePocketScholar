import type { Session, User } from "next-auth";
import type { JWT } from "next-auth/jwt";
import type { Role } from "@prisma/client";

type UserId = string;

declare module "next-auth/jwt" {
  interface JWT {
    id: UserId;
    username?: string | null;
    role?: Role;
    isAdmin?: boolean;
    isRoot?: boolean;
    isSpellWright?: boolean;
    isModerator?: boolean;
  }
}

declare module "next-auth" {
  interface Session {
    user: User & {
      id: UserId;
      username?: string | null;
      role?: Role;
      isAdmin?: boolean;
      isRoot?: boolean;
      isSpellWright?: boolean;
      isModerator?: boolean;
    };
  }
}
