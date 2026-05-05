import EditorOutput from "@/components/EditorOutput";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { Post, Role, User } from "@prisma/client";
import Link from "next/link";
import { notFound } from "next/navigation";
import EditButtonOnPosts from "@/components/EditButtonOnPosts";
import SkillEmbedTableServer from "@/components/SkillEmbedTableServer";
import { normalizePostContent } from "@/lib/post-content/normalize";

interface pageProps {
  params: Promise<{ slug: string; postId: string }>;
}

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

const page = async ({ params }: pageProps) => {
  const { slug, postId } = await params;

  const session = await getAuthSession();
  const UserObj = session?.user
    ? await db.user.findFirst({
        where: { id: session?.user?.id },
      })
    : null;

  const decodedSlug = decodeURIComponent(slug);
  const topic = await db.topic.findFirst({
    where: {
      title: { equals: decodedSlug, mode: "insensitive" },
    },
  });

  if (!topic) return notFound();

  const post = await db.post.findFirst({
    where: {
      id: postId,
      topicId: topic.id,
    },
    include: {
      Topic: true,
      User: true,
    },
  });

  if (!post) return notFound();

  const siblingPosts = await db.post.findMany({
    where: {
      topicId: topic.id,
      NOT: { id: post.id },
    },
    select: {
      id: true,
      title: true,
    },
    orderBy: {
      title: "asc",
    },
  });

  const quickNavigationLinks = siblingPosts.map((siblingPost) => ({
    label:
      siblingPost.title.length > 28
        ? `${siblingPost.title.slice(0, 25)}...`
        : siblingPost.title,
    href: `/${slug}/${siblingPost.id}`,
  }));

  const normalizedPostContent = normalizePostContent(post.content);
  const embedClassName = normalizedPostContent.skillTableClassName;
  const classRecord = embedClassName
    ? await db.class.findFirst({
        where: {
          Title: {
            equals: embedClassName,
            mode: "insensitive",
          },
        },
        include: {
          skills: {
            include: {
              class: true,
            },
          },
        },
      })
    : null;

  return (
    <>
      <div>
        <div className="h-full flex flex-col sm:flex-row items-center sm:items-start justify-between">
          <div className="post-letter sm:w-0 w-full flex-1 bg-stone-50/90 border border-stone-200/80 shadow-sm p-6 sm:p-8 rounded-sm">
            <h1 className="text-2xl font-semibold leading-7 text-amber-950 pb-4">
              {post?.title}
            </h1>

            <EditorOutput
              content={post?.content}
              dynamicLayout
              quickNavigationLinks={quickNavigationLinks}
            />

            {UserObj?.role === Role.ADMIN ||
            UserObj?.role === Role.SUPERADMIN ||
            UserObj?.role === Role.MODERATOR ? (
              <div className="mt-8 flex flex-wrap items-center justify-end gap-4 border-t border-stone-200/80 pt-6">
                <Link
                  className="text-sm font-medium text-amber-950 underline underline-offset-2"
                  href={`/${slug.toLowerCase()}/create`}
                >
                  Create
                </Link>
                <EditButtonOnPosts
                  topictitle={post.Topic.title}
                  postId={postId}
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {embedClassName && (
        <div className="w-full">
          <SkillEmbedTableServer
            classTitle={classRecord?.Title ?? embedClassName}
            skills={classRecord?.skills ?? []}
          />
        </div>
      )}
    </>
  );
};

export default page;
