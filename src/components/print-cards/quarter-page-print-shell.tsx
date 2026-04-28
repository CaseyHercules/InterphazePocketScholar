import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface QuarterPagePrintShellProps {
  children: ReactNode;
  className?: string;
}

export function QuarterPagePrintShell({
  children,
  className,
}: QuarterPagePrintShellProps) {
  return (
    <section className="print-root rounded-lg border bg-muted/10 p-3 shadow-sm">
      <div className="print-sheet grid h-full min-h-[700px] grid-cols-2 grid-rows-2 gap-4 bg-white p-4">
        <div
          className={cn(
            "spell-card-slot rounded-md border border-dashed border-muted-foreground/30 p-2",
            className
          )}
        >
          {children}
        </div>
      </div>
    </section>
  );
}
