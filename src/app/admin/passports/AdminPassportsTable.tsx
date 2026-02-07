"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "@/hooks/use-toast";

type CharacterRow = {
  id: string;
  name: string;
  primaryClassId: string | null;
  secondaryClassId: string | null;
  primaryClassLvl: number;
  secondaryClassLvl: number;
  userId: string | null;
  phazians: number;
  primaryClass: { Title: string } | null;
  secondaryClass: { Title: string } | null;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    username: string | null;
  } | null;
};

type UserOption = {
  id: string;
  name: string | null;
  email: string | null;
  username: string | null;
};

export function AdminPassportsTable({
  characters,
}: {
  characters: CharacterRow[];
}) {
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "unassigned">("all");
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [saving, setSaving] = useState(false);

  const filtered =
    filter === "unassigned"
      ? characters.filter((c) => !c.userId)
      : characters;

  const openAssign = useCallback((characterId: string) => {
    setAssigningId(characterId);
    setLoadingUsers(true);
    fetch("/api/admin/user")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .finally(() => setLoadingUsers(false));
  }, []);

  const assignOwner = useCallback(
    async (characterId: string, userId: string | null) => {
      setSaving(true);
      try {
        const res = await fetch(`/api/admin/characters/${characterId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });
        if (!res.ok) {
          const t = await res.text();
          toast({ title: "Failed to assign", description: t || res.statusText, variant: "destructive" });
          return;
        }
        setAssigningId(null);
        toast({ title: "Owner updated" });
        router.refresh();
      } finally {
        setSaving(false);
      }
    },
    [router]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Show:</span>
        <Select
          value={filter}
          onValueChange={(v) => setFilter(v as "all" | "unassigned")}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All passports</SelectItem>
            <SelectItem value="unassigned">Unassigned only</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Primary class</TableHead>
              <TableHead>Secondary class</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell>
                  {c.primaryClass
                    ? `${c.primaryClass.Title} (${c.primaryClassLvl})`
                    : "—"}
                </TableCell>
                <TableCell>
                  {c.secondaryClass && c.secondaryClass.Title
                    ? `${c.secondaryClass.Title} (${c.secondaryClassLvl})`
                    : "—"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {c.user
                    ? c.user.name || c.user.email || c.user.username || c.user.id
                    : "Unassigned"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/passport/${c.id}`}>View</Link>
                    </Button>
                    <Popover
                      open={assigningId === c.id}
                      onOpenChange={(open) => !open && setAssigningId(null)}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openAssign(c.id)}
                        >
                          Assign owner
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80" align="end">
                        <div className="space-y-2">
                          <p className="text-sm font-medium">
                            Assign owner for {c.name}
                          </p>
                          {loadingUsers ? (
                            <p className="text-sm text-muted-foreground">
                              Loading users…
                            </p>
                          ) : (
                            <Select
                              onValueChange={(uid) =>
                                assignOwner(
                                  c.id,
                                  uid === "__unassigned__" ? null : uid
                                )
                              }
                              disabled={saving}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select user" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="__unassigned__">
                                  Unassigned
                                </SelectItem>
                                {users.map((u) => (
                                  <SelectItem key={u.id} value={u.id}>
                                    {u.name || u.email || u.username || u.id}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/passports/${c.id}/edit`}>Edit</Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {filtered.length === 0 && (
        <p className="text-sm text-muted-foreground">
          {filter === "unassigned"
            ? "No unassigned passports."
            : "No passports."}
        </p>
      )}
    </div>
  );
}
