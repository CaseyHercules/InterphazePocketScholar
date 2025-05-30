"use client";
import { FC, useEffect } from "react";
import { User } from "@prisma/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import Link from "next/link";
import UserAvatar from "./UserAvatar";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface UserAccountNavProps {
  user?: User;
}

const UserAccountNav: FC<UserAccountNavProps> = ({ user }) => {
  const router = useRouter();

  useEffect(() => {
    if (!user?.name) {
      signOut({
        callbackUrl: `${window.location.origin}/login`,
      });
    }
  }, [user?.name]);

  if (!user?.name) {
    return null; // Don't render anything while redirecting
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <UserAvatar
          className="h-10 w-10"
          user={{ name: user?.name || null, image: user?.image || null }}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-background" align="end">
        <div className="flex items-start justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            {user?.name && <p className="font-medium">{user.name}</p>}
            {user?.email && (
              <p className="w-[200px] truncate text-sm text-muted-foreground">
                {user.email}
              </p>
            )}
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/passport">Passport</Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/requests">Specific Requests</Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/settings">Settings</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {user?.role === "SUPERADMIN" && (
          <DropdownMenuItem asChild>
            <Link href="/superadmin">SuperAdmin</Link>
          </DropdownMenuItem>
        )}
        {(user?.role === "ADMIN" || user?.role === "SUPERADMIN") && (
          <DropdownMenuItem asChild>
            <Link href="/admin">Admin Panel</Link>
          </DropdownMenuItem>
        )}
        {(user?.role === "ADMIN" ||
          user?.role === "SUPERADMIN" ||
          user?.role === "SPELLWRIGHT") && (
          <>
            <DropdownMenuItem asChild>
              <Link href="/spellwright">Spell and Item Management</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem
          className="cursor-pointer"
          onSelect={(event) => {
            event.preventDefault();
            signOut({
              callbackUrl: `${window.location.origin}/login`,
            });
          }}
        >
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserAccountNav;
