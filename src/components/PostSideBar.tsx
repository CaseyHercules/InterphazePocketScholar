import type { Post } from "@prisma/client";
import { FC } from "react";

interface PostSideBarProps {
  postList?: Post[];
}

const PostSideBar: FC<PostSideBarProps> = ({ postList }) => {
  postList?.sort((a, b) => {
    if (a.title > b.title) {
      return 1;
    } else {
      return -1;
    }
  });
  return (
    <ul className="flex flex-col space-y-1">
      {postList?.map((post) => (
        <li key={post.id}>
          {/* @ts-ignore */}
          <a href={`/${post.Topic.title}/${post.id}`}>
            <h1 className="underline capitalize text-md py-2 leading-6 text-zinc-500">
              {post.title}
            </h1>
          </a>
        </li>
      ))}
    </ul>
  );
};

export default PostSideBar;
