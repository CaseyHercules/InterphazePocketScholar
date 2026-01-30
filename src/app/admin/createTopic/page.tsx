"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { TopicValidatorPayload } from "@/lib/validators/topics";
import { toast } from "@/hooks/use-toast";
import { useCustomToast } from "@/hooks/use-custom-toast";

const Page = () => {
  const router = useRouter();
  const [title, setTitle] = useState<string>("");
  const { loginToast } = useCustomToast();

  const { mutate: createTopic, isPending } = useMutation({
    mutationKey: ["createTopic"],
    mutationFn: async () => {
      const payload: TopicValidatorPayload = {
        title: title,
      };
      const { data } = await axios.post("/api/admin/topics", payload); //Reconnect to Topics
      return data;
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 400) {
          return toast({
            title: "Request already exists",
            description: "This topic already exists, please try again",
            variant: "destructive",
          });
        }
        if (err.response?.status === 401) {
          return loginToast();
        }
        if (err.response?.status === 422) {
          return toast({
            title: "Invalid request",
            description: "Please enter text for the title",
            variant: "destructive",
          });
        }
      }
      return toast({
        title: "Something went wrong",
        description: "Please try again",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: "Request sent",
        description: "See Create posts, to add to this topic",
        variant: "default",
      });
      router.push("/admin/createTopic");
    },
  });

  return (
    <div className="container flex items-center h-full max-w-3xl mx-auto">
      <div className="relative bg-background w-full h-fit p-4 rounded-lg space-y-6">
        <div className="flex flex-col items-start">
          <h1 className="text-xl font-semibold text-right">Create Topic</h1>
        </div>

        <hr className="bg-foreground h-px" />

        <div>
          {/* <p className="text-lg font-medium">Request Title</p> */}
          <div className="relative pb-4">
            <Input
              value={title}
              placeholder="Title of Topic (e.g. Events, Rules, or Setting info.)"
              onChange={(e) => setTitle(e.target.value)}
              className="pl-2.5"
            />
          </div>
          {/* <p className="text-lg font-medium">Request Type</p>
          <div className="relative pb-4">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="pl-6"
            />
          </div> */}
          {/* <p className="text-lg font-medium">Request description</p> */}
          {/* <div className="relative">
            <Textarea
              value={description}
              placeholder="Please describe your request in detail"
              className="resize-y"
              onChange={(e) => setDesc(e.target.value)}
            />
          </div> */}
        </div>

        <div className="flex justify-center sm:justify-end gap-4">
          <Button
            disabled={isPending}
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            disabled={isPending || title.length === 0}
            onClick={() => createTopic()}
          >
            Submit
          </Button>
        </div>
        <p className="text-xs pb-2 text-center">
          Admin Console Utility, for creating new topics. Should not be used by
          any unless it is inital data load.
        </p>
      </div>
    </div>
  );
};

export default Page;
