"use client";

import { SpellForm } from "@/components/SpellForm";
import { SpellTable } from "@/components/SpellTable";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Spell, CreateSpellInput } from "@/types/spell";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { Role } from "@prisma/client";
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

export default function AdminSpellTool() {
  const queryClient = useQueryClient();
  const [selectedSpell, setSelectedSpell] = useState<Spell | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const { data: session } = useSession();
  const isSuperAdmin = session?.user?.role === Role.SUPERADMIN;

  const { data: spells, isLoading } = useQuery<Spell[]>({
    queryKey: ["spells"],
    queryFn: async () => {
      const response = await axios.get("/api/spells");
      return response.data;
    },
  });

  const handleSuccess = () => {
    setSelectedSpell(null);
    setIsViewing(false);
    setIsCreating(false);
    queryClient.invalidateQueries({ queryKey: ["spells"] });
  };

  const handleEdit = (spell: Spell) => {
    setSelectedSpell(spell);
    setIsViewing(false);
    setIsCreating(false);
  };

  const handleCreate = () => {
    setSelectedSpell(null);
    setIsViewing(false);
    setIsCreating(true);
  };

  const handleBack = () => {
    setSelectedSpell(null);
    setIsViewing(false);
    setIsCreating(false);
  };

  const handleView = (spell: Spell) => {
    setSelectedSpell(spell);
    setIsViewing(true);
    setIsCreating(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/spells?id=${id}`);
      queryClient.invalidateQueries({ queryKey: ["spells"] });
      toast({
        title: "Success",
        description: "Spell deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete spell",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full p-6 space-y-6">
      <div className="flex items-center justify-between bg-background">
        <h1 className="text-xl font-semibold">Spell Tool</h1>
        {!isCreating && !selectedSpell && (
          <Button onClick={handleCreate} disabled={!isSuperAdmin}>
            Create New Spell
          </Button>
        )}
        {(isCreating || selectedSpell) && (
          <Button variant="outline" onClick={handleBack}>
            Back to List
          </Button>
        )}
      </div>

      <hr className="bg-foreground h-px" />

      {!isCreating && !selectedSpell ? (
        <SpellTable
          spells={spells || []}
          onEdit={isSuperAdmin ? handleEdit : undefined}
          onView={handleView}
          onDelete={
            isSuperAdmin
              ? (id) => {
                  const spell = spells?.find((s) => s.id === id);
                  if (!spell) return;
                  return new Promise((resolve) => {
                    const dialog = document.createElement("div");
                    document.body.appendChild(dialog);
                    const cleanup = () => {
                      document.body.removeChild(dialog);
                    };
                    const onConfirm = async () => {
                      await handleDelete(id);
                      cleanup();
                      resolve(true);
                    };
                    const onCancel = () => {
                      cleanup();
                      resolve(false);
                    };
                    const alert = (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete the spell &ldquo;
                              {spell.title}&rdquo;? This action cannot be
                              undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel onClick={onCancel}>
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={onConfirm}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete Spell
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    );
                  });
                }
              : undefined
          }
          isLoading={isLoading}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>
              {isCreating
                ? "Create New Spell"
                : isViewing
                ? `Spell Details: ${selectedSpell?.title}`
                : `Edit Spell: ${selectedSpell?.title}`}
            </CardTitle>
            <CardDescription>
              {isCreating
                ? "Create a new spell with the form below"
                : isViewing
                ? selectedSpell?.description
                : "Edit the selected spell properties"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SpellForm
              initialSpell={selectedSpell ?? undefined}
              onSubmit={async (values: CreateSpellInput) => {
                try {
                  if (selectedSpell?.id) {
                    await axios.put(`/api/spells`, {
                      ...values,
                      id: selectedSpell.id,
                    });
                  } else {
                    await axios.post("/api/spells", values);
                  }
                  handleSuccess();
                } catch (error) {
                  throw error;
                }
              }}
              onCancel={handleBack}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
