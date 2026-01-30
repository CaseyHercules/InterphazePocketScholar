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

interface SkillEffectsEditorProps {
  value: SkillEffect[];
  onChange: (effects: SkillEffect[]) => void;
}

const EFFECT_TYPES = [
  { value: "stat_bonus", label: "Stat Bonus" },
  { value: "skill_modifier", label: "Skill Modifier" },
  { value: "grant_skill", label: "Grant Skill" },
] as const;

type EffectType = typeof EFFECT_TYPES[number]["value"];

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
      return { type: "grant_skill", classId: "", maxTier: 1 };
  }
}

export function SkillEffectsEditor({ value, onChange }: SkillEffectsEditorProps) {
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [skills, setSkills] = useState<SkillOption[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch classes and skills for dropdowns
  useEffect(() => {
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
  }, []);

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

  const getEffectSummary = (effect: SkillEffect): string => {
    switch (effect.type) {
      case "stat_bonus":
        const sign = effect.value >= 0 ? "+" : "";
        const condition = effect.condition ? ` (${effect.condition})` : "";
        return `${sign}${effect.value} ${effect.stat}${condition}`;
      case "skill_modifier":
        const targetSkill = skills.find((s) => s.id === effect.targetSkillId);
        const skillName = targetSkill?.title || "Unknown Skill";
        return `Modify ${skillName}'s ${effect.targetField}`;
      case "grant_skill":
        const targetClass = classes.find((c) => c.id === effect.classId);
        const className = targetClass?.Title || "Unknown Class";
        if (effect.maxTier) {
          return `Grant ${className} skills up to Tier ${effect.maxTier}`;
        }
        return `Grant specific skills from ${className}`;
      default:
        return "Unknown effect";
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

  const renderGrantSkillFields = (effect: GrantSkillEffect, index: number) => (
    <div className="space-y-3">
      <div>
        <Label className="text-xs">Class to Grant Skills From</Label>
        <Select
          value={effect.classId}
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
              skillId: undefined,
              skillIds: undefined,
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
          Character can learn any skill up to this tier from the selected class.
        </p>
      </div>
    </div>
  );

  const renderEffectFields = (effect: SkillEffect, index: number) => {
    switch (effect.type) {
      case "stat_bonus":
        return renderStatBonusFields(effect, index);
      case "skill_modifier":
        return renderSkillModifierFields(effect, index);
      case "grant_skill":
        return renderGrantSkillFields(effect, index);
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
          No meta-effects defined. Click "Add Effect" to create one.
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
                        value={effect.type}
                        onValueChange={(val) =>
                          changeEffectType(index, val as EffectType)
                        }
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {EFFECT_TYPES.map((type) => (
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
