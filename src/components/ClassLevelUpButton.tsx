"use client";

import { useState } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { levelUpCharacterClass } from "@/lib/actions/character";

interface ClassLevelUpButtonProps {
  characterId: string;
  classType: "primary" | "secondary";
  currentLevel: number;
  className?: string;
}

export function ClassLevelUpButton({
  characterId,
  classType,
  currentLevel,
  className,
}: ClassLevelUpButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Check if already at max level
  const isMaxLevel = currentLevel >= 20;

  const handleLevelUp = async () => {
    if (isMaxLevel) return;

    setIsLoading(true);
    try {
      await levelUpCharacterClass(characterId, classType, 1);
      toast({
        title: "Level Up Successful",
        description: `Your character's ${classType} class has been leveled up.`,
      });
    } catch (error) {
      toast({
        title: "Level Up Failed",
        description:
          error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // If already at max level, show disabled button or nothing
  if (isMaxLevel) {
    return (
      <Button
        size="sm"
        className={`flex items-center gap-1 ${className || ""}`}
        disabled={true}
        title="Maximum level reached"
      >
        Max Level
      </Button>
    );
  }

  return (
    <Button
      size="sm"
      className={`flex items-center gap-1 ${className || ""}`}
      onClick={handleLevelUp}
      disabled={isLoading}
    >
      {isLoading ? (
        <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        <ArrowUp className="h-3 w-3" />
      )}
      Level Up
    </Button>
  );
}
