import EditorOutput from "@/components/EditorOutput";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { Post, Role, User } from "@prisma/client";
import { notFound } from "next/navigation";
import EditButtonOnPosts from "@/components/EditButtonOnPosts";
import SkillEmbedTableServer from "@/components/SkillEmbedTableServer";

interface pageProps {
  params: {
    postId: string;
  };
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
  let post: (Post & { User: User }) | null = null;

  const session = await getAuthSession();
  const UserObj = session?.user
    ? await db.user.findFirst({
        where: { id: session?.user?.id },
      })
    : null;

  post = await db.post.findFirst({
    where: {
      id: params.postId,
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
          <div className="sm:w-0 w-full flex-1 bg-white p-4 rounded-sm">
            <p className="max-h-40 mt-1 truncate text-xs text-gray-500">
              {UserObj?.role === Role.ADMIN ||
              UserObj?.role === Role.SUPERADMIN ||
              UserObj?.role === Role.MODERATOR ? (
                <EditButtonOnPosts
                  //@ts-expect-error
                  topictitle={post.Topic.title}
                  postId={params.postId}
                />
              ) : null}
            </p>

            <h1 className="text-2xl font-semibold py-2 leading-6 text-gray-900">
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
