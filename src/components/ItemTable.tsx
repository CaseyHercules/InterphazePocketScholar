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
import { Item, ITEM_TYPES } from "@/types/item";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface ItemTableProps {
  items: Item[];
  onEdit?: (item: Item) => void;
  onView?: (item: Item) => void;
  onArchive?: (id: string) => void;
  isLoading?: boolean;
  showArchived?: boolean;
  onShowArchivedChange?: (show: boolean) => void;
}

export function ItemTable({
  items,
  onEdit,
  onView,
  onArchive,
  isLoading,
  showArchived = false,
  onShowArchivedChange,
}: ItemTableProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<{
    key: "title" | "type" | "quantity";
    direction: "asc" | "desc";
  }>({ key: "title", direction: "asc" });

  const truncateText = (text: string, maxLength = 50) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + "...";
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.title
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesType =
      typeFilter === "all" ||
      (item.type ?? "").toLowerCase() === typeFilter.toLowerCase();
    return matchesSearch && matchesType;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    let aVal: string | number =
      sortConfig.key === "type" ? (a.type ?? "") : a[sortConfig.key];
    let bVal: string | number =
      sortConfig.key === "type" ? (b.type ?? "") : b[sortConfig.key];
    if (sortConfig.key === "quantity") {
      return sortConfig.direction === "asc"
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    }
    return sortConfig.direction === "asc"
      ? String(aVal).localeCompare(String(bVal))
      : String(bVal).localeCompare(String(aVal));
  });

  const onSort = (key: "title" | "type" | "quantity") => {
    setSortConfig((prev) => ({
      key,
      direction:
        prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Items</CardTitle>
        <div className="flex flex-col sm:flex-row gap-4 mt-4 items-center">
          <Input
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-[400px]"
          />
          <div className="flex flex-wrap gap-4 ml-auto">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {ITEM_TYPES.map((type) => (
                  <SelectItem key={type} value={type.toLowerCase()}>
                    {type.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {onShowArchivedChange && (
              <div className="flex items-center gap-2">
                <Switch
                  id="show-archived"
                  checked={showArchived}
                  onCheckedChange={onShowArchivedChange}
                />
                <Label htmlFor="show-archived" className="text-sm">
                  Show archived
                </Label>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <div>Loading items...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="cursor-pointer w-[300px]"
                  onClick={() => onSort("title")}
                >
                  Name{" "}
                  {sortConfig.key === "title" && (
                    <span>{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                  )}
                </TableHead>
                <TableHead
                  className="cursor-pointer w-[120px]"
                  onClick={() => onSort("type")}
                >
                  Type{" "}
                  {sortConfig.key === "type" && (
                    <span>{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                  )}
                </TableHead>
                <TableHead
                  className="cursor-pointer w-[80px]"
                  onClick={() => onSort("quantity")}
                >
                  Qty{" "}
                  {sortConfig.key === "quantity" && (
                    <span>{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                  )}
                </TableHead>
                <TableHead className="text-right w-[150px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedItems.map((item) => (
                <TableRow key={item.id!}>
                  <TableCell className="max-w-[300px]">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium truncate">{item.title}</span>
                      {item.archived && (
                        <Badge variant="outline" className="text-xs">
                          Archived
                        </Badge>
                      )}
                    </div>
                    {item.description && (
                      <div className="text-sm text-muted-foreground mt-1 truncate">
                        {truncateText(item.description)}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="max-w-[120px]">
                    {item.type?.replace(/_/g, " ") ?? "—"}
                  </TableCell>
                  <TableCell className="max-w-[80px]">
                    {item.quantity ?? 1}
                  </TableCell>
                  <TableCell className="text-right max-w-[150px]">
                    {onView && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onView(item)}
                      >
                        View
                      </Button>
                    )}
                    {onEdit && !item.archived && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(item)}
                        className="ml-2"
                      >
                        Edit
                      </Button>
                    )}
                    {onArchive && !item.archived && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onArchive(item.id!)}
                        className="ml-2"
                      >
                        Archive
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
