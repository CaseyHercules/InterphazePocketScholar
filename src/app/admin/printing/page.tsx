"use client";

import "./print.css";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { toRomanNumeral } from "@/lib/utils/roman-numerals";

const TEMPLATE_ID: PrintTemplateId = "spell";
const getSpellValue = (spell: Spell) => spell.id ?? spell.title;
const SPELLBOOKS_STORAGE_KEY = "admin-printing-spellbooks";

type Spellbook = {
  id: string;
  name: string;
  spellIds: string[];
};

export default function AdminPrintingPage() {
  const [selectedStyleId, setSelectedStyleId] = useState<SpellCardStyleId>(
    "minimal"
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [printQueueIds, setPrintQueueIds] = useState<string[]>([]);
  const [spellbooks, setSpellbooks] = useState<Spellbook[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }
    const stored = window.localStorage.getItem(SPELLBOOKS_STORAGE_KEY);
    if (!stored) {
      return [];
    }
    try {
      const parsed = JSON.parse(stored) as Spellbook[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [spellbookName, setSpellbookName] = useState("");
  const [selectedSpellbookId, setSelectedSpellbookId] = useState<string>("");

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

  useEffect(() => {
    window.localStorage.setItem(SPELLBOOKS_STORAGE_KEY, JSON.stringify(spellbooks));
  }, [spellbooks]);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const printQueue = useMemo(() => {
    const spellMap = new Map(spells.map((spell) => [getSpellValue(spell), spell]));
    return printQueueIds
      .map((id) => spellMap.get(id))
      .filter((spell): spell is Spell => Boolean(spell));
  }, [printQueueIds, spells]);

  const handleToggleSelected = (spellId: string) => {
    setSelectedIds((prev) =>
      prev.includes(spellId)
        ? prev.filter((id) => id !== spellId)
        : [...prev, spellId]
    );
  };

  const handleAddSelectedToQueue = () => {
    setPrintQueueIds((prev) => {
      const next = new Set(prev);
      selectedIds.forEach((id) => next.add(id));
      return Array.from(next);
    });
  };

  const handleRemoveSelectedFromQueue = () => {
    setPrintQueueIds((prev) => prev.filter((id) => !selectedSet.has(id)));
  };

  const handleSaveSpellbook = () => {
    const name = spellbookName.trim();
    if (!name || printQueueIds.length === 0) {
      return;
    }

    const existing = spellbooks.find((book) => book.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      setSpellbooks((prev) =>
        prev.map((book) =>
          book.id === existing.id ? { ...book, spellIds: printQueueIds } : book
        )
      );
      setSelectedSpellbookId(existing.id);
    } else {
      const id = `${Date.now()}`;
      setSpellbooks((prev) => [...prev, { id, name, spellIds: printQueueIds }]);
      setSelectedSpellbookId(id);
    }
    setSpellbookName("");
  };

  const handleLoadSpellbook = () => {
    const selectedSpellbook = spellbooks.find((book) => book.id === selectedSpellbookId);
    if (!selectedSpellbook) {
      return;
    }
    setPrintQueueIds(selectedSpellbook.spellIds);
  };

  return (
    <div className="w-full space-y-6 p-6">
      <div className="print:hidden">
        <h1 className="text-2xl font-semibold">Card Printing</h1>
        <p className="text-sm text-muted-foreground">
          Template: {TEMPLATE_ID}. Build a print queue or spellbook grouping, then
          print.
        </p>
      </div>

      <Card className="print:hidden">
        <CardHeader>
          <CardTitle>Spell Card Controls</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-2 lg:col-span-1">
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

          <div className="space-y-2 lg:col-span-2">
            <p className="text-sm font-medium">Spellbook Grouping</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <Input
                placeholder="Spellbook name"
                value={spellbookName}
                onChange={(e) => setSpellbookName(e.target.value)}
              />
              <Button onClick={handleSaveSpellbook} disabled={printQueueIds.length === 0}>
                Save Current Queue as Spellbook
              </Button>
              <Select value={selectedSpellbookId} onValueChange={setSelectedSpellbookId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select saved spellbook" />
                </SelectTrigger>
                <SelectContent>
                  {spellbooks.map((book) => (
                    <SelectItem key={book.id} value={book.id}>
                      {book.name} ({book.spellIds.length})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={handleLoadSpellbook} disabled={!selectedSpellbookId}>
                Load Spellbook into Queue
              </Button>
            </div>
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

      <Card className="print:hidden">
        <CardHeader>
          <CardTitle>Spell Selection Table</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="max-h-[420px] overflow-auto rounded-md border">
            <table className="w-full text-sm">
              <thead className="bg-muted/60">
                <tr>
                  <th className="px-3 py-2 text-left">Queue</th>
                  <th className="px-3 py-2 text-left">Spell</th>
                  <th className="px-3 py-2 text-left">Class</th>
                  <th className="px-3 py-2 text-left">Level</th>
                  <th className="px-3 py-2 text-left">Descriptors</th>
                </tr>
              </thead>
              <tbody>
                {spells.map((spell) => {
                  const spellId = getSpellValue(spell);
                  return (
                    <tr
                      key={spellId}
                      onClick={() => handleToggleSelected(spellId)}
                      className={selectedSet.has(spellId) ? "bg-muted/40" : "hover:bg-muted/20"}
                    >
                      <td className="px-3 py-2">
                        <input
                          type="checkbox"
                          checked={selectedSet.has(spellId)}
                          onChange={() => handleToggleSelected(spellId)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                      <td className="px-3 py-2 font-medium">{spell.title}</td>
                      <td className="px-3 py-2">{spell.type || "-"}</td>
                      <td className="px-3 py-2">{toRomanNumeral(spell.level)}</td>
                      <td className="px-3 py-2">
                        {spell.data?.descriptor?.length
                          ? spell.data.descriptor.join(", ")
                          : "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleAddSelectedToQueue} disabled={selectedIds.length === 0}>
              Add Selected to Print Queue
            </Button>
            <Button
              variant="outline"
              onClick={handleRemoveSelectedFromQueue}
              disabled={selectedIds.length === 0}
            >
              Remove Selected from Queue
            </Button>
            <Button
              className="ml-auto"
              onClick={() => window.print()}
              disabled={printQueue.length === 0}
            >
              Print Queue / Save PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {printQueue.length > 0 ? (
        <QuarterPagePrintShell
          cards={printQueue.map((spell) => (
            <SpellCardTemplate
              key={getSpellValue(spell)}
              spell={spell}
              styleId={selectedStyleId}
            />
          ))}
        >
          <div />
        </QuarterPagePrintShell>
      ) : (
        <Card className="print:hidden">
          <CardContent className="py-10 text-sm text-muted-foreground">
            Add spells to the print queue to preview and print cards.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
