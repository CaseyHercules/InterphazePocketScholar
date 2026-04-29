"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Spell,
  SPELL_TYPES,
  SPELL_PUBLICATION_STATUS,
  SPELL_PUBLICATION_STATUS_LABELS,
} from "@/types/spell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Pencil, Trash2 } from "lucide-react";

interface SpellTableProps {
  spells: Spell[];
  onEdit?: (spell: Spell) => void;
  onView?: (spell: Spell) => void;
  onDelete?: (id: string) => void;
  isLoading?: boolean;
}

export function SpellTable({
  spells,
  onEdit,
  onView,
  onDelete,
  isLoading,
}: SpellTableProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [placementFilter, setPlacementFilter] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Spell | "descriptor";
    direction: "asc" | "desc";
  }>({ key: "title", direction: "asc" });

  // Helper function to truncate text
  const truncateText = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + "...";
  };

  const matchesPlacement = (spell: Spell) => {
    if (placementFilter === "all") {
      return true;
    }
    const s = spell.publicationStatus;
    if (placementFilter === "library") {
      return s === SPELL_PUBLICATION_STATUS.PUBLISHED_IN_LIBRARY;
    }
    if (placementFilter === "approved") {
      return s === SPELL_PUBLICATION_STATUS.PUBLISHED;
    }
    if (placementFilter === "archived") {
      return (
        s === SPELL_PUBLICATION_STATUS.ARCHIVED_PRIVATE ||
        s === SPELL_PUBLICATION_STATUS.ARCHIVED_PUBLIC_LEGACY
      );
    }
    return true;
  };

  const filteredSpells = spells.filter((spell) => {
    const matchesSearch = spell.title
      ? spell.title.toLowerCase().includes(search.toLowerCase())
      : false;
    const matchesType =
      typeFilter === "all" ||
      (spell.type?.toLowerCase() ?? "") === typeFilter.toLowerCase();
    return matchesSearch && matchesType && matchesPlacement(spell);
  });

  // Sort and filter spells
  const sortedAndFilteredSpells = [...filteredSpells].sort((a, b) => {
    let aValue =
      sortConfig.key === "descriptor"
        ? a.data?.descriptor?.join(", ")
        : a[sortConfig.key];
    let bValue =
      sortConfig.key === "descriptor"
        ? b.data?.descriptor?.join(", ")
        : b[sortConfig.key];

    // Handle undefined/null values
    aValue = aValue ?? "";
    bValue = bValue ?? "";

    // For level, use numeric comparison
    if (sortConfig.key === "level") {
      return sortConfig.direction === "asc"
        ? Number(aValue) - Number(bValue)
        : Number(bValue) - Number(aValue);
    }

    // For other fields, use string comparison
    return sortConfig.direction === "asc"
      ? String(aValue).localeCompare(String(bValue))
      : String(bValue).localeCompare(String(aValue));
  });

  // Helper function to handle sorting
  const onSort = (key: keyof Spell | "descriptor") => {
    setSortConfig((currentSort) => ({
      key,
      direction:
        currentSort.key === key && currentSort.direction === "asc"
          ? "desc"
          : "asc",
    }));
  };

  return (
    <Card>
      <CardHeader className="space-y-3 pb-3">
        <CardTitle>Spells</CardTitle>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
          <Input
            placeholder="Search spells..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full shrink-0 md:max-w-xs lg:max-w-md"
          />
          <div className="grid w-full min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 md:flex-1 md:gap-2">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="h-9 w-full min-w-0">
                <SelectValue placeholder="Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {SPELL_TYPES.map((type) => (
                  <SelectItem key={type} value={type.toLowerCase()}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={placementFilter} onValueChange={setPlacementFilter}>
              <SelectTrigger className="h-9 w-full min-w-0">
                <SelectValue placeholder="Placement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All placements</SelectItem>
                <SelectItem value="library">In library</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-0 sm:px-6">
        {isLoading ? (
          <div>Loading spells...</div>
        ) : (
          <Table className="[&_td]:px-3 [&_td]:py-2 [&_th]:h-auto [&_th]:px-3 [&_th]:py-2 [&_th]:text-xs">
            <TableHeader>
              <TableRow>
                <TableHead
                  className="cursor-pointer min-w-[12rem] max-w-[min(28rem,36vw)]"
                  onClick={() => onSort("title")}
                >
                  Name{" "}
                  {sortConfig?.key === "title" && (
                    <span>{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                  )}
                </TableHead>
                <TableHead
                  className="cursor-pointer whitespace-nowrap"
                  onClick={() => onSort("type")}
                >
                  Type{" "}
                  {sortConfig?.key === "type" && (
                    <span>{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                  )}
                </TableHead>
                <TableHead
                  className="cursor-pointer whitespace-nowrap"
                  onClick={() => onSort("level")}
                >
                  Level{" "}
                  {sortConfig?.key === "level" && (
                    <span>{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                  )}
                </TableHead>
                <TableHead
                  className="cursor-pointer min-w-[8rem]"
                  onClick={() => onSort("descriptor")}
                >
                  Descriptors{" "}
                  {sortConfig?.key === "descriptor" && (
                    <span>{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                  )}
                </TableHead>
                <TableHead
                  className="cursor-pointer min-w-[6rem]"
                  onClick={() => onSort("author")}
                >
                  Author{" "}
                  {sortConfig?.key === "author" && (
                    <span>{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                  )}
                </TableHead>
                <TableHead
                  className="cursor-pointer min-w-[7rem]"
                  onClick={() => onSort("publicationStatus")}
                >
                  Status{" "}
                  {sortConfig?.key === "publicationStatus" && (
                    <span>{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                  )}
                </TableHead>
                <TableHead className="w-[1%] whitespace-nowrap text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedAndFilteredSpells.map((spell) => (
                <TableRow key={spell.id}>
                  <TableCell className="max-w-[min(28rem,36vw)] align-top">
                    <div className="font-medium leading-tight">
                      <span className="line-clamp-2">{spell.title}</span>
                    </div>
                    {spell.description ? (
                      <div
                        className="mt-0.5 line-clamp-1 text-xs leading-snug text-muted-foreground"
                        title={spell.description}
                      >
                        {truncateText(spell.description, 72)}
                      </div>
                    ) : null}
                  </TableCell>
                  <TableCell className="align-top text-sm whitespace-nowrap">
                    {spell.type}
                  </TableCell>
                  <TableCell className="align-top tabular-nums text-sm">
                    {spell.level}
                  </TableCell>
                  <TableCell className="max-w-[14rem] align-top">
                    <div className="flex flex-wrap gap-0.5">
                      {spell.data?.descriptor?.map((desc) => (
                        <Badge
                          key={desc}
                          variant="secondary"
                          className="px-1.5 py-0 text-[10px] font-normal leading-none"
                        >
                          {desc}
                        </Badge>
                      )) || "-"}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[10rem] truncate align-top text-sm">
                    {spell.author || "-"}
                  </TableCell>
                  <TableCell className="max-w-[11rem] align-top text-xs leading-snug">
                    {spell.publicationStatus
                      ? SPELL_PUBLICATION_STATUS_LABELS[spell.publicationStatus]
                      : "-"}
                  </TableCell>
                  <TableCell className="align-top text-right">
                    <div className="inline-flex shrink-0 items-center justify-end gap-0.5">
                      {onView ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          title="View"
                          aria-label={`View ${spell.title}`}
                          onClick={() => onView(spell)}
                        >
                          <Eye className="h-4 w-4" aria-hidden />
                        </Button>
                      ) : null}
                      {onEdit ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          title="Edit"
                          aria-label={`Edit ${spell.title}`}
                          onClick={() => onEdit(spell)}
                        >
                          <Pencil className="h-4 w-4" aria-hidden />
                        </Button>
                      ) : null}
                      {onDelete ? (
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="h-8 w-8"
                          title="Delete"
                          aria-label={`Delete ${spell.title}`}
                          onClick={() => onDelete(spell.id!)}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden />
                        </Button>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
