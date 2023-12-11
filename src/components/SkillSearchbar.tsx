"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { useCallback, useState } from "react";
import axios from "axios";
import { Skill } from "@prisma/client";
import { useRouter } from "next/navigation";
import debounce from "lodash.debounce";
import { Button } from "./ui/button";

const SkillSearchbar = ({ onSearch }: any) => {
  const [input, setInput] = useState<string>("");

  const {
    data: queryResults,
    refetch,
    isFetched,
    isFetching,
  } = useQuery({
    queryKey: ["search"],
    enabled: false,
    queryFn: async () => {
      if (!input) return [];
      const { data } = await axios.get(`/api/searchSkill?q=${input}`);
      return data as Skill[];
    },
  });

  const request = debounce(() => {
    refetch();
  }, 300);

  const debounceRequest = useCallback(() => {
    request();
  }, []);

  const router = useRouter();
  return (
    <div className="flex justify-evenly">
      <Command className="relative rounded-lg border max-w-lg z-50 overflow-visible">
        <CommandInput
          value={input}
          onValueChange={(text) => {
            setInput(text);
            debounceRequest();
          }}
          className="outline-none border-none focus:border-none focus:outline-none ring-0"
          placeholder="Search All Skills"
        />
        {input.length > 0 && (
          <CommandList className="absolute bg-white top-full inset-x-0 shadow rounded-b-md">
            {isFetched && <CommandEmpty>No Results found</CommandEmpty>}
            {(queryResults?.length ?? 0) > 0 ? (
              <CommandGroup>
                {queryResults?.map((skill) => (
                  <CommandItem
                    onSelect={() => {
                      onSearch(skill);
                      setInput("");
                    }}
                    key={skill.id}
                    value={skill.title}
                  >
                    {skill.title}
                  </CommandItem>
                ))}
              </CommandGroup>
            ) : null}
          </CommandList>
        )}
      </Command>
      <Button
        onClick={() => {
          onSearch("null");
        }}
        variant="outline"
      >
        Add New Skill
      </Button>
    </div>
  );
};

export default SkillSearchbar;
