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
import { SkillValidator, UpdateValidator } from "@/lib/validators/skill";
import axios from "axios";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface data {
  data: any;
}

export function SkillForm({ data }: data) {
  const FormSchema = data ? UpdateValidator : SkillValidator;
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: data ? data?.title : "",
      description: data ? data?.description : "",
      descriptionShort: data ? data?.descriptionShort : "",
      tier: data ? data?.tier : "",
      parentSkillId: data ? data?.parentSkillId : "",
      skillGroupId: data ? data?.skillGroupId : "",
      prerequisiteSkills: data ? data?.prerequisiteSkills : [],
      permenentEpReduction: data ? data?.permenentEpReduction : "",
      epCost: data ? data?.epCost : "",
      activation: data ? data?.activation : "",
      duration: data ? data?.duration : "",
      abilityCheck: data ? data?.abilityCheck : "",
      canBeTakenMultiple: data ? data?.canBeTakenMultiple : "false",
      playerVisable: data ? data?.playerVisable : "true",
      additionalInfo: data ? data?.additionalInfo : [],
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    const payload: z.infer<typeof FormSchema> = {
      title: data.title,
      description: data.description,
      descriptionShort: data.descriptionShort,
      tier: data.tier,
      parentSkillId: data.parentSkillId,
      skillGroupId: data.skillGroupId,
      prerequisiteSkills: data.prerequisiteSkills,
      permenentEpReduction: data.permenentEpReduction,
      epCost: data.epCost,
      activation: data.activation,
      duration: data.duration,
      abilityCheck: data.abilityCheck,
      canBeTakenMultiple: data.canBeTakenMultiple,
      playerVisable: data.playerVisable,
      additionalInfo: data.additionalInfo,
    };

    try {
      const response = await axios.post("/api/admin/skill", payload);
      const responseData = response.data;
      console.log(responseData);
      toast({
        title: "Success!",
        description: "The skill has been successfully posted",
        // <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
        //   <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        // </pre>
      });
    } catch (err: any) {
      console.log(err);
      toast({
        title: "Error! Status code:" + err.response.status,
        variant: "destructive",
        description: err.response.data,
      });
    }
  }

  const tierEmun = ["1", "2", "3", "4"];
  const permenentEpReductionEnum = [0, 1, 5, 10, 15];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-4 pb-4">
          {/* Title */}
          {formEntry("title", "Skill Title", "Enter Skill title...")}
          {formEntry(
            "description",
            "Skill Description",
            "Enter Skill description...",
            "This is the description that should have the full details and rules of the skill."
          )}
          {formEntry(
            "descriptionShort",
            "Short Description ",
            "Short description of skill...",
            "This is the description that will be printed on passports"
          )}
          {formEntry("tier", "Skill Tier", "Enter Skill Tier...", "", tierEmun)}
          {formEntry(
            "parentSkillId",
            "parentSkillId - NEEDS GUI",
            "parentSkillId"
          )}
          {formEntry(
            "skillGroupId",
            "skillGroupId - NEEDS GUI",
            "skillGroupId"
          )}
          {formEntry(
            "prerequisiteSkills",
            "prerequisiteSkills - NEEDS GUI",
            "prerequisiteSkills"
          )}
          {formEntry(
            "permenentEpReduction",
            "Permenent EP Reduction",
            "Enter Permenent EP Reduction...",
            "",
            permenentEpReductionEnum
          )}
          {formEntry(
            "epCost",
            "EP Cost",
            "Enter EP Cost...",
            "This is the EP cost to use the skill."
          )}
          {formEntry("activation", "Activation", "Enter Activation...")}
          {formEntry("duration", "Duration", "Enter Duration...")}
          {formEntry("abilityCheck", "Ability Check", "Enter Ability Check...")}
          {formEntry(
            "canBeTakenMultiple",
            "Can this skill be taken multiple times? - PROBABLY NEEDS GUI or different input",
            "ROBABLY NEEDS GUI or different input",
            "",
            [true, false],
            "boolean"
          )}
          {formEntry(
            "playerVisable",
            "Player Visable - PROBABLY NEEDS GUI or different input",
            "Enter Player Visable...",
            "",
            [true, false],
            "boolean"
          )}
          {formEntry(
            "additionalInfo",
            "Additional Info - NEEDS GUI",
            "Enter Additional Info...",
            "This is the Additional Info of the skill."
          )}
        </div>
        <Button type="submit">{data ? "Update" : "Submit"}</Button>
      </form>
    </Form>
  );

  function formEntry(
    entryName: string,
    title: string,
    placeholder: string,
    description?: string,
    array?: any[],
    type?: string
  ) {
    const ret = (
      <FormField
        control={form.control}
        //@ts-expect-error
        name={entryName}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{title}</FormLabel>
            {!array && (
              <FormControl>
                <Input placeholder={placeholder} {...field} />
              </FormControl>
            )}
            {array && (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={placeholder} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {array.map((e) => {
                    return (
                      <SelectItem value={e.toString()} key={e}>
                        {e == 0
                          ? type == "boolean"
                            ? "False"
                            : "None"
                          : e.toString().charAt(0).toUpperCase() +
                            e.toString().slice(1)}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            )}
            <FormDescription>{description}</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    );

    return ret;
  }
}

export default SkillForm;
