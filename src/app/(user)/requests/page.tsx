"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { RequestValidatorPayload } from "@/lib/validators/requests";
import { toast } from "@/hooks/use-toast";
import { useCustomToast } from "@/hooks/use-custom-toast";
import { Textarea } from "@/components/ui/textarea";

const Page = () => {
  const router = useRouter();
  const [title, setTitle] = useState<string>("");
  const [description, setDesc] = useState<string>("");
  const { loginToast } = useCustomToast();

  const { mutate: createRequest, isLoading } = useMutation({
    mutationFn: async () => {
      const payload: RequestValidatorPayload = {
        title: title,
        description: description,
        type: 0,
      };
      const { data } = await axios.post("/api/requests", payload);
      return data;
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 400) {
          return toast({
            title: "Request already exists",
            description: "This request already exists, please try again",
            variant: "destructive",
          });
        }
        if (err.response?.status === 401) {
          return loginToast();
        }
        if (err.response?.status === 422) {
          return toast({
            title: "Invalid request",
            description: "Please enter text for the title and description",
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
    onSuccess: (data) => {
      toast({
        title: "Request sent",
        description: "This reviewed by the Phaze team, Thank you!",
        variant: "default",
      });
      router.push("/requests");
    },
  });

  return (
    <div className="container flex items-center h-full max-w-3xl mx-auto">
      <div className="relative bg-background w-full h-fit p-4 rounded-lg space-y-6">
        <div className="flex flex-col items-start">
          <h1 className="text-xl font-semibold text-right">Make a request</h1>
          <p className="text-s pb-2">
            This can be utilized for spells, special abilities, character
            objectives, or any other enhancements to enrich your experience
            within Phaze
          </p>
        </div>

        <hr className="bg-foreground h-px" />

        <div>
          {/* <p className="text-lg font-medium">Request Title</p> */}
          <div className="relative pb-4">
            <Input
              value={title}
              placeholder="Title of request (e.g. New Spell or Ability)"
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
          <div className="relative">
            <Textarea
              value={description}
              placeholder="Please describe your request in detail"
              className="resize-y"
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-center sm:justify-end gap-4">
          <Button
            disabled={isLoading}
            variant="subtle"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            isLoading={isLoading}
            disabled={title.length === 0 || description.length === 0}
            onClick={() => {
              createRequest();
            }}
          >
            Submit
          </Button>
        </div>
        <p className="text-xs pb-2 text-center">
          These will be reviewed by the Phaze team and added as needed
        </p>
      </div>
    </div>
  );
};

export default Page;
