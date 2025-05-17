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
}

interface FormData {
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

export function ClassForm({ data, readOnly }: ClassFormData) {
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
      Title: data?.Title ?? "",
      description: data?.description ?? "",
      grantedSkills: data?.grantedSkills ?? [],
      Skills: data?.Skills ?? [],
      SkillTierGains: Array.isArray(data?.SkillTierGains)
        ? data.SkillTierGains.map((tier) =>
            typeof tier === "number" ? tier : 0
          )
        : defaultSkillTiers,
      HP: data?.HP ?? Array(20).fill(null),
      EP: data?.EP ?? Array(20).fill(null),
      Attack: data?.Attack ?? Array(20).fill(null),
      Accuracy: data?.Accuracy ?? Array(20).fill(null),
      Defense: data?.Defense ?? Array(20).fill(null),
      Resistance: data?.Resistance ?? Array(20).fill(null),
      Tough: data?.Tough ?? Array(20).fill(null),
      Mind: data?.Mind ?? Array(20).fill(null),
      Quick: data?.Quick ?? Array(20).fill(null),
    },
  });

  async function onSubmit(formData: FormData) {
    try {
      console.log("Form submission started with data:", formData);

      // Ensure SkillTierGains is properly formatted
      const skillTiers = formData.SkillTierGains.map((tier) =>
        typeof tier === "number" ? Math.min(Math.max(0, tier), 4) : 0
      );

      const payload = {
        ...formData,
        SkillTierGains: skillTiers,
        ...(data?.id ? { id: data.id } : {}),
      };

      console.log("Sending payload to server:", payload);

      const response = await axios.post("/api/admin/class", payload);
      console.log("Server response:", response);

      // Invalidate and refetch classes after successful update
      await queryClient.invalidateQueries({ queryKey: ["classes"] });

      toast({
        title: "Success",
        description: data
          ? "Class updated successfully"
          : "Class created successfully",
      });

      // If we're editing, we should also update the form with the new values
      if (data?.id) {
        form.reset(formData);
      }
    } catch (err: any) {
      console.error("Form submission error:", err);
      console.error("Error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });

      toast({
        title: "Error",
        description: err.response?.data || err.message || "An error occurred",
        variant: "destructive",
      });
    }
  }

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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
          {data ? "Update Class" : "Create Class"}
        </Button>
      </form>
    </Form>
  );
}

export default ClassForm;
