"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { SpellCardLandscapeFrame } from "@/components/print-cards/spell-card-print";

interface QuarterPagePrintShellProps {
  children?: ReactNode;
  className?: string;
  cards?: ReactNode[];
  fillEmptySlots?: boolean;
}

export function QuarterPagePrintShell({
  children,
  className,
  cards,
  fillEmptySlots = true,
}: QuarterPagePrintShellProps) {
  const cardList = cards && cards.length > 0 ? cards : [children];
  const sheets: ReactNode[][] = [];

  for (let i = 0; i < cardList.length; i += 4) {
    const nextSheet = cardList.slice(i, i + 4);
    if (fillEmptySlots && nextSheet.length < 4) {
      while (nextSheet.length < 4) {
        nextSheet.push(null);
      }
    }
    sheets.push(nextSheet);
  }

  return (
    <section className="space-y-3 rounded-lg border bg-muted/10 p-3 shadow-sm">
      {sheets.map((sheetCards, sheetIndex) => (
        <div
          key={`sheet-${sheetIndex}`}
          className="grid grid-cols-1 gap-3 bg-white p-3 lg:min-h-[440px] lg:grid-cols-2 lg:grid-rows-2 lg:gap-3 lg:p-3"
        >
          {sheetCards.map((card, slotIndex) => (
            <div
              key={`slot-${sheetIndex}-${slotIndex}`}
              className={cn(
                "relative flex min-h-0 rounded-md border border-muted-foreground/25 bg-white p-1.5",
                !card && "border-dashed bg-muted/20",
                className
              )}
            >
              {card ? (
                <SpellCardLandscapeFrame>{card}</SpellCardLandscapeFrame>
              ) : (
                <div className="h-full min-h-[100px] w-full rounded-sm border border-dashed border-muted-foreground/40" />
              )}
            </div>
          ))}
        </div>
      ))}
    </section>
  );
}
