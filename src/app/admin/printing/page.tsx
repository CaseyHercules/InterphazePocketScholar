"use client";

import "./print.css";
import axios from "axios";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QuarterPagePrintShell } from "@/components/print-cards/quarter-page-print-shell";
import { SpellCardTemplate } from "@/components/print-cards/spell-card-template";
import {
  SPELL_CARD_STYLE_OPTIONS,
  SpellCardStyleId,
  PrintTemplateId,
} from "@/components/print-cards/types";
import { Spell } from "@/types/spell";

const TEMPLATE_ID: PrintTemplateId = "spell";
const getSpellValue = (spell: Spell) => spell.id ?? spell.title;

export default function AdminPrintingPage() {
  const [selectedSpellId, setSelectedSpellId] = useState<string | null>(null);
  const [selectedStyleId, setSelectedStyleId] = useState<SpellCardStyleId>(
    SPELL_CARD_STYLE_OPTIONS[0].id
  );

  const { data: spells = [], isLoading, isError } = useQuery<Spell[]>({
    queryKey: ["spells", "print-preview"],
    queryFn: async () => {
      const catalogRes = await axios.get<Spell[]>("/api/spells");
      let review: Spell[] = [];
      try {
        const reviewRes = await axios.get<Spell[]>("/api/spells/review-queue");
        review = reviewRes.data;
      } catch {
        review = [];
      }

      const byId = new Map<string, Spell>();
      for (const spell of catalogRes.data) {
        if (spell.id) {
          byId.set(spell.id, spell);
        }
      }
      for (const spell of review) {
        if (spell.id && !byId.has(spell.id)) {
          byId.set(spell.id, spell);
        }
      }

      return Array.from(byId.values()).sort((a, b) => {
        if (a.level !== b.level) {
          return a.level - b.level;
        }
        return (a.title ?? "").localeCompare(b.title ?? "");
      });
    },
  });

  const selectedSpell = useMemo(() => {
    if (!spells.length) {
      return null;
    }

    return (
      spells.find((spell) => getSpellValue(spell) === selectedSpellId) ??
      spells[0]
    );
  }, [spells, selectedSpellId]);

  return (
    <div className="w-full space-y-6 p-6">
      <div className="print:hidden">
        <h1 className="text-2xl font-semibold">Card Printing</h1>
        <p className="text-sm text-muted-foreground">
          Template: {TEMPLATE_ID}. Preview five spell card styles, then print to
          PDF.
        </p>
      </div>

      <Card className="print:hidden">
        <CardHeader>
          <CardTitle>Spell Card Controls</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <p className="text-sm font-medium">Spell</p>
            <Select
              value={selectedSpell ? getSpellValue(selectedSpell) : ""}
              onValueChange={setSelectedSpellId}
              disabled={isLoading || spells.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a spell" />
              </SelectTrigger>
              <SelectContent>
                {spells.map((spell) => (
                  <SelectItem key={getSpellValue(spell)} value={getSpellValue(spell)}>
                    {spell.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Rendering Style</p>
            <Select
              value={selectedStyleId}
              onValueChange={(value) =>
                setSelectedStyleId(value as SpellCardStyleId)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select style" />
              </SelectTrigger>
              <SelectContent>
                {SPELL_CARD_STYLE_OPTIONS.map((style) => (
                  <SelectItem key={style.id} value={style.id}>
                    {style.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button
              className="w-full"
              onClick={() => window.print()}
              disabled={!selectedSpell}
            >
              Print / Save PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <Card className="print:hidden">
          <CardContent className="py-10 text-sm text-muted-foreground">
            Loading spells...
          </CardContent>
        </Card>
      ) : null}

      {isError ? (
        <Card className="print:hidden">
          <CardContent className="py-10 text-sm text-destructive">
            Failed to load spells.
          </CardContent>
        </Card>
      ) : null}

      {selectedSpell ? (
        <QuarterPagePrintShell>
          <SpellCardTemplate spell={selectedSpell} styleId={selectedStyleId} />
        </QuarterPagePrintShell>
      ) : (
        <Card className="print:hidden">
          <CardContent className="py-10 text-sm text-muted-foreground">
            No spells available yet. Create one in the Spell Tool first.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
