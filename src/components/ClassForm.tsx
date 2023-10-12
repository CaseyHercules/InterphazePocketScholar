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
      HP: [],
      EP: [],
      Attack: [],
      Accuracy: [],
      Defense: [],
      Resistance: [],
      Tough: [],
      Mind: [],
      Quick: [],
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
  const levelText: any[] = [];
  repeatMakerStarterText(levelText);
  const ItemTierElements: any[] = [];
  repeatMaker(ItemTierElements, "Skill Tier Gained:", "SkillTierGains");
  const HPElements: any[] = [];
  repeatMaker(HPElements, "HP Total at Level:", "HP");
  const EPElements: any[] = [];
  repeatMaker(EPElements, "EP Total at Level:", "EP");
  const AttElements: any[] = [];
  repeatMaker(AttElements, "Attack Total at Level:", "Attack");
  const AccElements: any[] = [];
  repeatMaker(AccElements, "Accuracy Total at Level:", "Accuracy");
  const DefElements: any[] = [];
  repeatMaker(DefElements, "Defense Total at Level:", "Defense");
  const ResElements: any[] = [];
  repeatMaker(ResElements, "Resistance Total at Level:", "Resistance");
  const ToughElements: any[] = [];
  repeatMaker(ToughElements, "Toughness Total at Level:", "Tough");
  const MindElements: any[] = [];
  repeatMaker(MindElements, "Mind Total at Level:", "Mind");
  const QuickElements: any[] = [];
  repeatMaker(QuickElements, "Quickness Total at Level:", "Quick");

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
        <div className="grid grid-cols-23 grid-flow-col-dense">{levelText}</div>
        <div className="grid grid-cols-23 grid-flow-col-dense">
          {ItemTierElements}
        </div>
        <div className="grid grid-cols-23 grid-flow-col-dense">
          {HPElements}
        </div>
        <div className="grid grid-cols-23 grid-flow-col-dense">
          {EPElements}
        </div>
        <div className="grid grid-cols-23 grid-flow-col-dense">
          {AttElements}
        </div>
        <div className="grid grid-cols-23 grid-flow-col-dense">
          {AccElements}
        </div>
        <div className="grid grid-cols-23 grid-flow-col-dense">
          {DefElements}
        </div>
        <div className="grid grid-cols-23 grid-flow-col-dense">
          {ResElements}
        </div>
        <div className="grid grid-cols-23 grid-flow-col-dense">
          {ToughElements}
        </div>
        <div className="grid grid-cols-23 grid-flow-col-dense">
          {QuickElements}
        </div>
        <div className="grid grid-cols-23 grid-flow-col-dense">
          {MindElements}
        </div>

        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );

  function repeatMaker(ElemntArray: any[], title: string, inputObject: string) {
    for (let i = 0; i < 21; i++) {
      if (i === 0) {
        ElemntArray.push(
          <div className="text-left col-span-3 flex items-center">{title}</div>
        );
      } else {
        ElemntArray.push(
          <FormField
            control={form.control}
            //@ts-expect-error
            name={`${inputObject}[${i - 1}]`}
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
  }

  function repeatMakerStarterText(ElemntArray: any[]) {
    for (let i = 0; i < 21; i++) {
      if (i === 0) {
        ElemntArray.push(
          <div className="text-left col-span-3 flex items-center"> </div>
        );
      } else {
        ElemntArray.push(<div className="text-center items-center">{i}</div>);
      }
    }
  }
}

export default ClassForm;
