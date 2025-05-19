"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateCharacter } from "@/lib/actions/character";

interface ChooseSecondaryClassDialogProps {
  characterId: string;
  characterName: string;
  classes: { id: string; Title: string }[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChooseSecondaryClassDialog({
  characterId,
  characterName,
  classes,
  open,
  onOpenChange,
}: ChooseSecondaryClassDialogProps) {
  const router = useRouter();
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedClassId) {
      toast({
        title: "No Class Selected",
        description: "Please select a secondary class",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    console.log("Submitting secondary class:", selectedClassId);

    try {
      // Update the character with the secondary class
      console.log("Sending update request with data:", {
        name: characterName,
        secondaryClassId: selectedClassId,
        secondaryClassLvl: 1, // Start at level 1
      });

      const result = await updateCharacter(characterId, {
        name: characterName,
        race: "", // This field is required but will be preserved by the API
        secondaryClassId: selectedClassId,
        secondaryClassLvl: 1, // Start at level 1
        primaryClassLvl: 0, // These will be preserved by the API
        primaryClassId: undefined,
        phazians: 0,
      });

      console.log("Update result:", result);

      toast({
        title: "Secondary Class Added",
        description: "Your character now has a secondary class!",
      });

      // Close the dialog and refresh the page
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error("Error adding secondary class:", error);
      toast({
        title: "Failed to Add Secondary Class",
        description:
          error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Choose a Secondary Class</DialogTitle>
          <DialogDescription>
            Select a secondary class for your character. This will use 1 of your
            unallocated levels.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Select value={selectedClassId} onValueChange={setSelectedClassId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a secondary class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((classItem) => (
                  <SelectItem key={classItem.id} value={classItem.id}>
                    {classItem.Title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedClassId}
          >
            {isSubmitting ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Adding...
              </>
            ) : (
              "Add Secondary Class"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
