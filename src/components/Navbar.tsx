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
    <div className="w-full h-fit bg-zinc-100 border-b border-zinc-300 py-2">
      <div className="sm:hidden container h-full mx-auto flex items-center justify-between gap-2">
        <MenuSmall />
        <div className="flex items-center">
          <Link href="/" className="h-full gap-2">
            <Icons.logo className="h-10 w-14 sm:h-10 sm:w-14 " />
          </Link>
        </div>
        {session?.user ? (
          <UserAccountNav user={UserObj!} />
        ) : (
          <Link href="/login" className={buttonVariants()}>
            Login
          </Link>
        )}
      </div>
      <div className="md-lg:hidden container max-w-7xl h-full mx-auto flex items-center justify-between gap-2">
        <Link href="/" className="flex gap-2 items-center">
          <Icons.logo className="hidden h-10 w-14 sm:h-10 sm:w-14 sm:block" />
          <p className="hidden text-zinc-700 text-xl font-medium md:block">
            Pocket Scholar
          </p>
        </Link>

        <div className="flex gap-4 items-center ml-0">
          <MenuWide />

          {/* search bar */}
          {session?.user ? (
            <div className="hidden sm:block">
              <UserAccountNav user={UserObj!} />
            </div>
          ) : (
            <div className="hidden sm:block">
              <Link href="/login" className={buttonVariants()}>
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
