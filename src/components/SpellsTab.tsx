"use client";

import { Character, Spell } from "@prisma/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SpellManagementButtons } from "@/components/SpellManagementButtons";
import { SpellActionButtons } from "@/components/SpellActionButtons";

interface SpellsTabProps {
  character: Character & {
    spells: Spell[];
  };
}

export function SpellsTab({ character }: SpellsTabProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between">
        <div>
          <CardTitle className="flex items-center text-base sm:text-lg">
            <BookOpen className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            Spells
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Spells known by this character
          </CardDescription>
        </div>

        <SpellManagementButtons characterId={character.id} />
      </CardHeader>
      <CardContent className="p-3 sm:p-4 pt-0">
        {character.spells.length > 0 ? (
          <ScrollArea className="h-[300px] sm:h-[400px]">
            <div className="space-y-3">
              {character.spells.map((spell) => (
                <div key={spell.id} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <h3 className="text-base font-semibold">{spell.title}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                        Level {spell.level}
                      </span>
                      <SpellActionButtons
                        characterId={character.id}
                        spell={spell as any}
                      />
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                    {spell.description}
                  </p>
                  {spell.type && (
                    <p className="text-xs sm:text-sm mt-2">
                      <span className="font-medium">Type:</span> {spell.type}
                    </p>
                  )}
                  {(spell as any).data?.descriptor &&
                    (spell as any).data.descriptor.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {(spell as any).data.descriptor.map((desc: string) => (
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
          </ScrollArea>
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground mb-4">
              This character doesn&apos;t know any spells yet.
            </p>
            <SpellManagementButtons characterId={character.id} />
          </div>
        )}
      </CardContent>
      <CardFooter className="p-3 sm:p-4 pt-0 flex justify-between">
        <p className="text-xs sm:text-sm text-muted-foreground">
          Total Spells: {character.spells.length}
        </p>
      </CardFooter>
    </Card>
  );
}
