"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChooseSecondaryClassDialog } from "@/components/ChooseSecondaryClassDialog";

interface SecondaryClassPromptProps {
  characterId: string;
  characterName: string;
  classes: { id: string; Title: string }[];
  hasUnallocatedLevels: boolean;
}

export function SecondaryClassPrompt({
  characterId,
  characterName,
  classes,
  hasUnallocatedLevels,
}: SecondaryClassPromptProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  if (!hasUnallocatedLevels) {
    return (
      <Button variant="outline" size="sm" className="w-full" disabled>
        <Plus className="mr-2 h-4 w-4" />
        Add Secondary Class
        <span className="ml-2 text-xs text-muted-foreground">
          (Need more levels)
        </span>
      </Button>
    );
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={() => setDialogOpen(true)}
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Secondary Class
      </Button>

      <ChooseSecondaryClassDialog
        characterId={characterId}
        characterName={characterName}
        classes={classes}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
}
