"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Plus, Search, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Spell {
  id: string;
  name: string;
  description?: string;
  level: number;
  class?: string;
}

interface EventSpell extends Spell {
  quantity: number;
}

interface SpellSelectorProps {
  eventId: string;
  onSave: (spells: { id: string; quantity: number }[]) => Promise<boolean>;
  initialSpells: EventSpell[];
  availableSpells: Spell[];
}

export function SpellSelector({
  eventId,
  onSave,
  initialSpells,
  availableSpells,
}: SpellSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [addingSpells, setAddingSpells] = useState<Set<string>>(new Set());

  // Filter spells by search query, level, and ensure uniqueness by ID
  const filteredSpells = availableSpells
    .filter(
      (spell) =>
        spell.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (spell.description &&
          spell.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase())) ||
        (spell.class &&
          spell.class.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    // Remove duplicates
    .filter(
      (spell, index, self) => index === self.findIndex((s) => s.id === spell.id)
    );

  const handleAddSpell = async (spell: Spell) => {
    setAddingSpells((prev) => new Set(prev).add(spell.id));

    try {
      // Find existing spell and increment quantity, or add new one
      const existingSpellIndex = initialSpells.findIndex(
        (s) => s.id === spell.id
      );
      let updatedSpells;

      if (existingSpellIndex >= 0) {
        // Increment existing spell quantity
        updatedSpells = initialSpells.map((s, index) =>
          index === existingSpellIndex
            ? { ...s, quantity: s.quantity + 1 }
            : { ...s, quantity: s.quantity }
        );
      } else {
        // Add new spell
        updatedSpells = [
          ...initialSpells.map((s) => ({ ...s, quantity: s.quantity })),
          { ...spell, quantity: 1 },
        ];
      }

      const success = await onSave(
        updatedSpells.map((spell) => ({
          id: spell.id,
          quantity: spell.quantity,
        }))
      );

      if (success) {
        toast({
          title: "Success",
          description: `Added ${spell.name} to event`,
        });
      } else {
        throw new Error("Failed to save spell");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add spell",
        variant: "destructive",
      });
    } finally {
      setAddingSpells((prev) => {
        const newSet = new Set(prev);
        newSet.delete(spell.id);
        return newSet;
      });
    }
  };

  // Calculate how many of each spell are in the list
  const getSpellCount = (spellId: string): number => {
    const existingSpell = initialSpells.find((spell) => spell.id === spellId);
    return existingSpell ? existingSpell.quantity : 0;
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search spells..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>

        <div className="grid gap-4 max-h-[400px] overflow-y-auto p-1">
          {filteredSpells.length > 0 ? (
            filteredSpells.map((spell) => {
              const spellCount = getSpellCount(spell.id);
              const isAdding = addingSpells.has(spell.id);

              return (
                <Card key={spell.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-medium">{spell.name}</h4>
                          <Badge variant="default" className="ml-1">
                            Level {spell.level}
                          </Badge>
                          {spell.class && (
                            <Badge variant="secondary" className="ml-1">
                              {spell.class}
                            </Badge>
                          )}
                          {spellCount > 0 && (
                            <Badge variant="outline" className="ml-1">
                              {spellCount} in event
                            </Badge>
                          )}
                        </div>
                        {spell.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {spell.description}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleAddSpell(spell)}
                        disabled={isAdding}
                      >
                        {isAdding ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Plus className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              {searchQuery
                ? "No spells matching your search"
                : "No spells available"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
