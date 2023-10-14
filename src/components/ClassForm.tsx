"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { ClassValidator, UpdateValidator } from "@/lib/validators/class";
import axios from "axios";

const FormSchemaCreate = ClassValidator;
const FormSchemaUpdate = UpdateValidator;

interface data {
  data: any;
}

export function ClassForm({ data }: data) {
  const FormSchema = data ? FormSchemaUpdate : FormSchemaCreate;
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: "" || data?.title,
      description: "" || data?.description,
      grantedSkills: [] || data?.grantedSkills,
      Skills: [] || data?.Skills,
      SkillTierGains: [] || data?.SkillTierGains,
      HP: [] || data?.HP,
      EP: [] || data?.EP,
      Attack: [] || data?.Attack,
      Accuracy: [] || data?.Accuracy,
      Defense: [] || data?.Defense,
      Resistance: [] || data?.Resistance,
      Tough: [] || data?.Tough,
      Mind: [] || data?.Mind,
      Quick: [] || data?.Quick,
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    const payload: z.infer<typeof FormSchema> = {
      title: data.title,
      description: data.description,
      grantedSkills: data.grantedSkills,
      Skills: data.Skills,
      SkillTierGains: data.SkillTierGains,
      HP: data.HP,
      EP: data.EP,
      Attack: data.Attack,
      Accuracy: data.Accuracy,
      Defense: data.Defense,
      Resistance: data.Resistance,
      Tough: data.Tough,
      Mind: data.Mind,
      Quick: data.Quick,
    };

    const response = await axios.post("/api/admin/class", payload);
    const responseData = response.data;
    toast({
      title: "You submitted the following values:",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
    console.log(responseData);
  }

  const levelText: any[] = [],
    ItemTierElements: any[] = [],
    HPElements: any[] = [],
    EPElements: any[] = [],
    AttElements: any[] = [],
    AccElements: any[] = [],
    DefElements: any[] = [],
    ResElements: any[] = [],
    ToughElements: any[] = [],
    MindElements: any[] = [],
    QuickElements: any[] = [];
  repeatMakerStarterText(levelText);
  repeatMaker(ItemTierElements, "Skill Tier Gained:", "SkillTierGains");
  repeatMaker(HPElements, "HP Total at LVL:", "HP");
  repeatMaker(EPElements, "EP Total at LVL:", "EP");
  repeatMaker(AttElements, "Attack at LVL:", "Attack");
  repeatMaker(AccElements, "Accuracy at LVL:", "Accuracy");
  repeatMaker(DefElements, "Defense at LVL:", "Defense");
  repeatMaker(ResElements, "Resistance at LVL:", "Resistance");
  repeatMaker(ToughElements, "Tough at LVL:", "Tough");
  repeatMaker(MindElements, "Mind at LVL:", "Mind");
  repeatMaker(QuickElements, "Quick at LVL:", "Quick");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-4">
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
        </div>
        <div className="space-y-4">Class Skills</div>
        <div className="space-y-4">Granted Class Skills</div>
        {/* Level Tier Gains */}
        <div className="grid grid-cols-23 grid-flow-col-dense space-y-4">
          {levelText}
        </div>
        {/* {Level Stat Gains} */}
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

        <Button type="submit">{data ? "Update" : "Submit"}</Button>
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
                  <Input
                    type="number"
                    className="text-center"
                    accept=""
                    placeholder="_"
                    {...field}
                  />
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
