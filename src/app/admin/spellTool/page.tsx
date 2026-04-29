"use client";

import { SpellForm } from "@/components/SpellForm";
import { SpellTable } from "@/components/SpellTable";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
} from "@/components/ui/alert-dialog";
import { SpellCardPreview } from "@/components/print-cards";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { X } from "lucide-react";

export default function AdminSpellTool() {
  const queryClient = useQueryClient();
  const [selectedSpell, setSelectedSpell] = useState<Spell | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [spellToDelete, setSpellToDelete] = useState<Spell | null>(null);
  const [viewMode, setViewMode] = useState<"catalog" | "review">("catalog");
  const [previewCardSpell, setPreviewCardSpell] = useState<Spell | null>(null);
  const { data: session } = useSession();
  const isSuperAdmin = session?.user?.role === Role.SUPERADMIN;
  const isReviewer =
    session?.user?.role === Role.SPELLWRIGHT ||
    session?.user?.role === Role.ADMIN ||
    session?.user?.role === Role.SUPERADMIN;

  const { data: spells, isLoading } = useQuery<Spell[]>({
    queryKey: ["spells", viewMode],
    queryFn: async () => {
      const endpoint =
        viewMode === "review" ? "/api/spells/review-queue" : "/api/spells";
      const response = await axios.get(endpoint);
      return response.data;
    },
  });

  const handleSuccess = () => {
    setSelectedSpell(null);
    setIsCreating(false);
    queryClient.invalidateQueries({ queryKey: ["spells"] });
  };

  const handleEdit = (spell: Spell) => {
    setSelectedSpell(spell);
    setIsCreating(false);
  };

  const handleCreate = () => {
    setSelectedSpell(null);
    setIsCreating(true);
  };

  const handleBack = () => {
    setSelectedSpell(null);
    setIsCreating(false);
  };

  const handleView = (spell: Spell) => {
    setPreviewCardSpell(spell);
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/spells?id=${id}`);
      queryClient.invalidateQueries({ queryKey: ["spells"] });
      toast({
        title: "Success",
        description: "Spell deleted successfully",
      });
      setSpellToDelete(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete spell",
        variant: "destructive",
      });
    }
  };

  const handleApprove = async (
    id: string,
    publicationStatus: "PUBLISHED" | "PUBLISHED_IN_LIBRARY"
  ) => {
    try {
      await axios.post(`/api/spells/${id}/approve`, { publicationStatus });
      queryClient.invalidateQueries({ queryKey: ["spells"] });
      toast({
        title: "Success",
        description: "Spell approved successfully",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to approve spell",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full p-6 space-y-6">
      <div className="flex items-center justify-between bg-background">
        <h1 className="text-xl font-semibold">Spell Tool</h1>
        {!isCreating && !selectedSpell && viewMode === "catalog" && (
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

      {!isCreating && !selectedSpell && isReviewer && (
        <div className="flex gap-2">
          <Button
            variant={viewMode === "catalog" ? "default" : "outline"}
            onClick={() => setViewMode("catalog")}
          >
            Spell Catalog
          </Button>
          <Button
            variant={viewMode === "review" ? "default" : "outline"}
            onClick={() => setViewMode("review")}
          >
            Review Queue
          </Button>
        </div>
      )}

      <hr className="bg-foreground h-px" />

      {!isCreating && !selectedSpell ? (
        <>
          {viewMode === "catalog" ? (
            <SpellTable
              spells={spells || []}
              onEdit={isSuperAdmin ? handleEdit : undefined}
              onView={handleView}
              onDelete={
                isSuperAdmin
                  ? (id) => {
                      const spell = spells?.find((s) => s.id === id);
                      if (spell) {
                        setSpellToDelete(spell);
                      }
                    }
                  : undefined
              }
              isLoading={isLoading}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Spells Awaiting Review</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {isLoading && <div>Loading review queue...</div>}
                {!isLoading && (spells?.length ?? 0) === 0 && (
                  <div>No spells in review.</div>
                )}
                {spells?.map((spell) => (
                  <div
                    key={spell.id}
                    className="border rounded-md p-3 flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="font-semibold">{spell.title}</div>
                      <div className="text-sm text-muted-foreground">
                        Level {spell.level}
                        {spell.author ? ` • ${spell.author}` : ""}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleView(spell)}
                      >
                        Preview card
                      </Button>
                      {isReviewer && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(spell)}
                        >
                          Edit
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => spell.id && handleApprove(spell.id, "PUBLISHED")}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        onClick={() =>
                          spell.id && handleApprove(spell.id, "PUBLISHED_IN_LIBRARY")
                        }
                      >
                        Approve and add to library
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Dialog
            open={previewCardSpell !== null}
            onOpenChange={(open) => !open && setPreviewCardSpell(null)}
          >
            <DialogContent
              hideClose
              className="max-h-[92vh] w-auto max-w-[min(92vw,calc(36rem+2rem))] translate-x-[-50%] translate-y-[-50%] gap-0 overflow-visible border-0 bg-transparent p-0 shadow-none sm:max-w-none"
            >
              <DialogTitle className="sr-only">Spell card preview</DialogTitle>
              {previewCardSpell && (
                <div className="relative mx-auto w-fit">
                  <DialogClose className="absolute -right-1 -top-3 z-[60] flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-md ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                    <X className="h-5 w-5" aria-hidden />
                    <span className="sr-only">Close</span>
                  </DialogClose>
                  <SpellCardPreview spell={previewCardSpell} />
                </div>
              )}
            </DialogContent>
          </Dialog>

          <AlertDialog
            open={spellToDelete !== null}
            onOpenChange={(open) => !open && setSpellToDelete(null)}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete the spell &ldquo;
                  {spellToDelete?.title}&rdquo;? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setSpellToDelete(null)}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() =>
                    spellToDelete?.id && handleDelete(spellToDelete.id)
                  }
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete Spell
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      ) : (
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base">
              {isCreating
                ? "Create New Spell"
                : `Edit Spell: ${selectedSpell?.title}`}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
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
