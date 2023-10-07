import { buttonVariants } from "@/components/ui/button";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { Role } from "@prisma/client";
import { User } from "lucide-react";

const Layout = async ({
  children,
  params: { slug },
}: {
  children: React.ReactNode;
  params: { slug: string };
}) => {
  const session = await getAuthSession();
  const UserObj = session?.user
    ? await db.user.findFirst({
        where: { id: session?.user?.id },
      })
    : null;

  const topic = await db.topic.findFirst({
    where: { title: slug },
    include: {
      posts: {
        include: {
          User: true,
        },
      },
    },
  });
  return (
    <div className="sm:container max-w-7xl mx-auto h-full">
      <div>
        {/* Button to back */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:map-x-4 py-8">
          <div className="flex flex-col col-span-2 space-y-6">{children}</div>

          <div className="overflow-hidden h-fit rounded-lg border border-gray-200 order-first md:order-last hidden md:block">
            <div className="px-6">
              <p className="font-semibold py-3 text-center capitalize">
                Quick Navigation
              </p>
            </div>

            <dl className="divide-y divide-opacity-10 px-6 text-sm leading-6 bg-white">
              {UserObj?.role === Role.ADMIN ||
              UserObj?.role === Role.SUPERADMIN ||
              UserObj?.role === Role.MODERATOR ? (
                <Link
                  className={buttonVariants({
                    variant: "outline",
                    className: "w-full mb-6",
                  })}
                  href={`/${slug}/create`}
                >
                  Create Post
                </Link>
              ) : (
                <div></div>
              )}
            </dl>
            <div className="px-6 py-2">Posts go here</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
