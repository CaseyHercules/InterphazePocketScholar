import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import PostList from "@/components/PostList";
import { INFINITE_SCROLL_PAGINATION_RESULTS } from "@/config";
import { getRole } from "@/lib/getRole";

interface pageProps {
  params: Promise<{
    slug: string;
  }>;
}

const page = async ({ params }: pageProps) => {
  const { slug } = await params;
  const session = await getAuthSession();

  const topic = await db.topic.findFirst({
    where: { title: slug },
    include: {
      posts: {
        include: {
          User: true,
          Topic: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: INFINITE_SCROLL_PAGINATION_RESULTS,
      },
    },
  });

  const UserRole = await getRole(session);

  if (!topic) return notFound();

  return (
    <div className="col-span-1 md:col-span-3 md:row-start-1 flex flex-col space-y-6">
      <h1 className="font-bold text-3xl md:text-4xl h-14">
        {topic?.shortDesc ? topic?.shortDesc : topic?.title}
      </h1>
      <PostList
        initialPosts={topic.posts}
        topicName={topic.title}
        userRole={UserRole}
      />
    </div>
  );
};

export default page;
