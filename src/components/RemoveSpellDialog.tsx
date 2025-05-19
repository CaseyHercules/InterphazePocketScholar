"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { removeSpellFromCharacter } from "@/lib/actions/character";

interface RemoveSpellDialogProps {
  characterId: string;
  spellId: string;
  spellName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RemoveSpellDialog({
  characterId,
  spellId,
  spellName,
  open,
  onOpenChange,
}: RemoveSpellDialogProps) {
  const router = useRouter();
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemoveSpell = async () => {
    setIsRemoving(true);

    try {
      await removeSpellFromCharacter(characterId, spellId);

      toast({
        title: "Success!",
        description: `${spellName} removed from your character.`,
      });

      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error("Error removing spell:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to remove spell",
        variant: "destructive",
      });
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove Spell</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to remove {spellName} from your character?
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isRemoving}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleRemoveSpell}
            disabled={isRemoving}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isRemoving ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Removing...
              </>
            ) : (
              "Remove Spell"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
