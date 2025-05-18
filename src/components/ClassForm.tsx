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
import { useQueryClient } from "@tanstack/react-query";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ClassFormData {
  data: {
    id?: string;
    Title?: string;
    description?: string;
    grantedSkills?: string[];
    Skills?: string[];
    SkillTierGains?: (number | null)[];
    HP?: (number | null)[];
    EP?: (number | null)[];
    Attack?: (number | null)[];
    Accuracy?: (number | null)[];
    Defense?: (number | null)[];
    Resistance?: (number | null)[];
    Tough?: (number | null)[];
    Mind?: (number | null)[];
    Quick?: (number | null)[];
  } | null;
  readOnly?: boolean;
  onSuccess?: () => void;
}

interface FormData {
  id: string | undefined;
  Title: string;
  description: string;
  grantedSkills: string[];
  Skills: string[];
  SkillTierGains: number[];
  HP: (number | null)[];
  EP: (number | null)[];
  Attack: (number | null)[];
  Accuracy: (number | null)[];
  Defense: (number | null)[];
  Resistance: (number | null)[];
  Tough: (number | null)[];
  Mind: (number | null)[];
  Quick: (number | null)[];
}

interface UpdateFormData extends FormData {
  id: string;
}

const ValidationErrors = ({ errors }: { errors: Record<string, any> }) => {
  if (Object.keys(errors).length === 0) return null;

  return (
    <div className="mt-2 text-sm text-red-500">
      <p className="font-semibold">Please fix the following errors:</p>
      <ul className="list-disc list-inside">
        {Object.entries(errors).map(([field, error]) => {
          // Get a user-friendly field name
          const baseName = field
            .replace(/([A-Z])/g, " $1")
            .trim()
            .toLowerCase()
            .replace(/^./, (str) => str.toUpperCase());

          // If error is an array (like stat arrays), handle each error individually
          if (Array.isArray(error)) {
            return error
              .map((err, index) => {
                if (!err || !err.message) return null;
                return (
                  <li key={`${field}-${index}`} className="mb-1">
                    <span className="font-medium">
                      {baseName} (Level {index + 1}):
                    </span>{" "}
                    {err.message}
                  </li>
                );
              })
              .filter(Boolean);
          }

          // Handle regular errors
          const errorMessage =
            typeof error === "string"
              ? error
              : error?.message
              ? error.message
              : JSON.stringify(error);

          return (
            <li key={field} className="mb-1">
              <span className="font-medium">{baseName}:</span> {errorMessage}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export function ClassForm({ data, readOnly, onSuccess }: ClassFormData) {
  const queryClient = useQueryClient();
  const FormSchema = data ? UpdateValidator : ClassValidator;

  const getTierForLevel = (level: number): number => {
    if (level >= 20) return 4;
    if (level >= 13) return 3;
    if (level >= 6) return 2;
    return 1;
  };

  // Initialize default SkillTierGains with max tier for each level
  const defaultSkillTiers = Array.from({ length: 20 }, (_, i) =>
    getTierForLevel(i + 1)
  );

  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      id: data?.id,
      Title: data?.Title ?? "",
      description: data?.description ?? "",
      grantedSkills: Array.isArray(data?.grantedSkills)
        ? data.grantedSkills
        : typeof data?.grantedSkills === "string"
        ? JSON.parse(data.grantedSkills)
        : [],
      Skills: Array.isArray(data?.Skills)
        ? data.Skills
        : typeof data?.Skills === "string"
        ? JSON.parse(data.Skills)
        : [],
      SkillTierGains: Array.isArray(data?.SkillTierGains)
        ? data.SkillTierGains.map((tier) =>
            typeof tier === "number" ? tier : 0
          )
        : typeof data?.SkillTierGains === "string"
        ? JSON.parse(data.SkillTierGains).map((tier: any) =>
            typeof tier === "number" ? tier : 0
          )
        : defaultSkillTiers,
      HP: Array.isArray(data?.HP)
        ? data.HP.map((v) => (v === null ? 0 : v))
        : typeof data?.HP === "string"
        ? JSON.parse(data.HP).map((v: any) => (v === null ? 0 : v))
        : Array(20).fill(0),
      EP: Array.isArray(data?.EP)
        ? data.EP.map((v) => (v === null ? 0 : v))
        : typeof data?.EP === "string"
        ? JSON.parse(data.EP).map((v: any) => (v === null ? 0 : v))
        : Array(20).fill(0),
      Attack: Array.isArray(data?.Attack)
        ? data.Attack.map((v) => (v === null ? 0 : v))
        : typeof data?.Attack === "string"
        ? JSON.parse(data.Attack).map((v: any) => (v === null ? 0 : v))
        : Array(20).fill(0),
      Accuracy: Array.isArray(data?.Accuracy)
        ? data.Accuracy.map((v) => (v === null ? 0 : v))
        : typeof data?.Accuracy === "string"
        ? JSON.parse(data.Accuracy).map((v: any) => (v === null ? 0 : v))
        : Array(20).fill(0),
      Defense: Array.isArray(data?.Defense)
        ? data.Defense.map((v) => (v === null ? 0 : v))
        : typeof data?.Defense === "string"
        ? JSON.parse(data.Defense).map((v: any) => (v === null ? 0 : v))
        : Array(20).fill(0),
      Resistance: Array.isArray(data?.Resistance)
        ? data.Resistance.map((v) => (v === null ? 0 : v))
        : typeof data?.Resistance === "string"
        ? JSON.parse(data.Resistance).map((v: any) => (v === null ? 0 : v))
        : Array(20).fill(0),
      Tough: Array.isArray(data?.Tough)
        ? data.Tough.map((v) => (v === null ? 0 : v))
        : typeof data?.Tough === "string"
        ? JSON.parse(data.Tough).map((v: any) => (v === null ? 0 : v))
        : Array(20).fill(0),
      Mind: Array.isArray(data?.Mind)
        ? data.Mind.map((v) => (v === null ? 0 : v))
        : typeof data?.Mind === "string"
        ? JSON.parse(data.Mind).map((v: any) => (v === null ? 0 : v))
        : Array(20).fill(0),
      Quick: Array.isArray(data?.Quick)
        ? data.Quick.map((v) => (v === null ? 0 : v))
        : typeof data?.Quick === "string"
        ? JSON.parse(data.Quick).map((v: any) => (v === null ? 0 : v))
        : Array(20).fill(0),
    },
  });

  // Remove console.log statements for form state
  const formState = form.formState;

  const onSubmit = async (formData: FormData) => {
    try {
      // Ensure all arrays are properly formatted
      const skillTiers = formData.SkillTierGains.map((tier) =>
        typeof tier === "number" ? Math.min(Math.max(0, tier), 4) : 0
      );

      // Helper function to convert null to 0
      const convertNullToZero = (val: number | null): number =>
        val === null ? 0 : Number(val);

      // Create the base payload
      const basePayload = {
        ...formData,
        // Ensure all arrays are properly formatted as numbers
        SkillTierGains: skillTiers,
        HP: formData.HP.map(convertNullToZero),
        EP: formData.EP.map(convertNullToZero),
        Attack: formData.Attack.map(convertNullToZero),
        Accuracy: formData.Accuracy.map(convertNullToZero),
        Defense: formData.Defense.map(convertNullToZero),
        Resistance: formData.Resistance.map(convertNullToZero),
        Tough: formData.Tough.map(convertNullToZero),
        Mind: formData.Mind.map(convertNullToZero),
        Quick: formData.Quick.map(convertNullToZero),
        // Ensure arrays are initialized
        grantedSkills: formData.grantedSkills || [],
        Skills: formData.Skills || [],
      };

      // If we're updating, ensure the ID is in the payload
      const payload = data?.id ? { ...basePayload, id: data.id } : basePayload;

      // Validate the payload
      if (data?.id) {
        UpdateValidator.parse(payload);
      } else {
        ClassValidator.parse(payload);
      }

      const response = await axios.post("/api/admin/class", payload);

      // Invalidate and refetch classes after successful update
      await queryClient.invalidateQueries({ queryKey: ["classes"] });

      toast({
        title: "Success",
        description: data?.id
          ? "Class updated successfully"
          : "Class created successfully",
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data || err.message || "An error occurred",
        variant: "destructive",
      });
    }
  };

  const statCategories = [
    { name: "HP" as const, label: "Health Points" },
    { name: "EP" as const, label: "Energy Points" },
    { name: "Attack" as const, label: "Attack" },
    { name: "Accuracy" as const, label: "Accuracy" },
    { name: "Defense" as const, label: "Defense" },
    { name: "Resistance" as const, label: "Resistance" },
    { name: "Tough" as const, label: "Toughness" },
    { name: "Mind" as const, label: "Mind" },
    { name: "Quick" as const, label: "Quickness" },
  ] as const;

  return (
    <Form {...form}>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          e.stopPropagation();
          await form.handleSubmit(onSubmit)(e);
        }}
        className="space-y-4"
      >
        {data?.id && (
          <input type="hidden" {...form.register("id")} value={data.id} />
        )}
        <div className="relative">
          <Card className="p-4">
            <CardHeader className="p-0 pb-4">
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-4">
              <FormField
                control={form.control}
                name="Title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter class name..."
                        {...field}
                        disabled={readOnly}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class Description</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter class description..."
                        {...field}
                        disabled={readOnly}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="stats" className="w-full">
          <TabsList className="w-full grid grid-cols-3 mb-4">
            <TabsTrigger value="stats">Stats</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="tiers">Skill Tiers</TabsTrigger>
          </TabsList>

          <TabsContent value="stats" className="m-0">
            <Card className="p-4">
              <CardHeader className="p-0 pb-4">
                <CardTitle>Level Stats</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {statCategories.map((stat) => (
                    <div key={stat.name} className="space-y-2">
                      <h3 className="font-medium text-sm">{stat.label}</h3>
                      <div className="grid grid-cols-4 gap-1">
                        {Array.from({ length: 20 }, (_, i) => (
                          <FormField
                            key={`${stat.name}.${i}`}
                            control={form.control}
                            name={`${stat.name}.${i}`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    type="number"
                                    className="w-full h-8 text-center px-1"
                                    value={field.value ?? ""}
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      field.onChange(
                                        value ? parseInt(value) : null
                                      );
                                    }}
                                    disabled={readOnly}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="skills" className="m-0">
            <Card className="p-4">
              <CardHeader className="p-0 pb-4">
                <CardTitle>Class Skills</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <p className="text-sm text-muted-foreground">
                  Skill selection interface to be implemented
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tiers" className="m-0">
            <Card className="p-4">
              <CardHeader className="p-0 pb-4">
                <CardTitle>Skill Tier Gains</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-10 gap-1 relative">
                  {Array.from({ length: 20 }, (_, i) => {
                    const level = i + 1;
                    const maxTier = getTierForLevel(level);
                    return (
                      <FormField
                        key={`SkillTierGains.${i}`}
                        control={form.control}
                        name={`SkillTierGains.${i}`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs mb-1">
                              Lvl {level}
                            </FormLabel>
                            <Select
                              value={field.value?.toString() ?? "0"}
                              onValueChange={(value) => {
                                const numValue = parseInt(value);
                                if (
                                  !isNaN(numValue) &&
                                  numValue >= 0 &&
                                  numValue <= maxTier
                                ) {
                                  field.onChange(numValue);
                                }
                              }}
                              disabled={readOnly}
                            >
                              <SelectTrigger className="w-full h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent
                                position="popper"
                                side="top"
                                align="start"
                                className="w-[100px] min-w-[100px]"
                              >
                                <SelectItem value="0">No Skill</SelectItem>
                                {Array.from({ length: maxTier }, (_, t) => (
                                  <SelectItem
                                    key={t + 1}
                                    value={(t + 1).toString()}
                                  >
                                    Tier {t + 1}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Button type="submit" className="w-full" disabled={readOnly}>
          {data?.id ? "Update Class" : "Create Class"}
        </Button>
        <ValidationErrors errors={formState.errors} />
      </form>
    </Form>
  );
}

export default ClassForm;
