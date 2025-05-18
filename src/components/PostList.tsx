"use client";

import { ExtenededPost } from "@/types/db";
import { FC, useEffect, useRef } from "react";
import { useIntersection } from "@mantine/hooks";
import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import Post from "./Post";
import { INFINITE_SCROLL_PAGINATION_RESULTS } from "@/config";
import { Role } from "@prisma/client";
import { Loader2 } from "lucide-react";

interface PostListProps {
  initialPosts: ExtenededPost[];
  topicName: string;
  userRole: Role;
}

const PostList: FC<PostListProps> = ({ initialPosts, topicName, userRole }) => {
  console.log("Initial Posts:", initialPosts);
  const lastPostRef = useRef<HTMLElement>(null);
  const { ref, entry } = useIntersection({
    root: lastPostRef.current,
    threshold: 1,
  });

  const { data, fetchNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["useInfiniteQuery"],
    queryFn: async ({ pageParam = 1 }) => {
      const query = `/api/posts?limit=${INFINITE_SCROLL_PAGINATION_RESULTS}&page=${pageParam}&topic=${topicName}`;
      const { data } = await axios.get(query);
      return data as ExtenededPost[];
    },
    initialPageParam: 1,
    getNextPageParam: (_, pages) => {
      return pages.length + 1;
    },
    initialData: {
      pages: [initialPosts],
      pageParams: [1],
    },
  });

  useEffect(() => {
    if (entry?.isIntersecting) {
      fetchNextPage();
    }
  }, [entry, fetchNextPage]);

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
                topicName={post.Topic?.title || ""}
                post={post}
                viewExtraParams={vxp}
              />
            </li>
          );
        } else {
          return (
            <Post
              key={post.id}
              topicName={post.Topic?.title || ""}
              post={post}
              viewExtraParams={vxp}
            />
          );
        }
      })}
      {isFetchingNextPage && (
        <li className="flex justify-center">
          <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
        </li>
      )}
    </ul>
  );
};

export default PostList;
