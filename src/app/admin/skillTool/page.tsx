"use client";

import { useState, useEffect } from "react";
import { Skill } from "@prisma/client";
import { SkillTable } from "@/components/SkillTable";
import { SkillForm } from "@/components/SkillForm";
import { SkillViewer } from "@/components/SkillViewer";
import { BulkSkillImport } from "@/components/BulkSkillImport";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
} from "@/components/ui/alert-dialog";

export default function SkillToolPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [skillToDelete, setSkillToDelete] = useState<Skill | null>(null);

  // Fetch skills on component mount
  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const response = await fetch("/api/admin/skill");
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch skills");
      }
      const data = await response.json();
      setSkills(data);
    } catch (error: any) {
      console.error("Error fetching skills:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load skills",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (skill: Skill) => {
    setSelectedSkill(skill);
    setIsFormOpen(true);
    setIsViewerOpen(false);
  };

  const handleView = (skill: Skill) => {
    setSelectedSkill(skill);
    setIsViewerOpen(true);
    setIsFormOpen(false);
  };

  const handleBack = () => {
    setSelectedSkill(null);
    setIsFormOpen(false);
    setIsViewerOpen(false);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/skill?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete skill");
      }

      setSkills((prev) => prev.filter((skill) => skill.id !== id));
      toast({
        title: "Success",
        description: "Skill deleted successfully",
      });
      setSkillToDelete(null);
    } catch (error: any) {
      console.error("Error deleting skill:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete skill",
        variant: "destructive",
      });
    }
  };

  const handleFormSubmit = async (data: Partial<Skill>) => {
    try {
      const response = await fetch("/api/admin/skill", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          selectedSkill ? { ...data, id: selectedSkill.id } : data
        ),
      });

      const responseData = await response.json();

      if (!response.ok) {
        // If it's a validation error, throw it to be handled by the form
        if (response.status === 422) {
          throw {
            response: {
              data: responseData,
            },
          };
        }
        // For other errors, show a toast
        throw new Error(responseData.error || "Failed to save skill");
      }

      if (selectedSkill) {
        setSkills((prev) =>
          prev.map((skill) =>
            skill.id === responseData.id ? responseData : skill
          )
        );
        toast({
          title: "Success",
          description: "Skill updated successfully",
        });
      } else {
        setSkills((prev) => [...prev, responseData]);
        toast({
          title: "Success",
          description: "Skill created successfully",
        });
      }

      handleBack();
    } catch (error: any) {
      // Re-throw validation errors to be handled by the form
      if (error.response?.data?.details) {
        throw error;
      }
      // Handle other errors with a toast
      console.error("Error saving skill:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save skill",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full p-6 space-y-6">
      <div className="flex items-center justify-between bg-background">
        <h1 className="text-xl font-semibold">Skill Management</h1>
        {!isFormOpen && (
          <Button onClick={() => setIsFormOpen(true)}>Create New Skill</Button>
        )}
        {isFormOpen && (
          <Button variant="outline" onClick={handleBack}>
            Back to List
          </Button>
        )}
      </div>

      <hr className="bg-foreground h-px" />

      {isFormOpen ? (
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedSkill ? "Edit Skill" : "Create New Skill"}
            </CardTitle>
            <CardDescription>
              {selectedSkill
                ? "Edit the selected skill properties"
                : "Create a new skill with the form below"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SkillForm
              data={selectedSkill}
              onSubmit={handleFormSubmit}
              onCancel={handleBack}
            />
          </CardContent>
        </Card>
      ) : (
        <>
          <BulkSkillImport />
          <SkillTable
            skills={skills}
            onEdit={handleEdit}
            onView={handleView}
            onDelete={(id) => {
              const skill = skills.find((s) => s.id === id);
              if (skill) {
                setSkillToDelete(skill);
              }
            }}
            isLoading={isLoading}
          />

          {isViewerOpen && selectedSkill && (
            <SkillViewer
              skill={selectedSkill}
              isOpen={isViewerOpen}
              onClose={() => {
                setIsViewerOpen(false);
                setSelectedSkill(null);
              }}
            />
          )}

          <AlertDialog
            open={skillToDelete !== null}
            onOpenChange={(open) => !open && setSkillToDelete(null)}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete the skill &ldquo;
                  {skillToDelete?.title}&rdquo;? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setSkillToDelete(null)}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() =>
                    skillToDelete?.id && handleDelete(skillToDelete.id)
                  }
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete Skill
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  );
}
