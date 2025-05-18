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
import { Spell, SPELL_TYPES } from "@/types/spell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Spell | "castingTime";
    direction: "asc" | "desc";
  } | null>(null);

  // Helper function to get tier from level
  const getTier = (level: number): string => {
    if (level >= 1 && level <= 5) return "Tier 1";
    if (level >= 6 && level <= 12) return "Tier 2";
    if (level >= 13 && level <= 19) return "Tier 3";
    if (level === 20) return "Tier 4";
    return "Unknown";
  };

  // Filter spells based on search, type, and level
  const filteredSpells = spells.filter((spell) => {
    const matchesSearch = spell.title
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesType =
      typeFilter === "all" ||
      spell.type?.toLowerCase() === typeFilter.toLowerCase();
    const matchesLevel =
      levelFilter === "all" || getTier(spell.level) === levelFilter;
    return matchesSearch && matchesType && matchesLevel;
  });

  // Define tiers for the filter dropdown
  const TIERS = ["Tier 1", "Tier 2", "Tier 3", "Tier 4"];

  // Helper function to handle sorting
  const onSort = (key: keyof Spell | "castingTime") => {
    setSortConfig((currentSort) => {
      if (currentSort?.key === key) {
        return {
          key,
          direction: currentSort.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key, direction: "asc" };
    });
  };

  // Sort and filter spells
  const sortedAndFilteredSpells = [...filteredSpells].sort((a, b) => {
    if (!sortConfig) return 0;

    let aValue =
      sortConfig.key === "castingTime"
        ? a.data?.castingTime
        : a[sortConfig.key];
    let bValue =
      sortConfig.key === "castingTime"
        ? b.data?.castingTime
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

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Spells</CardTitle>
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <Input
            placeholder="Search spells..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="sm:max-w-[200px]"
          />
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="sm:max-w-[200px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {SPELL_TYPES.map((type) => (
                <SelectItem key={type} value={type.toLowerCase()}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={levelFilter} onValueChange={setLevelFilter}>
            <SelectTrigger className="sm:max-w-[200px]">
              <SelectValue placeholder="Filter by tier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tiers</SelectItem>
              {TIERS.map((tier) => (
                <SelectItem key={tier} value={tier}>
                  {tier} (
                  {tier === "Tier 1"
                    ? "Levels 1-5"
                    : tier === "Tier 2"
                    ? "Levels 6-12"
                    : tier === "Tier 3"
                    ? "Levels 13-19"
                    : "Level 20"}
                  )
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <div>Loading spells...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => onSort("title")}
                >
                  Name{" "}
                  {sortConfig?.key === "title" && (
                    <span>{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                  )}
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => onSort("type")}
                >
                  Type{" "}
                  {sortConfig?.key === "type" && (
                    <span>{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                  )}
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => onSort("level")}
                >
                  Level{" "}
                  {sortConfig?.key === "level" && (
                    <span>{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                  )}
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => onSort("castingTime")}
                >
                  Casting Time{" "}
                  {sortConfig?.key === "castingTime" && (
                    <span>{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                  )}
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedAndFilteredSpells.map((spell) => (
                <TableRow key={spell.id}>
                  <TableCell>
                    <div className="font-medium">{spell.title}</div>
                    {spell.description && (
                      <div className="text-sm text-muted-foreground mt-1">
                        {spell.description}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{spell.type}</TableCell>
                  <TableCell>{spell.level}</TableCell>
                  <TableCell>{spell.data?.castingTime || "-"}</TableCell>
                  <TableCell className="text-right space-x-2">
                    {onView && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onView(spell)}
                      >
                        View
                      </Button>
                    )}
                    {onEdit && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(spell)}
                      >
                        Edit
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onDelete(spell.id!)}
                      >
                        Delete
                      </Button>
                    )}
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
