import { buttonVariants } from "@/components/ui/button";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { Role } from "@prisma/client";
import PostSideBar from "@/components/PostSideBar";
import PostSearchbar from "@/components/PostSearchbar";

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
          Topic: true,
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
            <p className="font-semibold pt-2 text-center capitalize">
              Quick Navigation
            </p>
            <div className="px-4 pt-2">
              <PostSearchbar />
            </div>
            <div className="px-6 py-2">
              <PostSideBar postList={topic?.posts} />
            </div>
            <dl className="divide-y divide-opacity-10 px-4 text-sm leading-6 bg-white pb-4">
              {UserObj?.role === Role.ADMIN ||
              UserObj?.role === Role.SUPERADMIN ||
              UserObj?.role === Role.MODERATOR ? (
                <Link
                  className={buttonVariants({
                    variant: "outline",
                    className: "w-full",
                  })}
                  href={`/${slug}/create`}
                >
                  Create Post
                </Link>
              ) : null}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
