"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import {
  type SkillEffect,
  type StatBonusEffect,
  type SkillModifierEffect,
  type GrantSkillEffect,
  type PickSkillByTierEffect,
  type NoteEffect,
  VALID_STATS,
  SKILL_MODIFIER_FIELDS,
} from "@/types/skill-effects";
import axios from "axios";

type ClassOption = {
  id: string;
  Title: string;
};

type SkillOption = {
  id: string;
  title: string;
  classId: string | null;
};

const ALL_EFFECT_TYPES = [
  { value: "stat_bonus", label: "Stat Bonus" },
  { value: "skill_modifier", label: "Skill Modifier" },
  { value: "grant_skill", label: "Grant Skill" },
  { value: "pick_skill_by_tier", label: "Pick Skill by Tier" },
  { value: "note", label: "Custom / Note" },
] as const;

type EffectType = (typeof ALL_EFFECT_TYPES)[number]["value"];

export type EffectsEditorMode = "skill" | "adjustment" | "all";

interface SkillEffectsEditorProps {
  value: SkillEffect[];
  onChange: (effects: SkillEffect[]) => void;
  /** Restrict which effect types are available. "skill" = all, "adjustment" = stat_bonus + note, "all" = all types */
  mode?: EffectsEditorMode;
}

function createDefaultEffect(type: EffectType): SkillEffect {
  switch (type) {
    case "stat_bonus":
      return { type: "stat_bonus", stat: "Tough", value: 0 };
    case "skill_modifier":
      return {
        type: "skill_modifier",
        targetSkillId: "",
        targetField: "epCost",
        modifier: 0,
      };
    case "grant_skill":
      return { type: "grant_skill", skillIds: [] };
    case "pick_skill_by_tier":
      return { type: "pick_skill_by_tier", maxTier: 1 };
    case "note":
      return { type: "restriction", note: "" };
  }
}

function getEffectTypesForMode(mode?: EffectsEditorMode) {
  switch (mode) {
    case "adjustment":
      return ALL_EFFECT_TYPES.filter(
        (t) => t.value === "stat_bonus" || t.value === "note"
      );
    case "skill":
    case "all":
    default:
      return [...ALL_EFFECT_TYPES];
  }
}

function needsClassAndSkillData(mode?: EffectsEditorMode) {
  return mode !== "adjustment";
}

