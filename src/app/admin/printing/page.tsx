"use client";

import axios from "axios";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import {
  DEFAULT_SPELL_CARD_STYLE_ID,
  QuarterPagePrintShell,
  getSpellCardKey,
  renderSpellCardsForPrint,
} from "@/components/print-cards";
import { Spell } from "@/types/spell";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Spellbook = {
  id: string;
  name: string;
  spellIds: string[];
  styleId?: string | null;
};

type SortKey = "title" | "class" | "level" | "descriptors";
type PaperSize = "letter" | "a4";
type MarginInches = 0.25 | 0.35 | 0.5;
type PdfRenderer = "pdf-lib" | "html-pilot";

function SortableHeader({
  label,
  columnKey,
  activeKey,
  dir,
  onSort,
}: {
  label: string;
  columnKey: SortKey;
  activeKey: SortKey;
  dir: "asc" | "desc";
  onSort: (key: SortKey) => void;
}) {
  return (
    <th
      className="px-3 py-2 text-left"
      aria-sort={
        activeKey === columnKey
          ? dir === "asc"
            ? "ascending"
            : "descending"
          : "none"
      }
    >
      <button
        type="button"
        className="-mx-1 inline-flex items-center gap-1 rounded px-1 py-0.5 font-medium hover:bg-muted/80"
        onClick={() => onSort(columnKey)}
      >
        {label}
        {activeKey === columnKey ? (
          dir === "asc" ? (
            <ArrowUp className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
          ) : (
            <ArrowDown className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
          )
        ) : (
          <ArrowUpDown className="h-3.5 w-3.5 shrink-0 opacity-35" aria-hidden />
        )}
      </button>
    </th>
  );
}

