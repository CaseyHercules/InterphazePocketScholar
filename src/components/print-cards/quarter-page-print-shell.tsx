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
    <section className="print-root space-y-3 rounded-lg border bg-muted/10 p-3 shadow-sm print:space-y-0 print:border-0 print:bg-transparent print:p-0">
      {sheets.map((sheetCards, sheetIndex) => (
        <div
          key={`sheet-${sheetIndex}`}
          className="print-sheet grid h-full min-h-[700px] grid-cols-1 gap-4 bg-white p-4 lg:grid-cols-2 lg:grid-rows-2 print:min-h-0 print:gap-[0.1in] print:p-[0.12in]"
        >
          {sheetCards.map((card, slotIndex) => (
            <div
              key={`slot-${sheetIndex}-${slotIndex}`}
              className={cn(
                "spell-card-slot rounded-md border border-muted-foreground/25 p-2",
                className
              )}
            >
              {card}
            </div>
          ))}
        </div>
      ))}
    </section>
  );
}
