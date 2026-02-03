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
import { Skill, Class } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SkillTableProps {
  skills: (Skill & { class?: Class | null })[];
  onEdit?: (skill: Skill & { class?: Class | null }) => void;
  onView?: (skill: Skill & { class?: Class | null }) => void;
  onDelete?: (id: string) => void;
  isLoading?: boolean;
  showClassFilter?: boolean;
  showClassColumn?: boolean;
  enableRowClick?: boolean;
  showActionsColumn?: boolean;
}

export function SkillTable({
  skills,
  onEdit,
  onView,
  onDelete,
  isLoading,
  showClassFilter = true,
  showClassColumn = true,
  enableRowClick = false,
  showActionsColumn = true,
}: SkillTableProps) {
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [classFilter, setClassFilter] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Skill;
    direction: "asc" | "desc";
  }>({ key: "tier", direction: "asc" });

  // Helper function to truncate text
  const truncateText = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + "...";
  };

  // Filter skills based on search and tier
  const filteredSkills = skills.filter((skill) => {
    const matchesSearch = skill.title
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesTier =
      tierFilter === "all" || skill.tier.toString() === tierFilter;
    const matchesClass =
      !showClassFilter ||
      classFilter === "all" ||
      skill.class?.Title === classFilter;
    return matchesSearch && matchesTier && matchesClass;
  });

  const sortedAndFilteredSkills = [...filteredSkills].sort((a, b) => {
    let aValue = a[sortConfig.key];
    let bValue = b[sortConfig.key];

    if (sortConfig.key === "tier") {
      const tierA = Number(aValue) || 0;
      const tierB = Number(bValue) || 0;
      const primary =
        sortConfig.direction === "asc" ? tierA - tierB : tierB - tierA;
      if (primary !== 0) return primary;
      return (a.title ?? "").localeCompare(b.title ?? "");
    }

    aValue = aValue ?? "";
    bValue = bValue ?? "";
    if (typeof aValue === "number" && typeof bValue === "number") {
      const primary =
        sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
      if (primary !== 0) return primary;
      return (a.title ?? "").localeCompare(b.title ?? "");
    }

    return sortConfig.direction === "asc"
      ? String(aValue).localeCompare(String(bValue))
      : String(bValue).localeCompare(String(aValue));
  });

  // Helper function to handle sorting
  const onSort = (key: keyof Skill) => {
    setSortConfig((currentSort) => ({
      key,
      direction:
        currentSort.key === key && currentSort.direction === "asc"
          ? "desc"
          : "asc",
    }));
  };

  const TIERS = ["1", "2", "3", "4"];
  const classOptions = showClassFilter
    ? (Array.from(
        new Set(skills.map((skill) => skill.class?.Title).filter(Boolean))
      ) as string[])
    : [];
  const hasClassOptions = classOptions.length > 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Skills</CardTitle>
        <div className="flex flex-col sm:flex-row gap-4 mt-4 items-center">
          <Input
            placeholder="Search skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-[400px]"
          />
          <div className="flex flex-wrap gap-4 ml-auto">
            <Select value={tierFilter} onValueChange={setTierFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                {TIERS.map((tier) => (
                  <SelectItem key={tier} value={tier}>
                    Tier {tier}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {showClassFilter && (
              <Select
                value={classFilter}
                onValueChange={setClassFilter}
                disabled={!hasClassOptions}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {classOptions.map((classTitle) => (
                    <SelectItem key={classTitle} value={classTitle}>
                      {classTitle}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div>Loading skills...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="cursor-pointer w-[250px]"
                  onClick={() => onSort("title")}
                >
                  Name{" "}
                  {sortConfig?.key === "title" && (
                    <span>{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                  )}
                </TableHead>
                <TableHead
                  className="cursor-pointer min-w-[200px]"
                  onClick={() => onSort("duration")}
                >
                  Duration{" "}
                  {sortConfig?.key === "duration" && (
                    <span>{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                  )}
                </TableHead>
                <TableHead
                  className="cursor-pointer w-[150px]"
                  onClick={() => onSort("epCost")}
                >
                  EP Cost{" "}
                  {sortConfig?.key === "epCost" && (
                    <span>{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                  )}
                </TableHead>
                {showClassColumn && classFilter === "all" && (
                  <TableHead className="w-[120px]">Class</TableHead>
                )}
                {showActionsColumn && (onView || onEdit || onDelete) && (
                  <TableHead className="text-right w-[150px]">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedAndFilteredSkills.map((skill) => (
                <TableRow
                  key={skill.id}
                  onClick={enableRowClick ? () => onView?.(skill) : undefined}
                  className={
                    enableRowClick && onView ? "cursor-pointer" : undefined
                  }
                >
                  <TableCell className="max-w-[40%]">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium truncate">{skill.title}</span>
                      <Badge variant="secondary" className="shrink-0">
                        Tier {skill.tier}
                      </Badge>
                    </div>
                    {skill.descriptionShort && (
                      <div className="text-sm text-muted-foreground mt-1 truncate">
                        {truncateText(skill.descriptionShort)}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="max-w-[30%]">
                    {skill.duration || "—"}
                  </TableCell>
                  <TableCell className="max-w-[30%]">  
                    {skill.permenentEpReduction > 0
                      ? `Permanent EP -${skill.permenentEpReduction}`
                      : skill.epCost && skill.epCost.trim() !== ""
                      ? skill.epCost
                      : "—"}
                  </TableCell>
                  {showClassColumn && classFilter === "all" && (
                    <TableCell className="max-w-[120px]">
                      {skill.class?.Title || "—"}
                    </TableCell>
                  )}
                  {showActionsColumn && (onView || onEdit || onDelete) && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {onView && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(event) => {
                              event.stopPropagation();
                              onView(skill);
                            }}
                          >
                            View
                          </Button>
                        )}
                        {onEdit && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(event) => {
                              event.stopPropagation();
                              onEdit(skill);
                            }}
                          >
                            Edit
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={(event) => {
                              event.stopPropagation();
                              onDelete(skill.id);
                            }}
                          >
                            Delete
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
