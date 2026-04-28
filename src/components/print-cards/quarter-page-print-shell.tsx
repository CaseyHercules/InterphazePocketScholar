import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface QuarterPagePrintShellProps {
  children: ReactNode;
  className?: string;
  cards?: ReactNode[];
}

export function QuarterPagePrintShell({
  children,
  className,
  cards,
}: QuarterPagePrintShellProps) {
  const cardList = cards && cards.length > 0 ? cards : [children];
  const sheets: ReactNode[][] = [];

  for (let i = 0; i < cardList.length; i += 4) {
    sheets.push(cardList.slice(i, i + 4));
  }

  return (
    <section className="print-root space-y-3 rounded-lg border bg-muted/10 p-3 shadow-sm">
      {sheets.map((sheetCards, sheetIndex) => (
        <div
          key={`sheet-${sheetIndex}`}
          className={cn(
            "print-sheet grid h-full min-h-[700px] grid-cols-2 grid-rows-2 gap-4 bg-white p-4",
            sheetIndex > 0 ? "print:break-before-page" : ""
          )}
        >
          {Array.from({ length: 4 }).map((_, slotIndex) => (
            <div
              key={`slot-${sheetIndex}-${slotIndex}`}
              className={cn(
                "spell-card-slot rounded-md border border-dashed border-muted-foreground/30 p-2",
                className
              )}
            >
              {sheetCards[slotIndex] ?? null}
            </div>
          ))}
        </div>
      ))}
    </section>
  );
}
