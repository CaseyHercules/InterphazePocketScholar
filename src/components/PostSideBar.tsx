import type { Post, Topic, User } from "@prisma/client";
import { FC } from "react";

interface PostSideBarProps {
  postList?: (Post & {
    Topic: Topic;
    User: User;
  })[];
}

const PostSideBar: FC<PostSideBarProps> = ({ postList }) => {
  const sortedPosts = postList?.sort((a, b) => {
    if (a.title > b.title) {
      return 1;
    } else {
      return -1;
    }
  });

  if (!sortedPosts || sortedPosts.length === 0) {
    return (
      <div className="text-center text-zinc-500 py-2">No posts available</div>
    );
  }

  return (
    <ul className="flex flex-col space-y-1">
      {sortedPosts.map((post) => (
        <li key={post.id}>
          <a href={`/${post.Topic.title.toLowerCase()}/${post.id}`}>
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
