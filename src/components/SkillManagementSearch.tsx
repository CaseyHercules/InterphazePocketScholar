"use client";

import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import axios from "axios";

type Skill = { id: string; title: string; tier?: number };
type SkillGroup = { id: string; title: string; description?: string | null };

// Single-select for Parent Skill ID
interface ParentSkillSearchProps {
  value: string;
  onChange: (value: string) => void;
  excludeSkillId?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function ParentSkillSearch({
  value,
  onChange,
  excludeSkillId,
  placeholder = "Search for parent skill...",
  disabled = false,
}: ParentSkillSearchProps) {
  const [open, setOpen] = useState(false);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await axios.get("/api/admin/skill");
        setSkills(res.data || []);
      } catch (err) {
        console.error("Failed to fetch skills:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSkills();
  }, []);

  const filteredSkills = skills.filter((s) => s.id !== excludeSkillId);
  const selectedSkill = skills.find((s) => s.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled || isLoading}
          className="w-full justify-between font-normal"
        >
          {selectedSkill ? (
            <span className="truncate">
              {selectedSkill.title}
              {selectedSkill.tier != null && (
                <span className="ml-2 text-muted-foreground text-xs">
                  (Tier {selectedSkill.tier})
                </span>
              )}
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search skills..." />
          <CommandList>
            <CommandEmpty>No skill found.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="__none__"
                onSelect={() => {
                  onChange("");
                  setOpen(false);
                }}
              >
                <Check className={cn("mr-2 h-4 w-4", !value ? "opacity-100" : "opacity-0")} />
                None
              </CommandItem>
              {filteredSkills.map((skill) => (
                <CommandItem
                  key={skill.id}
                  value={`${skill.title} ${skill.id}`}
                  onSelect={() => {
                    onChange(skill.id);
                    setOpen(false);
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", value === skill.id ? "opacity-100" : "opacity-0")} />
                  <span className="truncate">{skill.title}</span>
                  {skill.tier != null && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      Tier {skill.tier}
                    </Badge>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// Single-select for Skill Group ID
interface SkillGroupSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function SkillGroupSearch({
  value,
  onChange,
  placeholder = "Search for skill group...",
  disabled = false,
}: SkillGroupSearchProps) {
  const [open, setOpen] = useState(false);
  const [skillGroups, setSkillGroups] = useState<SkillGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSkillGroups = async () => {
      try {
        const res = await axios.get("/api/admin/skill-group");
        setSkillGroups(res.data || []);
      } catch (err) {
        console.error("Failed to fetch skill groups:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSkillGroups();
  }, []);

  const selectedGroup = skillGroups.find((g) => g.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled || isLoading}
          className="w-full justify-between font-normal"
        >
          {selectedGroup ? (
            <span className="truncate">{selectedGroup.title}</span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search skill groups..." />
          <CommandList>
            <CommandEmpty>No skill group found.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="__none__"
                onSelect={() => {
                  onChange("");
                  setOpen(false);
                }}
              >
                <Check className={cn("mr-2 h-4 w-4", !value ? "opacity-100" : "opacity-0")} />
                None
              </CommandItem>
              {skillGroups.map((group) => (
                <CommandItem
                  key={group.id}
                  value={`${group.title} ${group.id}`}
                  onSelect={() => {
                    onChange(group.id);
                    setOpen(false);
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", value === group.id ? "opacity-100" : "opacity-0")} />
                  <span className="truncate">{group.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// Multi-select for Prerequisite Skills
interface PrerequisiteSkillsSearchProps {
  value: string[];
  onChange: (value: string[]) => void;
  excludeSkillId?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function PrerequisiteSkillsSearch({
  value,
  onChange,
  excludeSkillId,
  placeholder = "Search and add prerequisite skills...",
  disabled = false,
}: PrerequisiteSkillsSearchProps) {
  const [open, setOpen] = useState(false);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await axios.get("/api/admin/skill");
        setSkills(res.data || []);
      } catch (err) {
        console.error("Failed to fetch skills:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSkills();
  }, []);

  const filteredSkills = skills.filter((s) => s.id !== excludeSkillId);
  const selectedSkills = filteredSkills.filter((s) => value.includes(s.id));

  const addSkill = (skillId: string) => {
    if (!value.includes(skillId)) {
      onChange([...value, skillId]);
    }
  };

  const removeSkill = (skillId: string) => {
    onChange(value.filter((id) => id !== skillId));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled || isLoading}
          className="w-full justify-between font-normal min-h-10 h-auto py-2"
        >
          <div className="flex flex-wrap gap-1 flex-1 text-left">
            {selectedSkills.length > 0 ? (
              selectedSkills.map((skill) => (
                <Badge
                  key={skill.id}
                  variant="secondary"
                  className="text-xs font-normal"
                >
                  {skill.title}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSkill(skill.id);
                    }}
                    className="ml-1 rounded-full hover:bg-muted"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search skills..." />
          <CommandList>
            <CommandEmpty>No skill found.</CommandEmpty>
            <CommandGroup>
              {filteredSkills
                .filter((s) => !value.includes(s.id))
                .map((skill) => (
                  <CommandItem
                    key={skill.id}
                    value={`${skill.title} ${skill.id}`}
                    onSelect={() => {
                      addSkill(skill.id);
                    }}
                  >
                    <span className="truncate">{skill.title}</span>
                    {skill.tier != null && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        Tier {skill.tier}
                      </Badge>
                    )}
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
