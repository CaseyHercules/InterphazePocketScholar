"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye, Trash2 } from "lucide-react";
import { Spell } from "@/types/spell";
import { RemoveSpellDialog } from "@/components/RemoveSpellDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SpellActionButtonsProps {
  characterId: string;
  spell: Spell;
}

export function SpellActionButtons({
  characterId,
  spell,
}: SpellActionButtonsProps) {
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => setIsViewDialogOpen(true)}
        title="View Details"
      >
        <Eye className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
        onClick={() => setIsRemoveDialogOpen(true)}
        title="Remove Spell"
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      {/* View Spell Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="text-xl">{spell.title}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {spell.type && <Badge variant="outline">{spell.type}</Badge>}
              <Badge
                variant="secondary"
                className="bg-primary/10 text-primary border-0"
              >
                Level {spell.level}
              </Badge>
              {spell.data?.descriptor?.map((desc) => (
                <Badge key={desc} variant="secondary" className="text-xs">
                  {desc}
                </Badge>
              ))}
            </div>

            {spell.description && (
              <p className="text-sm">{spell.description}</p>
            )}

            <ScrollArea className="h-[250px] pr-4">
              <div className="space-y-4">
                {spell.data && (
                  <dl className="space-y-2">
                    {spell.data.castingTime && (
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">
                          Casting Time
                        </dt>
                        <dd>{spell.data.castingTime}</dd>
                      </div>
                    )}
                    {spell.data.range && (
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">
                          Range
                        </dt>
                        <dd>{spell.data.range}</dd>
                      </div>
                    )}
                    {spell.data.areaOfEffect && (
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">
                          Area of Effect
                        </dt>
                        <dd>{spell.data.areaOfEffect}</dd>
                      </div>
                    )}
                    {spell.data.duration && (
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">
                          Duration
                        </dt>
                        <dd>{spell.data.duration}</dd>
                      </div>
                    )}
                    {spell.data.save && (
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">
                          Save
                        </dt>
                        <dd>{spell.data.save}</dd>
                      </div>
                    )}
                    {spell.data.effect && (
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">
                          Effect
                        </dt>
                        <dd className="whitespace-pre-wrap">
                          {spell.data.effect}
                        </dd>
                      </div>
                    )}
                    {spell.data.method && (
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">
                          Method
                        </dt>
                        <dd className="whitespace-pre-wrap">
                          {spell.data.method}
                        </dd>
                      </div>
                    )}
                  </dl>
                )}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      {/* Remove Spell Dialog */}
      <RemoveSpellDialog
        characterId={characterId}
        spellId={spell.id!}
        spellName={spell.title}
        open={isRemoveDialogOpen}
        onOpenChange={setIsRemoveDialogOpen}
      />
    </>
  );
}
