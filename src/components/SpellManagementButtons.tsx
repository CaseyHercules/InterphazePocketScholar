"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BookPlus } from "lucide-react";
import { AddSpellDialog } from "@/components/AddSpellDialog";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Spell } from "@/types/spell";

interface SpellManagementButtonsProps {
  characterId: string;
}

export function SpellManagementButtons({
  characterId,
}: SpellManagementButtonsProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Get all spells available for adding
  const { data: availableSpells = [], isLoading } = useQuery<Spell[]>({
    queryKey: ["available-spells"],
    queryFn: async () => {
      const response = await axios.get("/api/spells");
      // Show all spells, including those assigned to other characters
      return response.data;
    },
    enabled: isAddDialogOpen, // Only fetch when dialog is open
  });

  return (
    <>
      <Button
        size="sm"
        className="mt-2 sm:mt-0"
        onClick={() => setIsAddDialogOpen(true)}
      >
        <BookPlus className="mr-2 h-4 w-4" />
        Add Spell
      </Button>

      <AddSpellDialog
        characterId={characterId}
        spells={availableSpells}
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />
    </>
  );
}
