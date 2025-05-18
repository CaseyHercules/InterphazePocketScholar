"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { PostRequest, PostValidator } from "@/lib/validators/post";
import { z } from "zod";
import { useUploadThing } from "@/lib/uploadthing";
import { toast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { usePathname, useRouter } from "next/navigation";
import { FC } from "react";
import "quill/dist/quill.snow.css";
import "@/styles/quill.css";
import type Quill from "quill";

type FormData = z.infer<typeof PostValidator>;

interface EditorProps {
  topicId: string;
  formId: string;
  content?: any;
}

export const Editor: FC<EditorProps> = ({ topicId, formId, content }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(PostValidator),
    defaultValues: {
      topicId,
      title: "",
      content: null,
    },
  });

  const quillRef = useRef<Quill>();
  const editorRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const _titleRef = useRef<HTMLTextAreaElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { startUpload } = useUploadThing("imageUploader");

  const initializeEditor = useCallback(async () => {
    if (!editorRef.current) return;

    const { default: Quill } = await import("quill");

    const toolbarOptions = [
      ["bold", "italic", "underline", "strike"],
      ["blockquote", "code-block"],
      [{ header: 1 }, { header: 2 }],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ script: "sub" }, { script: "super" }],
      [{ indent: "-1" }, { indent: "+1" }],
      ["link", "image"],
      ["clean"],
    ];

    const quill = new Quill(editorRef.current, {
      modules: {
        toolbar: toolbarOptions,
      },
      placeholder: "Type here to write your post...",
      theme: "snow",
    });

    // Handle image upload
    const toolbar = quill.getModule("toolbar") as {
      addHandler: (type: string, handler: () => void) => void;
    };
    toolbar.addHandler("image", async () => {
      const input = document.createElement("input");
      input.setAttribute("type", "file");
      input.setAttribute("accept", "image/*");
      input.click();

      input.onchange = async () => {
        const file = input.files?.[0];
        if (file) {
          try {
            const res = await startUpload([file]);
            if (res?.[0]?.url) {
              const range = quill.getSelection(true);
              quill.insertEmbed(range.index, "image", res[0].url);
            }
          } catch (error) {
            toast({
              title: "Error uploading image",
              description: "Please try again later",
              variant: "destructive",
            });
          }
        }
      };
    });

    quillRef.current = quill;
  }, [startUpload]);

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
    if (isMounted) {
      initializeEditor();
      setTimeout(() => {
        _titleRef?.current?.focus();
      }, 0);

      return () => {
        if (quillRef.current) {
          quillRef.current = undefined;
        }
      };
    }
  }, [isMounted, initializeEditor]);

  const { mutate: createPost } = useMutation({
    mutationKey: ["createPost"],
    mutationFn: async ({ title, content, topicId }: PostRequest) => {
      const payload: PostRequest = {
        title,
        content,
        topicId,
      };
      const { data } = await axios.post("/api/admin/post/create", payload);
      return data;
    },
    onError: () => {
      return toast({
        title: "Error",
        description: "Post was not created. Please try again later.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      const newPath = pathname.split("/").slice(0, -1).join("/");
      router.push(newPath);
      router.refresh();
      return toast({
        description: "Post has been published!",
        variant: "default",
      });
    },
  });

  async function onSubmit(data: FormData) {
    if (!quillRef.current) return;

    const content = {
      type: "doc",
      content: quillRef.current.getContents(),
    };

    const payload: PostRequest = {
      title: data.title,
      content,
      topicId,
    };
    createPost(payload);
  }

  if (!isMounted) {
    return null;
  }

  const { ref: titleRef, ...titleProps } = register("title");

  return (
    <div className="w-full p-4 bg-card rounded-lg border border-border">
      <form id={formId} className="w-full" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-4">
          <TextareaAutosize
            ref={(e) => {
              titleRef(e);
              // @ts-ignore
              _titleRef.current = e;
            }}
            {...titleProps}
            placeholder="Title"
            className="w-full resize-none appearance-none overflow-hidden bg-transparent text-4xl font-bold focus:outline-none"
          />
          <div className="quill">
            <div ref={editorRef} className="min-h-[350px]" />
          </div>
        </div>
      </form>
    </div>
  );
};
