"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Control, useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { ClassValidator } from "@/lib/validators/class";
import { User } from "lucide-react";
import { FC } from "react";

const FormSchema = ClassValidator;

export function ClassForm() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: "",
      description: "",
      grantedSkills: [],
      Skills: [],
      SkillTierGains: [],
      Attributes: [],
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    toast({
      title: "You submitted the following values:",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
  }

  const items = Array(21);

  const ItemTierElements = [];

  for (let i = 0; i < items.length; i++) {
    if (i === 0) {
      ItemTierElements.push(
        <div className="text-left col-span-3 flex items-center">
          Skill Tier Gained:
        </div>
      );
    } else {
      ItemTierElements.push(
        <FormField
          control={form.control}
          //@ts-expect-error
          name={`SkillTierGains[${i - 1}]`}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input className="text-center" placeholder="_" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      );
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Class Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter Class name..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Class Description</FormLabel>
              <FormControl>
                <Input placeholder="Enter Class name..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* {Level Tier Gains} */}
        <div className="grid grid-cols-23 grid-flow-col-dense">
          {ItemTierElements}
        </div>

        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}

// export const ClassValidator = z.object({
//     title: z
//       .string()
//       .min(3, { message: "Title must be longer than 3 characters" })
//       .max(64, { message: "Title must be at most 64 characters" }),
//     description: z.string().nullish(),
//     grantedSkills: z.any(),
//     Skills: z.any(),
//     SkillTierGains: z.any(),
//     Attributes: z.any(),
//   });

export default ClassForm;
