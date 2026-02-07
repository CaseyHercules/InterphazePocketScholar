"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getInlineEffectsFromJson,
  createInlineEffectsJson,
  INLINE_EFFECT_KINDS,
  type InlineEffect,
  type InlineEffectKind,
} from "@/types/inline-effects";
import { VALID_STATS } from "@/types/skill-effects";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";

type CharacterInlineEffectsEditorProps = {
  characterId: string;
  characterName: string;
  inlineEffectsJson: unknown;
};

function defaultForKind(kind: InlineEffectKind): InlineEffect {
  switch (kind) {
    case "stat_adjustment":
      return { type: "stat_adjustment", title: "", stat: "Tough", value: 0 };
    case "special_ability":
      return { type: "special_ability", title: "" };
    case "dingus":
      return { type: "dingus", title: "" };
  }
}

function groupEffectsByTitle(effects: InlineEffect[]): Map<string, InlineEffect[]> {
  const byTitle = new Map<string, InlineEffect[]>();
  for (const e of effects) {
    const key = e.title.trim() || "(Untitled)";
    if (!byTitle.has(key)) byTitle.set(key, []);
    byTitle.get(key)!.push(e);
  }
  return byTitle;
}

function formatStatAdjustment(e: InlineEffect & { type: "stat_adjustment" }): string {
  const sign = e.value >= 0 ? "+" : "";
  const cond = e.condition ? ` (${e.condition})` : "";
  return `${sign}${e.value} ${e.stat}${cond}`;
}

