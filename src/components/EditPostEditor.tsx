"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { UpdateValidator, UpdateRequest } from "@/lib/validators/post";
import type EditorJS from "@editorjs/editorjs";
import { z } from "zod";
import { uploadFiles } from "@/lib/uploadthing";
import { toast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { usePathname, useRouter } from "next/navigation";
import { FC } from "react";
import _ from "lodash";

type FormData = z.infer<typeof UpdateValidator>;

interface EditorProps {
  topicId: string;
  formId: string;
  content?: any;
  title: string;
}

//ref.current?.blocks.insert("text", "asdkjfghaskdfgk");

export const EditPostEditor: FC<EditorProps> = ({
  topicId,
  formId,
  content,
  title,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(UpdateValidator),
    defaultValues: {
      topicId,
      title: "",
      content: null,
      id: formId,
    },
  });

  const ref = useRef<EditorJS>();
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const _titleRef = useRef<HTMLTextAreaElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  const initializeEditor = useCallback(async () => {
    const EditorJS = (await import("@editorjs/editorjs")).default;
    const Header = (await import("@editorjs/header")).default;
    const Embed = (await import("@editorjs/embed")).default;
    const Table = (await import("@editorjs/table")).default;
    const List = (await import("@editorjs/list")).default;
    const Code = (await import("@editorjs/code")).default;
    const LinkTool = (await import("@editorjs/link")).default;
    const InlineCode = (await import("@editorjs/inline-code")).default;
    const ImageTool = (await import("@editorjs/image")).default;

    if (!ref.current) {
      const editor = new EditorJS({
        holder: "editor",
        onReady() {
          ref.current = editor;
        },
        placeholder: "Type here to write your post...",
        inlineToolbar: true,
        data: content,
        tools: {
          header: Header,
          linkTool: {
            class: LinkTool,
            config: {
              endpoint: "/api/link",
            },
          },
          image: {
            class: ImageTool,
            config: {
              uploader: {
                async uploadByFile(file: File) {
                  // upload to uploadthing
                  const [res] = await uploadFiles([file], "imageUploader");

                  return {
                    success: 1,
                    file: {
                      url: res.fileUrl,
                    },
                  };
                },
              },
            },
          },
          list: List,
          code: Code,
          inlineCode: InlineCode,
          table: Table,
          embed: Embed,
        },
      });
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsMounted(true);
    }
  }, []);

  useEffect(() => {
    if (Object.keys(errors).length) {
      for (const [_key, value] of Object.entries(errors)) {
        toast({
          title: "There was an error!",
          description: (value as { message: string }).message,
          variant: "destructive",
        });
      }
    }
  }, [errors]);

  useEffect(() => {
    const init = async () => {
      await initializeEditor();
      setTimeout(() => {
        _titleRef?.current?.focus();
        _titleRef!.current!.value = title;
      }, 0);
    };
    if (isMounted) {
      init();
      return () => {
        ref.current?.destroy();
        ref.current = undefined;
      };
    }
  }, [isMounted, initializeEditor]);

  const { mutate: updatePost } = useMutation({
    mutationFn: async ({ title, content, topicId, id }: UpdateRequest) => {
      const playload: UpdateRequest = {
        title,
        content,
        topicId,
        id,
      };
      const { data } = await axios.post("/api/admin/post/update", playload);
      return data;
    },
    onError: (err) => {
      return toast({
        title: "Error",
        description: "Post was not created. Please try again later.",
        variant: "destructive",
      });
    },
    onSuccess: (data) => {
      const newPath = pathname.split("/").slice(0, -1).join("/");
      router.push(newPath);
      router.refresh();
      return toast({
        description: "Post has been updated!",
        variant: "default",
      });
    },
  });

  async function onSubmit(data: FormData) {
    const blocks = await ref.current?.save();
    const payload: UpdateRequest = {
      title: data.title,
      content: blocks,
      topicId,
      id: formId,
    };
    updatePost(payload);
  }

  if (!isMounted) {
    return null;
  }

  const { ref: titleRef, ...titleProps } = register("title");

  return (
    <div className="w-full p-4 bg-stone-50 rounded-lg border border-stone-100">
      <form id={formId} className="w-git" onSubmit={handleSubmit(onSubmit)}>
        <div className="prose prose-stone dark:prose-invert">
          <TextareaAutosize
            ref={(e) => {
              titleRef(e);
              // @ts-ignore
              _titleRef.current = e;
            }}
            {...titleProps}
            placeholder="Title"
            className="w-full resize-none appearance-none overflow-hidden bg-transparent text-5xl font-bold focus:outline-none"
          />
          <div id="editor" className="min-h-[10px]" />
        </div>
      </form>
    </div>
  );
};
