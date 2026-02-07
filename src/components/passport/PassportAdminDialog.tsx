"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Settings } from "lucide-react";
import { CharacterInlineEffectsEditor } from "./CharacterInlineEffectsEditor";
import { CharacterClassManager } from "./CharacterClassManager";
import { CharacterAdjustmentManager } from "./CharacterAdjustmentManager";

type CharacterForAdmin = {
  id: string;
  name: string;
  primaryClassId: string | null;
  secondaryClassId: string | null;
  primaryClassLvl: number;
  secondaryClassLvl: number;
  inlineEffectsJson?: unknown;
};

type AdjustmentSummary = {
  id: string;
  title: string;
};

type PassportAdminDialogProps = {
  character: CharacterForAdmin;
  existingAdjustments: AdjustmentSummary[];
};

export function PassportAdminDialog({
  character,
  existingAdjustments,
}: PassportAdminDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Settings className="h-4 w-4" />
          Admin
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>Character Admin</DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-1 px-6 pb-6 min-h-0">
          <div className="space-y-4 pr-4">
            <CharacterInlineEffectsEditor
              characterId={character.id}
              characterName={character.name}
              inlineEffectsJson={character.inlineEffectsJson}
            />
            <CharacterClassManager
              characterId={character.id}
              primaryClassId={character.primaryClassId}
              secondaryClassId={character.secondaryClassId}
              primaryClassLvl={character.primaryClassLvl}
              secondaryClassLvl={character.secondaryClassLvl}
            />
            <CharacterAdjustmentManager
              characterId={character.id}
              existingAdjustments={existingAdjustments}
            />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
