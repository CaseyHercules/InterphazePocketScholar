"use client";

import { ExtenededPost } from "@/types/db";
import { FC, useRef } from "react";
import { useIntersection } from "@mantine/hooks";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";
import Post from "./Post";
import { INFINITE_SCROLL_PAGINATION_RESULTS } from "@/config";
import { Role } from "@prisma/client";

interface PostListProps {
  initialPosts: ExtenededPost[];
  topicName?: string;
  userRole?: Role;
}

const PostList: FC<PostListProps> = ({ initialPosts, topicName, userRole }) => {
  const lastPostRef = useRef<HTMLElement>(null);
  const { ref, entry } = useIntersection({
    root: lastPostRef.current,
    threshold: 1,
  });

  const { data: session } = useSession();

  const { data, fetchNextPage, isFetchingNextPage } = useInfiniteQuery(
    ["useInfiniteQuery"],
    async ({ pageParam = 1 }) => {
      const query =
        `/api/posts?limit=${10}&page=${pageParam}` +
        (!!topicName ? `&topic=${topicName}` : "");
      const { data } = await axios.get(query);
      return data as ExtenededPost[];
    },
    {
      getNextPageParam: (_, pages) => {
        return pages.length + 1;
      },
      initialData: {
        pages: [initialPosts],
        pageParams: [INFINITE_SCROLL_PAGINATION_RESULTS],
      },
    }
  );

  //view extra params on posts
  const vxp =
    userRole === Role.ADMIN ||
    userRole === Role.SUPERADMIN ||
    userRole === Role.MODERATOR
      ? true
      : false;

  const posts = data?.pages.flatMap((page) => page) ?? initialPosts;

  return (
    <ul className="flex flex-col col-span-2 space-y-6">
      {posts.map((post, index) => {
        if (index === posts.length - 1) {
          return (
            <li key={post.id} ref={ref}>
              <Post
                topicName={post.Topic.title}
                post={post}
                viewExtraParams={vxp}
              />
            </li>
          );
        } else {
          return (
            <li key={"d"}>
              <Post
                topicName={post.Topic.title}
                post={post}
                viewExtraParams={vxp}
              />
            </li>
          );
        }
      })}
    </ul>
  );
};

export default PostList;
