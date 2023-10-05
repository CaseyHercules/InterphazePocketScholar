import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Role } from "@prisma/client";

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
        },
        orderBy: {
          title: "asc",
        },
        take: 10,
      },
    },
  });

  const UserObj = await db.user.findFirst({
    where: { id: session?.user?.id },
  });

  // if (!topic) return notFound();

  return (
    <>
      <h1 className="font-bold text-3xl md:text-4xl h-14">
        Page title: {slug}
      </h1>
      <p>topic if exists: {topic?.title}</p>

      {UserObj?.role != Role.USER ? (
        <div>Create Post Button</div>
      ) : (
        <div>Not Authed</div>
      )}

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
