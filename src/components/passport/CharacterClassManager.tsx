"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown } from "lucide-react";
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

type ClassSummary = {
  id: string;
  Title: string;
};

type CharacterClassManagerProps = {
  characterId: string;
  primaryClassId: string | null;
  secondaryClassId: string | null;
  primaryClassLvl: number;
  secondaryClassLvl: number;
};

export function CharacterClassManager({
  characterId,
  primaryClassId,
  secondaryClassId,
  primaryClassLvl,
  secondaryClassLvl,
}: CharacterClassManagerProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [allClasses, setAllClasses] = useState<ClassSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [primaryLvl, setPrimaryLvl] = useState(primaryClassLvl);
  const [secondaryLvl, setSecondaryLvl] = useState(secondaryClassLvl);
  const [primaryValue, setPrimaryValue] = useState<string>(
    primaryClassId ?? ""
  );
  const [secondaryValue, setSecondaryValue] = useState<string>(
    secondaryClassId ?? ""
  );

  useEffect(() => {
    setPrimaryValue(primaryClassId ?? "");
    setSecondaryValue(secondaryClassId ?? "");
    setPrimaryLvl(primaryClassLvl);
    setSecondaryLvl(secondaryClassLvl);
  }, [primaryClassId, secondaryClassId, primaryClassLvl, secondaryClassLvl]);

  useEffect(() => {
    let isMounted = true;
    const loadClasses = async () => {
      try {
        const response = await fetch("/api/admin/class", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) {
          throw new Error(await response.text());
        }
        const data = (await response.json()) as ClassSummary[];
        if (isMounted) {
          setAllClasses(data ?? []);
        }
      } catch (error) {
        toast({
          title: "Failed to load classes",
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

    loadClasses();
    return () => {
      isMounted = false;
    };
  }, [toast]);

  const handleClassChange = async (
    slot: "primary" | "secondary",
    newClassId: string
  ) => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/admin/character-class", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          characterId,
          slot,
          classId: newClassId,
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      if (slot === "primary") {
        setPrimaryValue(newClassId);
      } else {
        setSecondaryValue(newClassId);
      }

      const classTitle =
        allClasses.find((c) => c.id === newClassId)?.Title ?? "Class";
      toast({
        title: `${slot === "primary" ? "Primary" : "Secondary"} class updated`,
        description: classTitle,
      });
      router.refresh();
    } catch (error) {
      toast({
        title: `Failed to update ${slot} class`,
        description:
          error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRefund = async (
    slot: "primary" | "secondary",
    levels: number
  ) => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/admin/character-level-refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          characterId,
          slot,
          levelsToRefund: levels,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Failed to refund");
      }

      const data = (await response.json()) as {
        newLevel: number;
        levelsRefunded: number;
      };
      if (slot === "primary") {
        setPrimaryLvl(data.newLevel);
      } else {
        setSecondaryLvl(data.newLevel);
      }

      toast({
        title: "Levels refunded",
        description: `${data.levelsRefunded} level(s) refunded from ${slot} class.`,
      });
      router.refresh();
    } catch (error) {
      toast({
        title: "Failed to refund levels",
        description:
          error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const canRefundPrimary = primaryLvl > 1;
  const canRefundSecondary =
    secondaryClassId && secondaryLvl > 0;

  return (
    <Card className="shadow-sm bg-gradient-to-r from-amber-50/70 via-orange-50/70 to-rose-50/70">
      <CardHeader className="p-1 sm:p-4 sm:pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base sm:text-lg pb-0">
            Manage Classes (Admin Only)
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
          <div className="flex flex-col gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Primary Class</label>
              <div className="flex items-center gap-2">
                <Select
                value={primaryValue}
                onValueChange={(v) => handleClassChange("primary", v)}
                disabled={isLoading || isSaving}
              >
                <SelectTrigger className="sm:max-w-xs">
                  <SelectValue
                    placeholder={
                      isLoading ? "Loading classes..." : "Select primary class"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {allClasses.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.Title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
                {canRefundPrimary && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleRefund("primary", 1)}
                    disabled={isSaving}
                    title="Refund 1 level"
                  >
                    <ArrowDown className="h-3 w-3 mr-1" />
                    Refund 1
                  </Button>
                )}
              </div>
              {canRefundPrimary && (
                <p className="text-xs text-muted-foreground">
                  Level {primaryLvl} (min 1)
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Secondary Class</label>
              <div className="flex items-center gap-2">
                <Select
                  value={secondaryValue}
                onValueChange={(v) => handleClassChange("secondary", v)}
                disabled={isLoading || isSaving}
              >
                <SelectTrigger className="sm:max-w-xs">
                  <SelectValue
                    placeholder={
                      isLoading ? "Loading classes..." : "Select secondary class"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {allClasses.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.Title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
                {canRefundSecondary && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleRefund("secondary", 1)}
                    disabled={isSaving}
                    title="Refund 1 level"
                  >
                    <ArrowDown className="h-3 w-3 mr-1" />
                    Refund 1
                  </Button>
                )}
              </div>
              {canRefundSecondary && (
                <p className="text-xs text-muted-foreground">
                  Level {secondaryLvl} (min 0)
                </p>
              )}
            </div>
          </div>
        )}

        {!isEditing && (
          <div className="text-sm text-muted-foreground">
            Click Edit to change the character&apos;s primary or secondary
            class, or refund levels.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
