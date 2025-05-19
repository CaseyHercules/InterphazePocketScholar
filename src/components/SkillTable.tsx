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
import { Skill } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SkillTableProps {
  skills: Skill[];
  onEdit?: (skill: Skill) => void;
  onView?: (skill: Skill) => void;
  onDelete?: (id: string) => void;
  isLoading?: boolean;
}

export function SkillTable({
  skills,
  onEdit,
  onView,
  onDelete,
  isLoading,
}: SkillTableProps) {
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Skill;
    direction: "asc" | "desc";
  }>({ key: "title", direction: "asc" });

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
    return matchesSearch && matchesTier;
  });

  // Sort and filter skills
  const sortedAndFilteredSkills = [...filteredSkills].sort((a, b) => {
    let aValue = a[sortConfig.key];
    let bValue = b[sortConfig.key];

    // Handle undefined/null values
    aValue = aValue ?? "";
    bValue = bValue ?? "";

    // For numeric fields, use numeric comparison
    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
    }

    // For other fields, use string comparison
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
          <div className="flex gap-4 ml-auto">
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
                  className="cursor-pointer w-[80px]"
                  onClick={() => onSort("tier")}
                >
                  Tier{" "}
                  {sortConfig?.key === "tier" && (
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
                <TableHead
                  className="cursor-pointer w-[120px]"
                  onClick={() => onSort("duration")}
                >
                  Duration{" "}
                  {sortConfig?.key === "duration" && (
                    <span>{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                  )}
                </TableHead>
                <TableHead className="text-right w-[150px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedAndFilteredSkills.map((skill) => (
                <TableRow key={skill.id}>
                  <TableCell className="max-w-[250px]">
                    <div className="font-medium truncate">{skill.title}</div>
                    {skill.descriptionShort && (
                      <div className="text-sm text-muted-foreground mt-1 truncate">
                        {truncateText(skill.descriptionShort)}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="max-w-[80px]">
                    <Badge variant="secondary">Tier {skill.tier}</Badge>
                  </TableCell>
                  <TableCell className="max-w-[150px]">
                    {skill.permenentEpReduction > 0
                      ? `Permanent EP -${skill.permenentEpReduction}`
                      : skill.epCost && skill.epCost.trim() !== ""
                      ? skill.epCost
                      : "—"}
                  </TableCell>
                  <TableCell className="max-w-[120px]">
                    {skill.duration || "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {onView && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onView(skill)}
                        >
                          View
                        </Button>
                      )}
                      {onEdit && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEdit(skill)}
                        >
                          Edit
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => onDelete(skill.id)}
                        >
                          Delete
                        </Button>
                      )}
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
