"use client";

import { FC } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "./ui/context-menu";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import { DeleteRequest } from "@/lib/validators/post";
import { toast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { Button } from "./ui/button";

interface EditButtonOnPostsProps {
  postId: string;
  topictitle: string;
}

const EditButtonOnPosts: FC<EditButtonOnPostsProps> = ({
  postId,
  topictitle,
}) => {
  const router = useRouter();

  const { mutate: handleDelete } = useMutation({
    mutationFn: async ({ id }: DeleteRequest) => {
      const playload: DeleteRequest = {
        id,
      };
      const { data } = await axios.post("/api/admin/post/delete", playload);
      return data;
    },
    onError: () => {
      return toast({
        title: "Error",
        description: "Post was not Deleted. Please try again later.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      router.push(`/${topictitle.toLowerCase()}`);
      return toast({
        description: "Post has been deleted!",
        variant: "default",
      });
    },
  });

  async function onDelete() {
    handleDelete({ id: postId });
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <Link
          className="float-right"
          href={`/${topictitle.toLowerCase()}/${postId}/edit`}
        >
          Edit
        </Link>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem>
          <Button
            className="w-full text-black text-2xl bg-red-600"
            variant={"link"}
            onClick={() => {
              onDelete();
            }}
          >
            {" "}
            Delete
          </Button>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default EditButtonOnPosts;
