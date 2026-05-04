import Link from "next/link";
import { Icons } from "@/components/ui/icons";
import { buttonVariants } from "./ui/button";
import { getAuthSession } from "@/lib/auth";
import UserAccountNav from "./UserAccountNav";
import { MenuWide, MenuSmall } from "@/components/Menu";
import { db } from "@/lib/db";

const NavBar = async () => {
  const session = await getAuthSession();
  const UserObj = session?.user
    ? await db.user.findFirst({
        where: { id: session?.user?.id },
      })
    : null;

  return (
    <div className="h-fit w-full border-b border-zinc-300 bg-zinc-100 py-2">
      <div className="container mx-auto flex h-full max-w-7xl items-center justify-between gap-2 px-3 sm:px-4">
        <div className="flex w-full items-center justify-between gap-2 md:hidden">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <MenuSmall />
            <Link
              href="/"
              className="flex min-w-0 items-center gap-2 text-zinc-800 no-underline"
            >
              <Icons.logo className="h-8 w-11 shrink-0" aria-hidden />
              <span className="truncate text-base font-semibold tracking-tight sm:text-lg">
                Interphaze
              </span>
            </Link>
          </div>
          {session?.user ? (
            <UserAccountNav user={UserObj!} />
          ) : (
            <Link href="/login" className={buttonVariants({ size: "sm" })}>
              Login
            </Link>
          )}
        </div>

        <div className="hidden h-full w-full items-center justify-between gap-4 md:flex">
          <Link href="/" className="flex items-center gap-2 text-zinc-800 no-underline">
            <Icons.logo className="h-10 w-14 shrink-0" aria-hidden />
            <span className="text-xl font-medium text-zinc-700">Interphaze</span>
          </Link>

          <div className="flex items-center gap-4">
            <MenuWide />
            {session?.user ? (
              <UserAccountNav user={UserObj!} />
            ) : (
              <Link href="/login" className={buttonVariants()}>
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavBar;
