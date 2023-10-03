import Link from "next/link";
import { Icons } from "@/components/ui/icons";
import { buttonVariants } from "./ui/button";
import { getAuthSession } from "@/lib/auth";
import UserAccountNav from "./UserAccountNav";

const NavBar = async () => {
  const session = await getAuthSession();
  return (
    <div className="fixed top-0 inset-x-0 h-fit bg-zinc-100 border-b border-zinc-300 z-[10] py-2">
      <div className="container max-w-7xl h-full mx-auto flex items-center justify-between gap-2">
        <Link href="/" className="flex gap-2 items-center">
          <Icons.logo className="h-10 w-14 sm:h-10 sm:w-14" />
          <p className="hidden text-zinc-700 text-xl font-medium md:block">
            Pocket Scholar
          </p>
        </Link>

        {/* search bar */}
        {session?.user ? (
          <UserAccountNav user={session.user} />
        ) : (
          <Link href="/login" className={buttonVariants()}>
            Login
          </Link>
        )}
      </div>
    </div>
  );
};

export default NavBar;
