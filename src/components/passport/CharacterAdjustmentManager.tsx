"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

type AdjustmentSummary = {
  id: string;
  title: string;
  archived?: boolean;
};

type CharacterAdjustmentManagerProps = {
  characterId: string;
  existingAdjustments: AdjustmentSummary[];
};

export function CharacterAdjustmentManager({
  characterId,
  existingAdjustments,
}: CharacterAdjustmentManagerProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [allAdjustments, setAllAdjustments] = useState<AdjustmentSummary[]>([]);
  const [currentAdjustments, setCurrentAdjustments] =
    useState<AdjustmentSummary[]>(existingAdjustments);
  const [selectedId, setSelectedId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setCurrentAdjustments(existingAdjustments);
  }, [existingAdjustments]);

  useEffect(() => {
    let isMounted = true;
    const loadAdjustments = async () => {
      try {
        const response = await fetch("/api/admin/adjustment", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) {
          throw new Error(await response.text());
        }
        const data = (await response.json()) as AdjustmentSummary[];
        if (isMounted) {
          setAllAdjustments(data ?? []);
        }
      } catch (error) {
        toast({
          title: "Failed to load adjustments",
          description:
            error instanceof Error ? error.message : "Please try again",
          variant: "destructive",
        });
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadAdjustments();
    return () => {
      isMounted = false;
    };
  }, [toast]);

  const availableAdjustments = useMemo(() => {
    const existingIds = new Set(currentAdjustments.map((adj) => adj.id));
    return allAdjustments.filter(
      (adj) => !adj.archived && !existingIds.has(adj.id)
    );
  }, [allAdjustments, currentAdjustments]);

  const handleAdd = async () => {
    if (!selectedId) return;
    setIsSaving(true);
    try {
      const response = await fetch("/api/admin/character-adjustment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ characterId, adjustmentId: selectedId }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const added = allAdjustments.find((adj) => adj.id === selectedId);
      if (added) {
        setCurrentAdjustments((prev) => [...prev, added]);
      }

      setSelectedId("");
      toast({
        title: "Adjustment added",
        description: added?.title ?? "Adjustment attached to character.",
      });
      router.refresh();
    } catch (error) {
      toast({
        title: "Failed to add adjustment",
        description:
          error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = async (adjustment: AdjustmentSummary) => {
    setIsSaving(true);
    try {
      const response = await fetch(
        `/api/admin/character-adjustment?characterId=${characterId}&adjustmentId=${adjustment.id}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        throw new Error(await response.text());
      }

      setCurrentAdjustments((prev) =>
        prev.filter((item) => item.id !== adjustment.id)
      );
      toast({
        title: "Adjustment removed",
        description: adjustment.title,
      });
      router.refresh();
    } catch (error) {
      toast({
        title: "Failed to remove adjustment",
        description:
          error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="shadow-sm bg-gradient-to-r from-amber-50/70 via-orange-50/70 to-rose-50/70">
      <CardHeader className="p-1 sm:p-4 sm:pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base sm:text-lg pb-0">
            Manage Adjustments (Admin Only)
          </CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsEditing((prev) => !prev)}
          >
            {isEditing ? "Done" : "Edit"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-1 sm:p-4 sm:pt-0 space-y-4">
        {isEditing && (
          <div className="flex flex-col sm:flex-row gap-2">
            <Select value={selectedId} onValueChange={setSelectedId}>
              <SelectTrigger className="sm:max-w-xs">
                <SelectValue
                  placeholder={
                    isLoading ? "Loading adjustments..." : "Select adjustment"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {availableAdjustments.length === 0 ? (
                  <SelectItem value="none" disabled>
                    No adjustments available
                  </SelectItem>
                ) : (
                  availableAdjustments.map((adj) => (
                    <SelectItem key={adj.id} value={adj.id}>
                      {adj.title}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <Button
              type="button"
              onClick={handleAdd}
              disabled={!selectedId || isSaving}
            >
              Add Adjustment
            </Button>
          </div>
        )}

        <div className="space-y-2">
          {currentAdjustments.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No adjustments assigned to this character.
            </div>
          ) : (
            currentAdjustments.map((adj) => (
              <div
                key={adj.id}
                className="flex items-center justify-between rounded-md border px-3 py-2"
              >
                <span className="text-sm">{adj.title}</span>
                {isEditing && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemove(adj)}
                    disabled={isSaving}
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
