"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Settings } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { CharacterInlineEffectsEditor } from "./CharacterInlineEffectsEditor";
import { CharacterClassManager } from "./CharacterClassManager";
import { CharacterAdjustmentManager } from "./CharacterAdjustmentManager";
import { CharacterAlignmentEditor } from "./CharacterAlignmentEditor";

type CharacterForAdmin = {
  id: string;
  name: string;
  primaryClassId: string | null;
  secondaryClassId: string | null;
  primaryClassLvl: number;
  secondaryClassLvl: number;
  inlineEffectsJson?: unknown;
  alignmentJson?: unknown;
  userId?: string | null;
};

type AdjustmentSummary = {
  id: string;
  title: string;
};

type PassportAdminDialogProps = {
  character: CharacterForAdmin;
  existingAdjustments: AdjustmentSummary[];
};

export function PassportAdminDialog({
  character,
  existingAdjustments,
}: PassportAdminDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<{ id: string; name: string | null; email: string | null; username: string | null }[]>([]);
  const [ownerSaving, setOwnerSaving] = useState(false);

  useEffect(() => {
    if (open) {
      fetch("/api/admin/user")
        .then((r) => (r.ok ? r.json() : []))
        .then((data) => setUsers(Array.isArray(data) ? data : []));
    }
  }, [open]);

  const currentUserId = character.userId ?? null;
  const currentOwner = users.find((u) => u.id === currentUserId);
  const currentOwnerLabel = currentOwner
    ? currentOwner.name || currentOwner.email || currentOwner.username || currentOwner.id
    : currentUserId
      ? "Unknown user"
      : "Unassigned";

  const handleOwnerChange = async (userId: string | null) => {
    setOwnerSaving(true);
    try {
      const res = await fetch(`/api/admin/characters/${character.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userId || null }),
      });
      if (!res.ok) {
        toast({ title: "Failed to update owner", variant: "destructive" });
        return;
      }
      toast({ title: "Owner updated" });
      router.refresh();
    } finally {
      setOwnerSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Settings className="h-4 w-4" />
          Admin
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>Character Admin</DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-1 px-6 pb-6 min-h-0">
          <div className="space-y-4 pr-4">
            <div className="space-y-2">
              <Label>Owner</Label>
              <Select
                value={currentUserId ?? "__unassigned__"}
                onValueChange={(v) =>
                  handleOwnerChange(v === "__unassigned__" ? null : v)
                }
                disabled={ownerSaving}
              >
                <SelectTrigger>
                  <SelectValue placeholder={currentOwnerLabel} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__unassigned__">Unassigned</SelectItem>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name || u.email || u.username || u.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <CharacterInlineEffectsEditor
              characterId={character.id}
              characterName={character.name}
              inlineEffectsJson={character.inlineEffectsJson}
            />
            <CharacterClassManager
              characterId={character.id}
              primaryClassId={character.primaryClassId}
              secondaryClassId={character.secondaryClassId}
              primaryClassLvl={character.primaryClassLvl}
              secondaryClassLvl={character.secondaryClassLvl}
            />
            <CharacterAdjustmentManager
              characterId={character.id}
              existingAdjustments={existingAdjustments}
            />
            <CharacterAlignmentEditor
              characterId={character.id}
              alignmentJson={character.alignmentJson}
            />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