export default function AdminPrintingPage() {
  const queryClient = useQueryClient();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [classFilter, setClassFilter] = useState<string>("all");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("title");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [printQueueIds, setPrintQueueIds] = useState<string[]>([]);
  const [spellbookName, setSpellbookName] = useState("");
  const [selectedSpellbookId, setSelectedSpellbookId] = useState<string>("");
  const [paperSize, setPaperSize] = useState<PaperSize>("letter");
  const [marginInches, setMarginInches] = useState<MarginInches>(0.25);
  const [showCropMarks, setShowCropMarks] = useState(false);
  const [pdfRenderer, setPdfRenderer] = useState<PdfRenderer>("pdf-lib");
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfExportOpen, setPdfExportOpen] = useState(false);

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

  const { data: spellbooks = [] } = useQuery<Spellbook[]>({
    queryKey: ["admin-spellbooks"],
    queryFn: async () => {
      const response = await axios.get<Spellbook[]>("/api/admin/spellbooks");
      return response.data;
    },
  });

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const printQueue = useMemo(() => {
    const spellMap = new Map(spells.map((spell) => [getSpellCardKey(spell), spell]));
    return printQueueIds
      .map((id) => spellMap.get(id))
      .filter((spell): spell is Spell => Boolean(spell));
  }, [printQueueIds, spells]);
  const queuedSheetCount = Math.ceil(printQueue.length / 4);
  const availableClasses = useMemo(
    () =>
      Array.from(
        new Set(spells.map((spell) => spell.type).filter((value): value is string => Boolean(value)))
      ).sort((a, b) => a.localeCompare(b)),
    [spells]
  );
  const availableLevels = useMemo(
    () => Array.from(new Set(spells.map((spell) => spell.level))).sort((a, b) => a - b),
    [spells]
  );
  const filteredSpells = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return spells.filter((spell) => {
      const matchesSearch =
        term.length === 0 ||
        spell.title.toLowerCase().includes(term) ||
        (spell.description || "").toLowerCase().includes(term) ||
        (spell.data?.effect || "").toLowerCase().includes(term) ||
        (spell.data?.method || "").toLowerCase().includes(term);
      const matchesClass = classFilter === "all" || (spell.type || "") === classFilter;
      const matchesLevel =
        levelFilter === "all" || String(spell.level) === levelFilter;
      return matchesSearch && matchesClass && matchesLevel;
    });
  }, [spells, searchTerm, classFilter, levelFilter]);

  const sortedSpells = useMemo(() => {
    const list = [...filteredSpells];
    const sign = sortDir === "asc" ? 1 : -1;
    list.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "title":
          cmp = (a.title ?? "").localeCompare(b.title ?? "", undefined, {
            sensitivity: "base",
          });
          break;
        case "class":
          cmp = (a.type || "").localeCompare(b.type || "", undefined, {
            sensitivity: "base",
          });
          break;
        case "level":
          cmp = a.level - b.level;
          break;
        case "descriptors": {
          const da = (a.data?.descriptor ?? []).join(", ");
          const db = (b.data?.descriptor ?? []).join(", ");
          cmp = da.localeCompare(db, undefined, { sensitivity: "base" });
          break;
        }
      }
      return cmp * sign;
    });
    return list;
  }, [filteredSpells, sortKey, sortDir]);

  const handleDownloadPdf = async () => {
    if (printQueueIds.length === 0) {
      return;
    }
    setPdfLoading(true);
    try {
      const endpoint =
        pdfRenderer === "html-pilot"
          ? "/api/admin/spell-cards/pdf-html"
          : "/api/admin/spell-cards/pdf";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          spellIds: printQueueIds,
          paperSize,
          marginInches,
          showCropMarks,
        }),
      });
      const contentType = res.headers.get("content-type") ?? "";
      if (!res.ok) {
        let message = `Request failed (${res.status})`;
        if (contentType.includes("application/json")) {
          const body = (await res.json()) as { error?: string };
          if (body.error) {
            message = body.error;
          }
        }
        toast({
          title: "PDF export failed",
          description: message,
          variant: "destructive",
        });
        return;
      }
      if (!contentType.includes("pdf")) {
        toast({
          title: "PDF export failed",
          description: "Server did not return a PDF.",
          variant: "destructive",
        });
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const stamp = new Date().toISOString().slice(0, 10);
      a.download =
        pdfRenderer === "html-pilot"
          ? `spell-cards-html-pilot-${stamp}.pdf`
          : `spell-cards-${stamp}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      setPdfExportOpen(false);
    } catch {
      toast({
        title: "PDF export failed",
        description: "Network error while generating the PDF.",
        variant: "destructive",
      });
    } finally {
      setPdfLoading(false);
    }
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

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

  const handleSaveSpellbook = async () => {
    const name = spellbookName.trim();
    if (!name || printQueueIds.length === 0) {
      return;
    }

    const existing = spellbooks.find(
      (book) => book.name.toLowerCase() === name.toLowerCase()
    );
    if (existing?.id) {
      const response = await axios.put<Spellbook>("/api/admin/spellbooks", {
        id: existing.id,
        name,
        spellIds: printQueueIds,
        styleId: DEFAULT_SPELL_CARD_STYLE_ID,
      });
      setSelectedSpellbookId(response.data.id);
    } else {
      const response = await axios.post<Spellbook>("/api/admin/spellbooks", {
        name,
        spellIds: printQueueIds,
        styleId: DEFAULT_SPELL_CARD_STYLE_ID,
      });
      setSelectedSpellbookId(response.data.id);
    }
    await queryClient.invalidateQueries({ queryKey: ["admin-spellbooks"] });
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
      </div>

      <Card className="print:hidden">
        <CardHeader>
          <CardTitle>Spellbooks</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-1">
          <div className="space-y-2 lg:col-span-1">
            <p className="text-sm font-medium">Spellbook grouping</p>
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
          <div className="grid gap-2 md:grid-cols-3">
            <Input
              placeholder="Search title/description/effect..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All classes</SelectItem>
                {availableClasses.map((className) => (
                  <SelectItem key={className} value={className}>
                    {className}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All levels</SelectItem>
                {availableLevels.map((level) => (
                  <SelectItem key={String(level)} value={String(level)}>
                    Level {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="max-h-[420px] overflow-auto rounded-md border">
            <table className="w-full text-sm">
              <thead className="bg-muted/60">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Selection</th>
                  <SortableHeader
                    label="Spell"
                    columnKey="title"
                    activeKey={sortKey}
                    dir={sortDir}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    label="Class"
                    columnKey="class"
                    activeKey={sortKey}
                    dir={sortDir}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    label="Level"
                    columnKey="level"
                    activeKey={sortKey}
                    dir={sortDir}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    label="Descriptors"
                    columnKey="descriptors"
                    activeKey={sortKey}
                    dir={sortDir}
                    onSort={handleSort}
                  />
                </tr>
              </thead>
              <tbody>
                {sortedSpells.map((spell) => {
                  const spellId = getSpellCardKey(spell);
                  const detailTitle = [
                    `Title: ${spell.title}`,
                    `Class: ${spell.type || "-"}`,
                    `Level: ${spell.level}`,
                    `Descriptors: ${spell.data?.descriptor?.join(", ") || "-"}`,
                    `Casting Time: ${spell.data?.castingTime || "-"}`,
                    `Range: ${spell.data?.range || "-"}`,
                    `Area of Effect: ${spell.data?.areaOfEffect || "-"}`,
                    `Duration: ${spell.data?.duration || "-"}`,
                    `Save: ${spell.data?.save || "-"}`,
                    `Effect: ${spell.data?.effect || "-"}`,
                    `Method: ${spell.data?.method || "-"}`,
                    `Description: ${spell.description || "-"}`,
                  ].join("\n");
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
                      <td className="px-3 py-2 font-medium" title={detailTitle}>
                        {spell.title}
                      </td>
                      <td className="px-3 py-2">{spell.type || "-"}</td>
                      <td className="px-3 py-2 tabular-nums">{spell.level}</td>
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
          <p className="text-sm text-muted-foreground">
            Queue: {printQueue.length} card{printQueue.length === 1 ? "" : "s"} across{" "}
            {queuedSheetCount} sheet{queuedSheetCount === 1 ? "" : "s"}.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleAddSelectedToQueue} disabled={selectedIds.length === 0}>
              Add Selected to Print Selection
            </Button>
            <Button
              variant="outline"
              onClick={handleRemoveSelectedFromQueue}
              disabled={selectedIds.length === 0}
            >
              Remove Selected from Selection
            </Button>
            <Button
              className="ml-auto"
              onClick={() => setPdfExportOpen(true)}
              disabled={printQueueIds.length === 0 || pdfLoading}
            >
              Download PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={pdfExportOpen} onOpenChange={setPdfExportOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>PDF export</DialogTitle>
            <DialogDescription>
              Choose paper and margin. PDFs are generated server-side; preview uses the same card
              layout (5×3 landscape, 2×2 cards per page).
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-1">
              <p className="text-sm font-medium">PDF renderer</p>
              <Select
                value={pdfRenderer}
                onValueChange={(value) => setPdfRenderer(value as PdfRenderer)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select renderer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf-lib">Stable renderer (pdf-lib)</SelectItem>
                  <SelectItem value="html-pilot">HTML pilot renderer (Playwright)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Paper size</p>
              <Select value={paperSize} onValueChange={(value) => setPaperSize(value as PaperSize)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select paper size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="letter">Letter (11 × 8.5 landscape)</SelectItem>
                  <SelectItem value="a4">A4 (11.69 × 8.27 landscape)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Page margin</p>
              <Select
                value={String(marginInches)}
                onValueChange={(value) => setMarginInches(Number(value) as MarginInches)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select margin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.25">0.25 in</SelectItem>
                  <SelectItem value="0.35">0.35 in</SelectItem>
                  <SelectItem value="0.5">0.50 in</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showCropMarks}
                onChange={(event) => setShowCropMarks(event.target.checked)}
              />
              Cut guides on PDF cards
            </label>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setPdfExportOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleDownloadPdf} disabled={pdfLoading}>
              {pdfLoading ? "Generating…" : "Generate & download"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {printQueue.length > 0 ? (
        <QuarterPagePrintShell cards={renderSpellCardsForPrint(printQueue)} />
      ) : (
        <Card className="print:hidden">
          <CardContent className="py-10 text-sm text-muted-foreground">
            Add spells to the print selection to preview cards.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
