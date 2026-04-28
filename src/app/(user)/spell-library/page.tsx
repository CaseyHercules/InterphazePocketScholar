"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Spell,
  SPELL_PUBLICATION_STATUS_LABELS,
} from "@/types/spell";

export default function SpellLibraryPage() {
  const { data: spells = [], isLoading } = useQuery<Spell[]>({
    queryKey: ["spell-library"],
    queryFn: async () => {
      const response = await axios.get("/api/spells/library");
      return response.data;
    },
  });

  return (
    <div className="w-full p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Spell Library</h1>
      <p className="text-sm text-muted-foreground">
        Published spells available to authenticated users.
      </p>

      {isLoading ? (
        <Card>
          <CardContent className="pt-6">Loading spell library...</CardContent>
        </Card>
      ) : spells.length === 0 ? (
        <Card>
          <CardContent className="pt-6">No spells in the library yet.</CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {spells.map((spell) => (
            <Card key={spell.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-lg">{spell.title}</CardTitle>
                  {spell.publicationStatus && (
                    <Badge variant="outline">
                      {SPELL_PUBLICATION_STATUS_LABELS[spell.publicationStatus]}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {spell.type || "Unknown Type"} • Level {spell.level}
                </p>
                {spell.author && <p className="text-sm">Author: {spell.author}</p>}
                {spell.description && (
                  <p className="text-sm text-muted-foreground">{spell.description}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
