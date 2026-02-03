import EditorOutput from "@/components/EditorOutput";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { Post, Role, User } from "@prisma/client";
import { notFound } from "next/navigation";
import EditButtonOnPosts from "@/components/EditButtonOnPosts";
import SkillEmbedTableServer from "@/components/SkillEmbedTableServer";

interface pageProps {
  params: Promise<{ slug: string; postId: string }>;
}

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

const SKILL_TABLE_TAG_REGEX =
  /\[\[SkillTable\s+class\s*=\s*([^\]]+)\]\]/gi;

const extractSkillTableClass = (content: any) => {
  const scanText = (text: string) => {
    if (!text) return null;
    const match = SKILL_TABLE_TAG_REGEX.exec(text);
    SKILL_TABLE_TAG_REGEX.lastIndex = 0;
    return match?.[1]?.trim() || null;
  };

  if (!content) return null;

  const tryScanOps = (ops: any[]) => {
    for (const op of ops) {
      if (typeof op?.insert === "string") {
        const found = scanText(op.insert);
        if (found) return found;
      }
      if (op?.insert?.skilltable?.className) {
        return String(op.insert.skilltable.className).trim();
      }
    }
    return null;
  };

  if (content?.content?.ops) {
    return tryScanOps(content.content.ops);
  }

  if (content?.ops) {
    return tryScanOps(content.ops);
  }

  if (content?.content && typeof content.content === "string") {
    try {
      const parsed = JSON.parse(content.content);
      if (parsed?.ops) {
        return tryScanOps(parsed.ops);
      }
    } catch {
      return scanText(content.content);
    }
  }

  return null;
};

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

  const embedClassName = extractSkillTableClass(post.content);
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
      <div className="col-span-1 md:col-span-3 md:row-start-1">
        <div className="h-full flex flex-col sm:flex-row items-center sm:items-start justify-between">
          <div className="post-letter sm:w-0 w-full flex-1 bg-stone-50/90 border border-stone-200/80 shadow-sm p-6 sm:p-8 rounded-sm">
            <p className="max-h-40 mt-1 truncate text-xs text-amber-800/70">
              {UserObj?.role === Role.ADMIN ||
              UserObj?.role === Role.SUPERADMIN ||
              UserObj?.role === Role.MODERATOR ? (
                <span className="hidden md:inline-block">
                  <EditButtonOnPosts
                    //@ts-expect-error
                    topictitle={post.Topic.title}
                    postId={postId}
                  />
                </span>
              ) : null}
            </p>

            <h1 className="text-2xl font-semibold py-2 leading-7 text-amber-950">
              {post?.title}
            </h1>

            <EditorOutput content={post?.content} />
          </div>
        </div>
      </div>

      {embedClassName && (
        <div className="col-span-1 md:col-span-4 md:row-start-2">
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
