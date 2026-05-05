import { FC } from "react";
import type { Post, User } from "@prisma/client";
import { formatTimeToNow } from "@/lib/utils";
import EditorOutput from "./EditorOutput";

interface PostProps {
  post: Post & {
    User: User;
  };
  topicName: string;
  viewExtraParams: boolean;
}

const Post: FC<PostProps> = ({ topicName, post, viewExtraParams }) => {
  return (
    <div className="rounded-md bg-white shadow">
      <div className="px-6 py-4 flex justify-between">
        <div className="w-0 flex-1">
          <div className="max-h-40 text-xs text-gray-500">
            {topicName && viewExtraParams ? (
              <>
                <a
                  className="underline text-zinc-900 text-sm underline-offset-2"
                  href={`/${topicName.toLowerCase()}`}
                >
                  {topicName}
                </a>
                <span className="px-1">•</span>
                <span>Posted by {post.User.name}</span>{" "}
                {formatTimeToNow(new Date(post.createdAt))}
              </>
            ) : null}
          </div>

          <a href={`/${topicName.toLowerCase()}/${post.id}`}>
            <h1 className="text-lg font-semibold py-2 leading-6 text-zinc-900">
              {post.title}
            </h1>
          </a>
          <div
            className="relative text-sm max-h-40 w-full overflow-clip"
          >
            <EditorOutput content={post.content} dynamicLayout />
            <div className="pointer-events-none absolute bottom-0 left-0 h-20 w-full bg-gradient-to-t from-white/95 to-transparent"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Post;
