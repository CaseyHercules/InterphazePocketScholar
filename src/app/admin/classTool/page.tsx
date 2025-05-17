"use client";

import { ClassForm } from "@/components/ClassForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useSession } from "next-auth/react";
import { Role } from "@prisma/client";

interface Class {
  id: string;
  Title: string;
  description: string;
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
}

const ClassReport = ({ classData }: { classData: Class }) => {
  const statNames = [
    "HP",
    "EP",
    "Attack",
    "Accuracy",
    "Defense",
    "Resistance",
    "Tough",
    "Quick",
    "Mind",
  ];
  const levels = Array.from({ length: 20 }, (_, i) => i + 1);

  // Helper function to safely get stat values
  const getStatValue = (
    statName: keyof Class,
    level: number
  ): number | null => {
    const rawStatArray = classData[statName];
    let statArray;

    if (typeof rawStatArray === "string") {
      try {
        statArray = JSON.parse(rawStatArray);
      } catch {
        return null;
      }
    } else if (Array.isArray(rawStatArray)) {
      statArray = rawStatArray;
    } else {
      return null;
    }

    if (!Array.isArray(statArray)) return null;
    const value = statArray[level - 1];
    // Return null for 0 values so they display as "—"
    if (value === 0) return null;
    return typeof value === "string" ? parseInt(value) : value;
  };

  // Helper function to safely get skill tier
  const getSkillTier = (level: number): number | null => {
    const rawTiers = classData.SkillTierGains;
    let tiers;

    if (typeof rawTiers === "string") {
      try {
        tiers = JSON.parse(rawTiers);
      } catch {
        return null;
      }
    } else if (Array.isArray(rawTiers)) {
      tiers = rawTiers;
    } else {
      return null;
    }

    if (!Array.isArray(tiers)) return null;
    const value = tiers[level - 1];
    // Return null for 0 values so they display as "—"
    if (value === 0) return null;
    return typeof value === "string" ? parseInt(value) : value;
  };

  // Helper function to safely get skills array
  const getSkills = (): string[] => {
    const rawSkills = classData.Skills;
    if (typeof rawSkills === "string") {
      try {
        return JSON.parse(rawSkills);
      } catch {
        return [];
      }
    }
    return Array.isArray(rawSkills) ? rawSkills : [];
  };

  const skills = getSkills();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Stats Progression</h3>
        <div className="mt-4 overflow-x-auto border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-medium">Stat</TableHead>
                {levels.map((level) => (
                  <TableHead
                    key={level}
                    className="text-center whitespace-nowrap"
                  >
                    Lvl {level}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {statNames.map((statName) => (
                <TableRow key={statName}>
                  <TableCell className="font-medium">{statName}</TableCell>
                  {levels.map((level) => {
                    const value = getStatValue(statName as keyof Class, level);
                    return (
                      <TableCell
                        key={`${statName}-${level}`}
                        className="text-center"
                      >
                        {value ?? "—"}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold">Skill Tier Progression</h3>
        <div className="mt-4 overflow-x-auto border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-medium">Level</TableHead>
                {levels.map((level) => (
                  <TableHead
                    key={level}
                    className="text-center whitespace-nowrap"
                  >
                    {level}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Tier</TableCell>
                {levels.map((level) => {
                  const tier = getSkillTier(level);
                  return (
                    <TableCell key={`tier-${level}`} className="text-center">
                      {tier ?? "—"}
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>

      {skills.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold">Available Skills</h3>
          <div className="mt-2">
            <ul className="list-disc list-inside text-sm">
              {skills.map((skill, index) => (
                <li key={`skill-${index}`}>{skill}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

const Page = () => {
  const queryClient = useQueryClient();
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const { data: session } = useSession();
  const isSuperAdmin = session?.user?.role === Role.SUPERADMIN;

  const { data: classes, isLoading } = useQuery<Class[]>({
    queryKey: ["classes"],
    queryFn: async () => {
      const response = await axios.get("/api/admin/class");
      // Sort classes alphabetically by title
      return response.data.sort((a: Class, b: Class) =>
        a.Title.localeCompare(b.Title, undefined, { sensitivity: "base" })
      );
    },
  });

  const handleSuccess = useCallback(() => {
    // Reset state to show the list
    setSelectedClass(null);
    setIsViewing(false);
    setIsCreating(false);

    // Refetch the classes data
    queryClient.invalidateQueries({ queryKey: ["classes"] });
  }, [queryClient]);

  const handleEdit = useCallback((classData: Class) => {
    setSelectedClass(classData);
    setIsViewing(false);
    setIsCreating(false);
  }, []);

  const handleCreate = useCallback(() => {
    setSelectedClass(null);
    setIsViewing(false);
    setIsCreating(true);
  }, []);

  const handleBack = useCallback(() => {
    setSelectedClass(null);
    setIsViewing(false);
    setIsCreating(false);
  }, []);

  const handleView = useCallback((classData: Class) => {
    setSelectedClass(classData);
    setIsViewing(true);
    setIsCreating(false);
  }, []);

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await axios.delete(`/api/admin/class?id=${id}`);
        await queryClient.invalidateQueries({ queryKey: ["classes"] });
        toast({
          title: "Success",
          description: "Class deleted successfully",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete class",
          variant: "destructive",
        });
      }
    },
    [queryClient]
  );

  return (
    <div className="w-full p-6 space-y-6">
      <div className="flex items-center justify-between bg-background">
        <h1 className="text-xl font-semibold">Class Tool</h1>
        {!isCreating && !selectedClass && (
          <Button onClick={handleCreate} disabled={!isSuperAdmin}>
            Create New Class
          </Button>
        )}
        {(isCreating || selectedClass) && (
          <Button variant="outline" onClick={handleBack}>
            Back to List
          </Button>
        )}
      </div>

      <hr className="bg-foreground h-px" />

      {!isCreating && !selectedClass ? (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Existing Classes</CardTitle>
            <CardDescription>
              Select a class to edit or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {isLoading ? (
              <div>Loading classes...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Class Name</TableHead>
                    <TableHead className="w-[200px] text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classes?.map((classItem) => (
                    <TableRow key={classItem.id}>
                      <TableCell>
                        <div className="font-medium">{classItem.Title}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {classItem.description}
                        </div>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleView(classItem)}
                        >
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(classItem)}
                          disabled={!isSuperAdmin}
                        >
                          Edit
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              disabled={!isSuperAdmin}
                            >
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete the class
                                &ldquo;{classItem.Title}&rdquo;? This action
                                cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(classItem.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete Class
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
          <CardFooter className="text-xs justify-center text-stone-500">
            Created and Maintained By Casey Holman
          </CardFooter>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>
              {isCreating
                ? "Create New Class"
                : isViewing
                ? `Class Details: ${selectedClass?.Title}`
                : `Edit Class: ${selectedClass?.Title}`}
            </CardTitle>
            <CardDescription>
              {isCreating
                ? "Create a new class with the form below"
                : isViewing
                ? `${selectedClass?.description}`
                : "Edit the selected class properties"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isViewing ? (
              <>
                <ClassReport classData={selectedClass!} />
                <div className="flex justify-end mt-4 space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => handleEdit(selectedClass!)}
                    disabled={!isSuperAdmin}
                  >
                    Edit
                  </Button>
                  <Button variant="outline" onClick={handleBack}>
                    Back to List
                  </Button>
                </div>
              </>
            ) : (
              <ClassForm
                data={selectedClass}
                readOnly={false}
                onSuccess={handleSuccess}
              />
            )}
          </CardContent>
          <CardFooter className="text-xs justify-center text-stone-500">
            Created and Maintained By Casey Holman
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default Page;
