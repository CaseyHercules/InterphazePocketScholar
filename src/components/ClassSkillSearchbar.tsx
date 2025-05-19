"use client";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { useState } from "react";
import { Skill } from "@prisma/client";
import { Badge } from "./ui/badge";

interface ClassSkillSearchbarProps {
  onSearch: (skill: Skill | null) => void;
  allSkills: Skill[];
}

const ClassSkillSearchbar = ({
  onSearch,
  allSkills,
}: ClassSkillSearchbarProps) => {
  const [input, setInput] = useState<string>("");
  const [open, setOpen] = useState(false);

  // Handle input change and filter skills
  const handleInputChange = (value: string) => {
    setInput(value);
    setOpen(value.length > 0);
  };

  // Filter and sort skills based on input
  const getFilteredSkills = () => {
    if (!input) return [];

    const searchText = input.toLowerCase();

    // Filter skills matching the search text
    const results = allSkills.filter((skill) => {
      const title = String(skill.title || "").toLowerCase();
      return title.includes(searchText);
    });

    console.log(`Found ${results.length} matches for "${input}"`);

    // Log all matching skills
    if (results.length > 0) {
      console.log(
        "ALL MATCHING SKILLS:",
        results.map((s) => `"${s.title}" (Tier ${s.tier})`)
      );
    }

    // Sort alphabetically by title, then by tier if same title
    return results.sort((a, b) => {
      const titleA = String(a.title || "").toLowerCase();
      const titleB = String(b.title || "").toLowerCase();

      // First compare by title
      const titleComparison = titleA.localeCompare(titleB);

      // If titles are the same, sort by tier (lower tier first)
      if (titleComparison === 0) {
        return (a.tier || 0) - (b.tier || 0);
      }

      return titleComparison;
    });
  };

  // Get filtered and sorted skills
  const filteredSkills = getFilteredSkills();

  return (
    <Command
      className="rounded-md border w-full overflow-visible"
      shouldFilter={false} // Disable built-in filtering
    >
      <CommandInput
        value={input}
        onValueChange={handleInputChange}
        placeholder="Search skills by title..."
        className="border-none focus:ring-0"
        onFocus={() => setOpen(input.length > 0)}
        onBlur={() => setTimeout(() => setOpen(false), 300)}
      />

      {open && (
        <div className="w-full relative">
          <CommandList className="absolute top-0 w-full z-50 bg-white border rounded-md shadow-md max-h-60 overflow-y-auto">
            {filteredSkills.length === 0 ? (
              <CommandEmpty>
                No skills found matching &quot;{input}&quot;
              </CommandEmpty>
            ) : (
              <>
                <div className="p-2 text-xs text-muted-foreground border-b">
                  {filteredSkills.length} results found
                </div>
                <CommandGroup>
                  {filteredSkills.map((skill) => (
                    <CommandItem
                      key={skill.id}
                      value={skill.id}
                      onSelect={() => {
                        console.log(`Selected: ${skill.title}`);
                        onSearch(skill);
                        setInput("");
                        setOpen(false);
                      }}
                      className="flex items-center justify-between py-2 px-2"
                    >
                      <span>{skill.title}</span>
                      <Badge variant="outline" className="ml-2 bg-slate-100">
                        Tier {skill.tier}
                      </Badge>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </div>
      )}
    </Command>
  );
};

export default ClassSkillSearchbar;
