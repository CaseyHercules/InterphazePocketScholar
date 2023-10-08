import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Role } from "@prisma/client";
import CreatePostMini from "@/components/CreatePostMini";
import PostList from "@/components/PostList";
import { INFINITE_SCROLL_PAGINATION_RESULTS } from "@/config";
import { Console } from "console";
import { getRole } from "@/lib/getRole";

interface pageProps {
  params: {
    slug: string;
  };
}

const page = async ({ params }: pageProps) => {
  const { slug } = params;
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
    <>
      <h1 className="font-bold text-3xl md:text-4xl h-14">
        {topic?.shortDesc ? topic?.shortDesc : topic?.title}
      </h1>
      <PostList
        initialPosts={topic.posts}
        topicName={topic.title}
        userRole={UserRole}
      />

      {/* <ul>
        {topic.posts.map((post) => (
          <li key={post.id}>
            <h2>{post.title}</h2>
            <p>{post.User.name}</p>
          </li>
        ))}
      </ul> */}
    </>
  );
};

export default page;