export function CharacterInlineEffectsEditor({
  characterId,
  characterName,
  inlineEffectsJson,
}: CharacterInlineEffectsEditorProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [effects, setEffects] = useState<InlineEffect[]>(() =>
    getInlineEffectsFromJson(inlineEffectsJson)
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  useEffect(() => {
    setEffects(getInlineEffectsFromJson(inlineEffectsJson));
  }, [inlineEffectsJson]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = effects.length > 0 ? createInlineEffectsJson(effects) : null;
      const response = await fetch("/api/admin/character-inline-effects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          characterId,
          inlineEffectsJson: payload,
        }),
      });

      if (!response.ok) throw new Error(await response.text());

      setIsEditing(false);
      toast({
        title: "Dinguses saved",
        description: `Updated effects for ${characterName}`,
      });
      router.refresh();
    } catch (error) {
      toast({
        title: "Failed to save Dinguses",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const addEffect = () => {
    const next = [...effects, defaultForKind("dingus")];
    setEffects(next);
    setExpandedIndex(next.length - 1);
  };

  const removeEffect = (index: number) => {
    setEffects(effects.filter((_, i) => i !== index));
    if (expandedIndex === index) setExpandedIndex(null);
    else if (expandedIndex != null && expandedIndex > index) setExpandedIndex(expandedIndex - 1);
  };

  const updateEffect = (index: number, updated: InlineEffect) => {
    const next = [...effects];
    next[index] = updated;
    setEffects(next);
  };

  const changeKind = (index: number, kind: InlineEffectKind) => {
    const prev = effects[index];
    const next = defaultForKind(kind);
    if (prev && "title" in prev && prev.title) next.title = prev.title;
    if (kind === "stat_adjustment" && "stat" in prev) {
      (next as InlineEffect & { type: "stat_adjustment" }).stat = (prev as any).stat ?? "Tough";
      (next as InlineEffect & { type: "stat_adjustment" }).value = (prev as any).value ?? 0;
    }
    updateEffect(index, next);
  };

  const byTitle = groupEffectsByTitle(effects);

  return (
    <Card className="shadow-sm bg-gradient-to-r from-slate-50/70 via-stone-50/70 to-zinc-50/70">
      <CardHeader className="p-1 sm:p-4 sm:pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <CardTitle className="text-base sm:text-lg pb-0">
            Dinguses (Admin)
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
          Stat adjustments, special abilities, and dinguses. Effects with the same title are combined when rendering.
        </p>
        {isEditing ? (
          <div className="space-y-2">
            {effects.map((effect, index) => (
              <Card key={index} className="overflow-hidden">
                <div
                  className="flex items-center justify-between px-3 py-2 bg-muted/50 cursor-pointer"
                  onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                >
                  <div className="flex items-center gap-2">
                    {expandedIndex === index ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                    <span className="text-sm font-medium">
                      {effect.title || "(Untitled)"} · {INLINE_EFFECT_KINDS.find((k) => k.value === effect.type)?.label ?? effect.type}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeEffect(index);
                    }}
                    className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                {expandedIndex === index && (
                  <CardContent className="pt-3 pb-3 space-y-3">
                    <div>
                      <Label className="text-xs">Type</Label>
                      <Select
                        value={effect.type}
                        onValueChange={(val) => changeKind(index, val as InlineEffectKind)}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {INLINE_EFFECT_KINDS.map((k) => (
                            <SelectItem key={k.value} value={k.value}>
                              {k.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Title (effects with same title are combined)</Label>
                      <Input
                        value={effect.title}
                        onChange={(e) => updateEffect(index, { ...effect, title: e.target.value })}
                        className="h-9"
                        placeholder="e.g. Toughness bonus"
                      />
                    </div>
                    {effect.type === "stat_adjustment" && (
                      <>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs">Stat</Label>
                            <Select
                              value={effect.stat}
                              onValueChange={(val) =>
                                updateEffect(index, { ...effect, stat: val })
                              }
                            >
                              <SelectTrigger className="h-9">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {VALID_STATS.map((stat) => (
                                  <SelectItem key={stat} value={stat}>
                                    {stat}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs">Value</Label>
                            <Input
                              type="number"
                              value={effect.value}
                              onChange={(e) =>
                                updateEffect(index, {
                                  ...effect,
                                  value: parseInt(e.target.value, 10) || 0,
                                })
                              }
                              className="h-9"
                            />
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs">Condition (optional)</Label>
                          <Input
                            placeholder="e.g. vs bows"
                            value={effect.condition ?? ""}
                            onChange={(e) =>
                              updateEffect(index, {
                                ...effect,
                                condition: e.target.value || undefined,
                              })
                            }
                            className="h-9"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id={`applyToTotal-${index}`}
                            checked={effect.applyToTotal !== false}
                            onCheckedChange={(checked) =>
                              updateEffect(index, {
                                ...effect,
                                applyToTotal: checked === true,
                              })
                            }
                          />
                          <Label htmlFor={`applyToTotal-${index}`} className="text-xs">
                            Apply to total
                          </Label>
                        </div>
                      </>
                    )}
                    {(effect.type === "special_ability" || effect.type === "dingus") && (
                      <div>
                        <Label className="text-xs">Note (optional)</Label>
                        <Input
                          placeholder="Description"
                          value={effect.note ?? ""}
                          onChange={(e) =>
                            updateEffect(index, { ...effect, note: e.target.value || undefined })
                          }
                          className="h-9"
                        />
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addEffect} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Effect
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {effects.length === 0 ? (
              <p className="text-sm text-muted-foreground">No dinguses defined.</p>
            ) : (
              <ul className="text-sm space-y-1">
                {Array.from(byTitle.entries()).map(([title, group]) => {
                  const statAdjs = group.filter((e): e is InlineEffect & { type: "stat_adjustment" } => e.type === "stat_adjustment");
                  const noteEffects = group.filter(
                    (e): e is InlineEffect & { note: string } =>
                      e.type !== "stat_adjustment" && "note" in e && typeof (e as { note?: string }).note === "string" && (e as { note: string }).note.trim() !== ""
                  );
                  return (
                    <li key={title} className="rounded border px-2 py-1">
                      <span className="font-medium">{title}</span>
                      {statAdjs.length > 0 && (
                        <span className="text-muted-foreground ml-1">
                          {statAdjs.map(formatStatAdjustment).join("; ")}
                        </span>
                      )}
                      {noteEffects.length > 0 && (
                        <span className="text-muted-foreground ml-1">
                          {noteEffects.map((e) => e.note).join("; ")}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
