"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SkillEffectsEditor } from "@/components/SkillEffectsEditor";
import { getEffectsFromJson, createEffectsJson, type SkillEffect } from "@/types/skill-effects";
import { useToast } from "@/hooks/use-toast";

type CharacterInlineEffectsEditorProps = {
  characterId: string;
  characterName: string;
  inlineEffectsJson: unknown;
};

export function CharacterInlineEffectsEditor({
  characterId,
  characterName,
  inlineEffectsJson,
}: CharacterInlineEffectsEditorProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [effects, setEffects] = useState<SkillEffect[]>(() =>
    getEffectsFromJson(inlineEffectsJson)
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setEffects(getEffectsFromJson(inlineEffectsJson));
  }, [inlineEffectsJson]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload =
        effects.length > 0 ? createEffectsJson(effects) : null;
      const response = await fetch("/api/admin/character-inline-effects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          characterId,
          inlineEffectsJson: payload,
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      setIsEditing(false);
      toast({
        title: "Inline effects saved",
        description: `Updated effects for ${characterName}`,
      });
      router.refresh();
    } catch (error) {
      toast({
        title: "Failed to save inline effects",
        description:
          error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="shadow-sm bg-gradient-to-r from-slate-50/70 via-stone-50/70 to-zinc-50/70">
      <CardHeader className="p-1 sm:p-4 sm:pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <CardTitle className="text-base sm:text-lg pb-0">
            Inline Effects (Admin)
          </CardTitle>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEditing((prev) => !prev)}
            >
              {isEditing ? "Done" : "Edit"}
            </Button>
            {isEditing && (
              <Button
                type="button"
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save"}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-1 sm:p-4 sm:pt-0 space-y-4">
        <p className="text-sm text-muted-foreground">
          Stat bonuses and notes stored on this character. Applied automatically without cluttering the global adjustment pool.
        </p>
        {isEditing ? (
          <div className="rounded-md border p-4 min-h-[120px]">
            <SkillEffectsEditor
              value={effects}
              onChange={setEffects}
              mode="adjustment"
            />
          </div>
        ) : (
          <div className="space-y-2">
            {effects.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No inline effects defined.
              </p>
            ) : (
              <ul className="text-sm space-y-1">
                {effects.map((effect, i) => (
                  <li key={i} className="rounded border px-2 py-1">
                    {effect.type === "stat_bonus" &&
                    "stat" in effect &&
                    "value" in effect
                      ? `${effect.stat}: ${Number(effect.value) >= 0 ? "+" : ""}${effect.value}`
                      : "note" in effect
                        ? String(effect.note)
                        : JSON.stringify(effect)}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
