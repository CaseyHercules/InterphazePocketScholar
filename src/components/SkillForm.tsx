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
import { Textarea } from "@/components/ui/textarea";
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
import { Skill, Class } from "@prisma/client";
import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, ChevronUp } from "lucide-react";
import { SkillEffectsEditor } from "@/components/SkillEffectsEditor";
import {
  ParentSkillSearch,
  SkillGroupSearch,
  PrerequisiteSkillsSearch,
} from "@/components/SkillManagementSearch";
import {
  type SkillEffect,
  getSkillEffects,
  getSkillNotes,
  createSkillAdditionalInfo,
} from "@/types/skill-effects";

const VISIBILITY_ROLE_OPTIONS = ["SPELLWRIGHT", "ADMIN", "SUPERADMIN"] as const;

type SkillWithVisibility = Skill & { visibilityRoles?: string[] };

interface SkillFormProps {
  data: SkillWithVisibility | null;
  onSubmit: (data: Partial<Skill>) => Promise<void>;
  onCancel: () => void;
}

export function SkillForm({ data, onSubmit, onCancel }: SkillFormProps) {
  const FormSchema = data ? UpdateValidator : SkillValidator;
  type FormData = z.infer<typeof FormSchema>;
  const [classes, setClasses] = useState<Class[]>([]);
  const [isMetaEffectsOpen, setIsMetaEffectsOpen] = useState(false);
  
  // Extract effects and notes from existing additionalInfo
  const [skillEffects, setSkillEffects] = useState<SkillEffect[]>(() => 
    getSkillEffects(data?.additionalInfo)
  );
  const [skillNotes, setSkillNotes] = useState<string>(() => 
    getSkillNotes(data?.additionalInfo)
  );

  // Fetch classes for selection
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await axios.get("/api/admin/class");
        setClasses(response.data);
      } catch (error) {
        console.error("Error fetching classes:", error);
      }
    };
    fetchClasses();
  }, []);
  
  // Auto-expand meta-effects section if there are effects
  useEffect(() => {
    if (skillEffects.length > 0) {
      setIsMetaEffectsOpen(true);
    }
  }, []);

  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      ...(data ? { id: data.id } : {}),
      title: data?.title ?? "",
      description: data?.description ?? "",
      descriptionShort: data?.descriptionShort ?? "",
      tier: data?.tier ?? 1,
      parentSkillId: data?.parentSkillId ?? "",
      skillGroupId: data?.skillGroupId ?? "",
      classId: data?.classId ?? "",
      prerequisiteSkills: data?.prerequisiteSkills ?? [],
      permenentEpReduction: data?.permenentEpReduction ?? 0,
      epCost: data?.epCost ?? "0",
      activation: data?.activation ?? "None",
      duration: data?.duration ?? "None",
      abilityCheck: data?.abilityCheck ?? "",
      canBeTakenMultiple: data?.canBeTakenMultiple ?? false,
      playerVisable: data?.playerVisable ?? true,
      visibilityRoles: data?.visibilityRoles ?? [],
      additionalInfo: data?.additionalInfo ?? [],
    },
  });

  async function handleSubmit(formData: FormData) {
    try {
      // Merge effects and notes into additionalInfo
      const additionalInfo = createSkillAdditionalInfo(skillEffects, skillNotes);
      const finalData = {
        ...formData,
        additionalInfo: Object.keys(additionalInfo).length > 0 ? additionalInfo : null,
      };
      
      console.log("Submitting form data:", finalData); // Debug log
      await onSubmit(finalData);
    } catch (err: any) {
      console.error("Form submission error:", err); // Debug log
      if (err.response?.data?.details) {
        // Handle validation errors from the API
        const validationErrors = err.response.data.details;
        validationErrors.forEach((error: any) => {
          form.setError(error.path[0], {
            type: "server",
            message: error.message,
          });
        });
      } else {
        const errorMessage =
          err.response?.data?.error ||
          err.message ||
          "An error occurred while processing the skill";
        toast({
          title: "Error!",
          variant: "destructive",
          description: errorMessage,
        });
      }
    }
  }

  const tierEmun = [1, 2, 3, 4];
  const permenentEpReductionEnum = [0, 1, 5, 10, 15];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
          {formEntry(
            "tier",
            "Skill Tier",
            "Select Skill Tier...",
            "",
            tierEmun
          )}
          <FormField
            control={form.control}
            name="parentSkillId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Parent Skill</FormLabel>
                <FormControl>
                  <ParentSkillSearch
                    value={field.value || ""}
                    onChange={field.onChange}
                    excludeSkillId={data?.id}
                    placeholder="Search for parent skill..."
                  />
                </FormControl>
                <FormDescription>
                  Optional parent skill this skill belongs under.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="skillGroupId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Skill Group</FormLabel>
                <FormControl>
                  <SkillGroupSearch
                    value={field.value || ""}
                    onChange={field.onChange}
                    placeholder="Search for skill group..."
                  />
                </FormControl>
                <FormDescription>
                  Optional skill group this skill belongs to.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Class Selection */}
          <FormField
            control={form.control}
            name="classId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Class</FormLabel>
                <Select
                  onValueChange={(value) =>
                    field.onChange(value === "none" ? null : value)
                  }
                  defaultValue={field.value || "none"}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a class..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">No Class</SelectItem>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.Title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Select the class this skill belongs to.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="prerequisiteSkills"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prerequisite Skills</FormLabel>
                <FormControl>
                  <PrerequisiteSkillsSearch
                    value={
                      Array.isArray(field.value)
                        ? field.value.map((v) => (typeof v === "string" ? v : String(v)))
                        : []
                    }
                    onChange={field.onChange}
                    excludeSkillId={data?.id}
                    placeholder="Search and add prerequisite skills..."
                  />
                </FormControl>
                <FormDescription>
                  Skills that must be learned before this skill can be taken.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          {formEntry(
            "permenentEpReduction",
            "Permanent EP Reduction",
            "Select Permanent EP Reduction...",
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
            "Can be taken multiple times?",
            "Select if this skill can be taken multiple times",
            "",
            [true, false],
            "boolean"
          )}
          {formEntry(
            "playerVisable",
            "Player Visible",
            "Select if this skill should be visible to players",
            "",
            [true, false],
            "boolean"
          )}
          <FormField
            control={form.control}
            name="visibilityRoles"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Visibility Roles</FormLabel>
                <FormDescription>
                  Leave empty to make this skill public.
                </FormDescription>
                <div className="flex flex-wrap gap-3">
                  {VISIBILITY_ROLE_OPTIONS.map((role) => (
                    <label
                      key={role}
                      className="flex items-center gap-2 text-sm"
                    >
                      <Checkbox
                        checked={field.value?.includes(role)}
                        onCheckedChange={(checked) => {
                          const next = new Set(field.value || []);
                          if (checked) {
                            next.add(role);
                          } else {
                            next.delete(role);
                          }
                          field.onChange(Array.from(next));
                        }}
                      />
                      {role}
                    </label>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Meta-Effects Section */}
          <div className="border rounded-lg overflow-hidden">
            <button
              type="button"
              className="w-full flex items-center justify-between px-4 py-3 bg-muted/50 hover:bg-muted/70 transition-colors"
              onClick={() => setIsMetaEffectsOpen(!isMetaEffectsOpen)}
            >
              <span className="font-medium text-sm">
                Meta-Effects & Additional Info
                {skillEffects.length > 0 && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    ({skillEffects.length} effect{skillEffects.length !== 1 ? "s" : ""})
                  </span>
                )}
              </span>
              {isMetaEffectsOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
            {isMetaEffectsOpen && (
              <div className="p-4 space-y-4 border-t">
                <div className="space-y-2">
                  <FormLabel>Meta-Effects</FormLabel>
                  <FormDescription>
                    Add stat bonuses, skill modifiers, or grant access to skills from other classes.
                  </FormDescription>
                  <SkillEffectsEditor
                    value={skillEffects}
                    onChange={setSkillEffects}
                  />
                </div>
                <div className="space-y-2">
                  <FormLabel>Additional Notes</FormLabel>
                  <Textarea
                    placeholder="Optional notes to display in the skill viewer..."
                    value={skillNotes}
                    onChange={(e) => setSkillNotes(e.target.value)}
                    className="min-h-[80px]"
                  />
                  <FormDescription>
                    Freeform notes displayed when viewing this skill.
                  </FormDescription>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button type="submit">{data ? "Update" : "Submit"}</Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
          {Object.keys(form.formState.errors).length > 0 && (
            <div className="text-sm text-red-500 text-right">
              {Object.entries(form.formState.errors).map(([field, error]) => (
                <div key={field} className="whitespace-nowrap">
                  {field}: {error.message?.toString()}
                </div>
              ))}
            </div>
          )}
        </div>
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
    return (
      <FormField
        control={form.control}
        name={entryName as any}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{title}</FormLabel>
            {!array && (
              <FormControl>
                <Input placeholder={placeholder} {...field} />
              </FormControl>
            )}
            {array && (
              <Select
                onValueChange={(value) => {
                  if (type === "boolean") {
                    field.onChange(value === "true");
                  } else {
                    field.onChange(Number(value));
                  }
                }}
                defaultValue={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={placeholder} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {array.map((e) => {
                    return (
                      <SelectItem value={e.toString()} key={e}>
                        {e === 0
                          ? type === "boolean"
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
  }
}

export default SkillForm;
