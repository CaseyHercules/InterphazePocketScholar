import { buttonVariants } from "@/components/ui/button";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { Role } from "@prisma/client";
import PostSideBar from "@/components/PostSideBar";
import PostSearchbar from "@/components/PostSearchbar";

const Layout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  const session = await getAuthSession();
  const UserObj = session?.user
    ? await db.user.findFirst({
        where: { id: session?.user?.id },
      })
    : null;

  // Decode the slug and make the query case-insensitive
  const decodedSlug = decodeURIComponent(slug);

  const topic = await db.topic.findFirst({
    where: {
      title: {
        equals: decodedSlug,
        mode: "insensitive",
      },
    },
    include: {
      posts: {
        include: {
          Topic: true,
          User: true,
        },
      },
    },
  });

  // If no topic is found, we should handle this case
  if (!topic) {
    return (
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 h-full">
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold">Topic not found</h2>
          <p className="text-zinc-500">
            The requested topic could not be found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 h-full">
      <div>
        {/* Button to back */}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:map-x-4 py-8">
          <div className="contents">{children}</div>

          <div className="overflow-hidden h-fit rounded-lg border border-gray-200 order-first md:order-last md:row-start-1 md:col-span-1 md:col-start-4">
            <p className="font-semibold pt-2 text-center capitalize">
              Quick Navigation
            </p>
            <div className="px-4 pt-2">
              <PostSearchbar />
            </div>
            <div className="px-6 py-2">
              <PostSideBar postList={topic.posts} />
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
                  href={`/${slug.toLowerCase()}/create`}
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
