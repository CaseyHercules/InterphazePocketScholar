"use client";

import {
  parseAlignmentFromJson,
  ALIGNMENT_MAX_TICKS,
} from "@/types/alignment";

interface CharacterAlignmentCardProps {
  character: { alignmentJson?: unknown };
}

function DownTickSlots({ filled }: { filled: number }) {
  return (
    <span className="font-mono text-sm tracking-wider">
      {Array.from({ length: ALIGNMENT_MAX_TICKS }, (_, i) =>
        i < ALIGNMENT_MAX_TICKS - filled ? "O" : "X"
      ).join(" ")}
    </span>
  );
}

function UpTickSlots({ filled }: { filled: number }) {
  return (
    <span className="font-mono text-sm tracking-wider">
      {Array.from({ length: ALIGNMENT_MAX_TICKS }, (_, i) =>
        i < filled ? "X" : "O"
      ).join(" ")}
    </span>
  );
}

export function CharacterAlignmentCard({
  character,
}: CharacterAlignmentCardProps) {
  const data = parseAlignmentFromJson(character.alignmentJson);
  if (!data) {
    return (
      <div className="rounded-lg border-2 border-stone-300 dark:border-stone-600 bg-gradient-to-b from-stone-50 to-stone-100/80 dark:from-stone-900 dark:to-stone-950 shadow-sm p-3">
        <p className="text-sm font-medium text-muted-foreground">
          Alignment: —
        </p>
      </div>
    );
  }
  const [alignment, upTicks, downTicks] = data;
  return (
    <div className="rounded-lg border-2 border-stone-300 dark:border-stone-600 bg-gradient-to-b from-stone-50 to-stone-100/80 dark:from-stone-900 dark:to-stone-950 shadow-sm p-3">
      <p className="text-sm font-medium flex flex-wrap items-center gap-x-2 gap-y-1">
        <span>Alignment:</span>
        <DownTickSlots filled={downTicks} />
        <span aria-hidden>|</span>
        <span className="font-semibold">{alignment}</span>
        <span aria-hidden>|</span>
        <UpTickSlots filled={upTicks} />
      </p>
    </div>
  );
}
