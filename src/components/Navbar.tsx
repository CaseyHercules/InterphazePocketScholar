import Link from "next/link";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/ui/icons";
import { buttonVariants } from "./ui/button";
import { getAuthSession } from "@/lib/auth";
import UserAccountNav from "./UserAccountNav";
import { MenuWide, MenuSmall } from "@/components/Menu";
import { db } from "@/lib/db";

const loginClasses = cn(
  buttonVariants({ variant: "outline", size: "sm" }),
  "post-letter border-stone-300 bg-white text-stone-700 shadow-none ring-0 hover:border-amber-400/60 hover:bg-amber-50/90 hover:text-stone-900 focus-visible:ring-amber-400/30"
);

const NavBar = async () => {
  const session = await getAuthSession();
  const UserObj = session?.user
    ? await db.user.findFirst({
        where: { id: session?.user?.id },
      })
    : null;

  return (
    <div className="h-fit w-full bg-transparent px-2 py-2 sm:px-3">
      <div className="container mx-auto flex h-full items-center justify-between gap-2 md:hidden">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <MenuSmall />
          <Link
            href="/"
            className="flex min-w-0 items-center gap-2 text-amber-950 no-underline"
          >
            <Icons.logo className="h-8 w-11 shrink-0 sm:h-10 sm:w-14" aria-hidden />
            <span className="post-letter truncate text-base font-semibold tracking-wide text-amber-900/90">
              Interphaze
            </span>
          </Link>
        </div>
        {session?.user ? (
          <UserAccountNav user={UserObj!} />
        ) : (
          <Link href="/login" className={loginClasses}>
            Login
          </Link>
        )}
      </div>
      <div className="mx-auto hidden h-full max-w-[1000px] items-center justify-between gap-2 md:flex">
        <Link href="/" className="flex items-center gap-2 text-amber-950 no-underline">
          <Icons.logo className="h-10 w-14 shrink-0" aria-hidden />
          <p className="post-letter text-xl font-semibold tracking-wide text-amber-900/85">
            Interphaze
          </p>
        </Link>

        <div className="ml-0 flex items-center gap-1 sm:gap-2">
          <MenuWide />

          {session?.user ? (
            <div className="hidden sm:block">
              <UserAccountNav user={UserObj!} />
            </div>
          ) : (
            <div className="hidden sm:block">
              <Link href="/login" className={loginClasses}>
                Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NavBar;