export function SkillEffectsEditor({
  value,
  onChange,
  mode = "skill",
}: SkillEffectsEditorProps) {
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [skills, setSkills] = useState<SkillOption[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(needsClassAndSkillData(mode));

  const effectTypes = getEffectTypesForMode(mode);

  // Fetch classes and skills for dropdowns (only when skill_modifier or grant_skill are available)
  useEffect(() => {
    if (!needsClassAndSkillData(mode)) {
      setIsLoading(false);
      return;
    }
    const fetchData = async () => {
      try {
        const [classesRes, skillsRes] = await Promise.all([
          axios.get("/api/admin/class"),
          axios.get("/api/admin/skill"),
        ]);
        setClasses(classesRes.data || []);
        setSkills(skillsRes.data || []);
      } catch (error) {
        console.error("Error fetching data for effects editor:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [mode]);

  const addEffect = () => {
    const newEffect = createDefaultEffect("stat_bonus");
    onChange([...value, newEffect]);
    setExpandedIndex(value.length);
  };

  const removeEffect = (index: number) => {
    const newEffects = value.filter((_, i) => i !== index);
    onChange(newEffects);
    if (expandedIndex === index) {
      setExpandedIndex(null);
    } else if (expandedIndex !== null && expandedIndex > index) {
      setExpandedIndex(expandedIndex - 1);
    }
  };

  const updateEffect = (index: number, updatedEffect: SkillEffect) => {
    const newEffects = [...value];
    newEffects[index] = updatedEffect;
    onChange(newEffects);
  };

  const changeEffectType = (index: number, newType: EffectType) => {
    const newEffect = createDefaultEffect(newType);
    updateEffect(index, newEffect);
  };

  const isEffectTypeAllowed = (type: string) =>
    effectTypes.some((t) => t.value === type);

  const getSelectValueForEffect = (effect: SkillEffect) => {
    if (isEffectTypeAllowed(effect.type)) return effect.type;
    if (effect.type === "pick_skill_by_tier") return "pick_skill_by_tier";
    if ("note" in effect) return "note";
    return effectTypes[0]?.value ?? "stat_bonus";
  };

  const getEffectSummary = (effect: SkillEffect): string => {
    if ("note" in effect) return (effect as NoteEffect).note;
    switch (effect.type) {
      case "stat_bonus": {
        const statEffect = effect as StatBonusEffect;
        const sign = statEffect.value >= 0 ? "+" : "";
        const condition = statEffect.condition ? ` (${statEffect.condition})` : "";
        return `${sign}${statEffect.value} ${statEffect.stat}${condition}`;
      }
      case "skill_modifier": {
        const modEffect = effect as SkillModifierEffect;
        const targetSkill = skills.find((s) => s.id === modEffect.targetSkillId);
        const skillName = targetSkill?.title || "Unknown Skill";
        return `Modify ${skillName}'s ${modEffect.targetField}`;
      }
      case "grant_skill": {
        const grantEffect = effect as GrantSkillEffect;
        const ids = [
          ...(grantEffect.skillId ? [grantEffect.skillId] : []),
          ...(grantEffect.skillIds || []),
        ];
        if (ids.length > 0) {
          const names = ids
            .map((id) => skills.find((s) => s.id === id)?.title)
            .filter(Boolean);
          return names.length > 0
            ? `Grant: ${names.join(", ")}`
            : `Grant ${ids.length} specific skill(s)`;
        }
        const targetClass = classes.find((c) => c.id === grantEffect.classId);
        const className = targetClass?.Title || "Unknown Class";
        if (grantEffect.classId && grantEffect.maxTier) {
          return `Grant ${className} skills up to Tier ${grantEffect.maxTier}`;
        }
        return "Grant skill (configure below)";
      }
      case "pick_skill_by_tier": {
        const pickEffect = effect as PickSkillByTierEffect;
        return `Pick any skill up to Tier ${pickEffect.maxTier} from your class(es)`;
      }
      default: {
        const noteEffect = effect as NoteEffect;
        if ("note" in noteEffect && noteEffect.note) {
          return noteEffect.note;
        }
        return noteEffect.type || "Custom effect";
      }
    }
  };

  const renderStatBonusFields = (effect: StatBonusEffect, index: number) => (
    <div className="space-y-3">
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
                value: parseInt(e.target.value) || 0,
              })
            }
            className="h-9"
          />
        </div>
      </div>
      <div>
        <Label className="text-xs">Condition (optional)</Label>
        <Input
          placeholder="e.g., vs bows, when defending"
          value={effect.condition || ""}
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
          Apply to total (uncheck for display-only conditional bonus)
        </Label>
      </div>
    </div>
  );

  const renderSkillModifierFields = (
    effect: SkillModifierEffect,
    index: number
  ) => (
    <div className="space-y-3">
      <div>
        <Label className="text-xs">Target Skill</Label>
        <Select
          value={effect.targetSkillId}
          onValueChange={(val) =>
            updateEffect(index, { ...effect, targetSkillId: val })
          }
        >
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Select skill to modify..." />
          </SelectTrigger>
          <SelectContent>
            {skills.map((skill) => (
              <SelectItem key={skill.id} value={skill.id}>
                {skill.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Field to Modify</Label>
          <Select
            value={effect.targetField}
            onValueChange={(val) =>
              updateEffect(index, {
                ...effect,
                targetField: val as typeof effect.targetField,
              })
            }
          >
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SKILL_MODIFIER_FIELDS.map((field) => (
                <SelectItem key={field} value={field}>
                  {field === "epCost"
                    ? "EP Cost"
                    : field === "permenentEpReduction"
                    ? "Permanent EP Reduction"
                    : field.charAt(0).toUpperCase() + field.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Modifier (additive)</Label>
          <Input
            type="number"
            value={typeof effect.modifier === "number" ? effect.modifier : 0}
            onChange={(e) =>
              updateEffect(index, {
                ...effect,
                modifier: parseInt(e.target.value) || 0,
              })
            }
            className="h-9"
            placeholder="e.g., -2 to reduce"
          />
        </div>
      </div>
    </div>
  );

  const renderNoteFields = (effect: NoteEffect, index: number) => (
    <div className="space-y-3">
      <div>
        <Label className="text-xs">Type (e.g., restriction, custom)</Label>
        <Input
          placeholder="restriction"
          value={effect.type || ""}
          onChange={(e) =>
            updateEffect(index, { ...effect, type: e.target.value })
          }
          className="h-9"
        />
      </div>
      <div>
        <Label className="text-xs">Note / Description</Label>
        <Input
          placeholder="e.g., Unable to use heavy armor"
          value={effect.note || ""}
          onChange={(e) =>
            updateEffect(index, { ...effect, note: e.target.value })
          }
          className="h-9"
        />
      </div>
    </div>
  );

  const isGrantSpecificMode = (e: GrantSkillEffect) =>
    Boolean(e.skillId || (e.skillIds && e.skillIds.length > 0)) ||
    (!e.classId && e.maxTier === undefined);

  const renderGrantSkillFields = (effect: GrantSkillEffect, index: number) => {
    const isSpecific = isGrantSpecificMode(effect);
    const selectedIds = [
      ...(effect.skillId ? [effect.skillId] : []),
      ...(effect.skillIds || []),
    ];
    const filteredSkills = effect.classId
      ? skills.filter((s) => s.classId === effect.classId)
      : skills;

    return (
      <div className="space-y-3">
        <div>
          <Label className="text-xs">Grant Mode</Label>
          <Select
            value={isSpecific ? "specific" : "pick_from_class"}
            onValueChange={(val) => {
              if (val === "specific") {
                updateEffect(index, {
                  ...effect,
                  classId: undefined,
                  maxTier: undefined,
                  skillId: undefined,
                  skillIds: [],
                });
              } else {
                updateEffect(index, {
                  ...effect,
                  skillId: undefined,
                  skillIds: undefined,
                  classId: effect.classId || "",
                  maxTier: 1,
                });
              }
            }}
          >
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="specific">
                Grant specific skill(s)
              </SelectItem>
              <SelectItem value="pick_from_class">
                Grant pick from class by tier
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        {isSpecific ? (
          <>
            <div>
              <Label className="text-xs">Filter by Class (optional)</Label>
              <Select
                value={effect.classId || "_all"}
                onValueChange={(val) =>
                  updateEffect(index, {
                    ...effect,
                    classId: val === "_all" ? undefined : val,
                  })
                }
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all">All classes</SelectItem>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.Title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Skill(s) to Grant</Label>
              <Select
                value="_none"
                onValueChange={(val) => {
                  if (val === "_none") return;
                  const next = [...selectedIds, val].filter(
                    (id, i, arr) => arr.indexOf(id) === i
                  );
                  updateEffect(index, {
                    ...effect,
                    skillId: undefined,
                    skillIds: next,
                  });
                }}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Add skill..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none" disabled>
                    Add skill...
                  </SelectItem>
                  {filteredSkills
                    .filter((s) => !selectedIds.includes(s.id))
                    .map((skill) => (
                      <SelectItem key={skill.id} value={skill.id}>
                        {skill.title}
                        {skill.classId
                          ? ` (${classes.find((c) => c.id === skill.classId)?.Title ?? ""})`
                          : ""}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {selectedIds.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {selectedIds.map((id) => {
                    const skill = skills.find((s) => s.id === id);
                    return (
                      <span
                        key={id}
                        className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs"
                      >
                        {skill?.title ?? id}
                        <button
                          type="button"
                          onClick={() => {
                            const next = selectedIds.filter((x) => x !== id);
                            updateEffect(index, {
                              ...effect,
                              skillId: undefined,
                              skillIds: next,
                            });
                          }}
                          className="hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div>
              <Label className="text-xs">Class to Grant Skills From</Label>
              <Select
                value={effect.classId || ""}
                onValueChange={(val) =>
                  updateEffect(index, { ...effect, classId: val })
                }
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select class..." />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.Title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Maximum Tier to Grant</Label>
              <Select
                value={String(effect.maxTier || 1)}
                onValueChange={(val) =>
                  updateEffect(index, {
                    ...effect,
                    maxTier: parseInt(val),
                  })
                }
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4].map((tier) => (
                    <SelectItem key={tier} value={String(tier)}>
                      Tier {tier}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Character can learn any skill up to this tier from the selected
                class (cross-class).
              </p>
            </div>
          </>
        )}
      </div>
    );
  };

  const renderPickSkillByTierFields = (
    effect: PickSkillByTierEffect,
    index: number
  ) => (
    <div className="space-y-3">
      <div>
        <Label className="text-xs">Maximum Tier</Label>
        <Select
          value={String(effect.maxTier)}
          onValueChange={(val) =>
            updateEffect(index, { ...effect, maxTier: parseInt(val) })
          }
        >
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[1, 2, 3, 4].map((tier) => (
              <SelectItem key={tier} value={String(tier)}>
                Tier {tier}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground mt-1">
          Character can pick any skill tier X or lower from their primary or
          secondary class.
        </p>
      </div>
    </div>
  );

  const renderEffectFields = (effect: SkillEffect, index: number) => {
    switch (effect.type) {
      case "stat_bonus":
        return renderStatBonusFields(effect as StatBonusEffect, index);
      case "skill_modifier":
        return renderSkillModifierFields(effect as SkillModifierEffect, index);
      case "grant_skill":
        return renderGrantSkillFields(effect as GrantSkillEffect, index);
      case "pick_skill_by_tier":
        return renderPickSkillByTierFields(
          effect as PickSkillByTierEffect,
          index
        );
      default:
        if ("note" in effect) {
          return renderNoteFields(effect as NoteEffect, index);
        }
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="text-sm text-muted-foreground py-4">
        Loading effect options...
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {value.length === 0 ? (
        <div className="text-sm text-muted-foreground py-2">
          No meta-effects defined. Click &quot;Add Effect&quot; to create one.
        </div>
      ) : (
        <div className="space-y-2">
          {value.map((effect, index) => (
            <Card key={index} className="overflow-hidden">
              <div
                className="flex items-center justify-between px-3 py-2 bg-muted/50 cursor-pointer"
                onClick={() =>
                  setExpandedIndex(expandedIndex === index ? null : index)
                }
              >
                <div className="flex items-center gap-2">
                  {expandedIndex === index ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                  <span className="text-sm font-medium">
                    {getEffectSummary(effect)}
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
                <CardContent className="pt-3 pb-3">
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs">Effect Type</Label>
                      <Select
                        value={getSelectValueForEffect(effect)}
                        onValueChange={(val) =>
                          changeEffectType(index, val as EffectType)
                        }
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {effectTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {renderEffectFields(effect, index)}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addEffect}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Effect
      </Button>
    </div>
  );
}

export default SkillEffectsEditor;
