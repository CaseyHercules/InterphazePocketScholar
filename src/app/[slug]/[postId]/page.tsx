import EditorOutput from "@/components/EditorOutput";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatTimeToNow } from "@/lib/utils";
import { Post, Role, User } from "@prisma/client";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DeleteValidator, DeleteRequest } from "@/lib/validators/post";
import axios from "axios";
import EditButtonOnPosts from "@/components/EditButtonOnPosts";

interface pageProps {
  params: {
    postId: string;
  };
}

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

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

  return (
    <div>
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
  );
};

export default page;
