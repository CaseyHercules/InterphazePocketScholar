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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Spell } from "@/types/spell";
import { addSpellToCharacter } from "@/lib/actions/character";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AddSpellDialogProps {
  characterId: string;
  spells: Spell[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddSpellDialog({
  characterId,
  spells,
  open,
  onOpenChange,
}: AddSpellDialogProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpell, setSelectedSpell] = useState<Spell | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const normalizedSearch = searchTerm.toLowerCase();

  // Filter spells based on search term
  const filteredSpells = spells.filter(
    (spell) =>
      (spell.title ?? "").toLowerCase().includes(normalizedSearch) ||
      spell.type?.toLowerCase().includes(normalizedSearch) ||
      spell.description?.toLowerCase().includes(normalizedSearch)
  );

  // Group spells by level
  const groupedSpells = filteredSpells.reduce<Record<number, Spell[]>>(
    (acc, spell) => {
      const level = spell.level;
      if (!acc[level]) {
        acc[level] = [];
      }
      acc[level].push(spell);
      return acc;
    },
    {}
  );

  // Sort levels
  const sortedLevels = Object.keys(groupedSpells)
    .map(Number)
    .sort((a, b) => a - b);

  const handleAddSpell = async () => {
    if (!selectedSpell) {
      toast({
        title: "No Spell Selected",
        description: "Please select a spell to add",
        variant: "destructive",
      });
      return;
    }

    setIsAdding(true);

    try {
      await addSpellToCharacter(characterId, selectedSpell.id!);

      toast({
        title: "Success!",
        description: `${selectedSpell.title} added to your character.`,
      });

      onOpenChange(false);
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to add spell",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Add Spell to Character</DialogTitle>
          <DialogDescription>
            Choose a spell to add to your character&apos;s spellbook
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="Search spells..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-4"
          />

          <ScrollArea className="h-[300px] pr-4">
            {sortedLevels.length > 0 ? (
              sortedLevels.map((level) => (
                <div key={level} className="mb-4">
                  <h3 className="text-sm font-semibold mb-2">Level {level}</h3>
                  <div className="space-y-2">
                    {groupedSpells[level].map((spell) => (
                      <div
                        key={spell.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedSpell?.id === spell.id
                            ? "border-primary bg-primary/5"
                            : "hover:bg-accent"
                        }`}
                        onClick={() => setSelectedSpell(spell)}
                      >
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium">{spell.title}</h4>
                          {spell.type && (
                            <Badge variant="outline">{spell.type}</Badge>
                          )}
                        </div>
                        {spell.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {spell.description}
                          </p>
                        )}
                        {spell.data?.descriptor && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {spell.data.descriptor.map((desc) => (
                              <Badge
                                key={desc}
                                variant="secondary"
                                className="text-xs"
                              >
                                {desc}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">
                {spells.length === 0
                  ? "No spells available"
                  : "No spells match your search"}
              </p>
            )}
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isAdding}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddSpell}
            disabled={isAdding || !selectedSpell}
          >
            {isAdding ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Adding...
              </>
            ) : (
              "Add Spell"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
