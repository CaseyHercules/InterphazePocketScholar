"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  parseAlignmentFromJson,
  isValidAlignmentData,
  ALIGNMENT_MIN,
  ALIGNMENT_MAX,
  ALIGNMENT_MAX_TICKS,
  type AlignmentData,
} from "@/types/alignment";
import { useToast } from "@/hooks/use-toast";

type CharacterAlignmentEditorProps = {
  characterId: string;
  alignmentJson?: unknown;
};

const defaultAlignment: AlignmentData = [1, 0, 0];

export function CharacterAlignmentEditor({
  characterId,
  alignmentJson,
}: CharacterAlignmentEditorProps) {
  const router = useRouter();
  const { toast } = useToast();
  const parsed = parseAlignmentFromJson(alignmentJson) ?? defaultAlignment;
  const [alignment, setAlignment] = useState(parsed[0]);
  const [upTicks, setUpTicks] = useState(parsed[1]);
  const [downTicks, setDownTicks] = useState(parsed[2]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const next = parseAlignmentFromJson(alignmentJson) ?? defaultAlignment;
    setAlignment(next[0]);
    setUpTicks(next[1]);
    setDownTicks(next[2]);
  }, [alignmentJson]);

  const handleSave = async () => {
    const payload: AlignmentData = [alignment, upTicks, downTicks];
    if (!isValidAlignmentData(payload)) {
      toast({
        title: "Invalid alignment",
        description: `Level ${ALIGNMENT_MIN}-${ALIGNMENT_MAX}, ticks 0-${ALIGNMENT_MAX_TICKS}`,
        variant: "destructive",
      });
      return;
    }
    setIsSaving(true);
    try {
      const response = await fetch("/api/admin/character-alignment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ characterId, alignment: payload }),
      });
      if (!response.ok) throw new Error(await response.text());
      toast({ title: "Alignment saved" });
      router.refresh();
    } catch (error) {
      toast({
        title: "Failed to save alignment",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Alignment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Level</Label>
            <Select
              value={String(alignment)}
              onValueChange={(v) => setAlignment(Number(v))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from(
                  { length: ALIGNMENT_MAX - ALIGNMENT_MIN + 1 },
                  (_, i) => ALIGNMENT_MIN + i
                ).map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Up ticks</Label>
            <Select
              value={String(upTicks)}
              onValueChange={(v) => setUpTicks(Number(v))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from(
                  { length: ALIGNMENT_MAX_TICKS + 1 },
                  (_, i) => i
                ).map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Down ticks</Label>
            <Select
              value={String(downTicks)}
              onValueChange={(v) => setDownTicks(Number(v))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from(
                  { length: ALIGNMENT_MAX_TICKS + 1 },
                  (_, i) => i
                ).map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button onClick={handleSave} disabled={isSaving} size="sm">
          {isSaving ? "Saving…" : "Save alignment"}
        </Button>
      </CardContent>
    </Card>
  );
}
