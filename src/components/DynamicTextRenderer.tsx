"use client";

import {
  layoutNextLineRange,
  materializeLineRange,
  prepareWithSegments,
  type LayoutCursor,
} from "@chenglou/pretext";
import { useEffect, useMemo, useRef, useState } from "react";

interface DynamicTextRendererProps {
  text: string;
  className?: string;
  font?: string;
  lineHeight?: number;
  obstacleLabel?: string;
  obstacleWidth?: number;
  obstacleHeight?: number;
  obstacleTop?: number;
  obstacleRight?: number;
}

interface PositionedLine {
  text: string;
  x: number;
  y: number;
  width: number;
}

const DEFAULT_FONT = '400 14px "Inter", sans-serif';
const DEFAULT_LINE_HEIGHT = 22;

const DynamicTextRenderer = ({
  text,
  className,
  font = DEFAULT_FONT,
  lineHeight = DEFAULT_LINE_HEIGHT,
  obstacleLabel = "test",
  obstacleWidth = 116,
  obstacleHeight = 68,
  obstacleTop = 0,
  obstacleRight = 0,
}: DynamicTextRendererProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const nextWidth = entries[0]?.contentRect?.width ?? 0;
      setContainerWidth(nextWidth);
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const { lines, height } = useMemo(() => {
    if (!text || containerWidth <= 0) {
      return { lines: [] as PositionedLine[], height: 0 };
    }

    const prepared = prepareWithSegments(text, font, { whiteSpace: "pre-wrap" });
    const nextLines: PositionedLine[] = [];
    let cursor: LayoutCursor = { segmentIndex: 0, graphemeIndex: 0 };
    let top = 0;
    let guard = 0;

    while (guard < 10000) {
      guard += 1;
      const overlapsObstacle =
        top < obstacleTop + obstacleHeight && top + lineHeight > obstacleTop;
      const obstacleLeft = containerWidth - obstacleRight - obstacleWidth;
      const slotWidth = overlapsObstacle
        ? Math.max(1, obstacleLeft)
        : Math.max(1, containerWidth);

      const range = layoutNextLineRange(prepared, cursor, slotWidth);
      if (!range) break;

      const line = materializeLineRange(prepared, range);
      nextLines.push({
        text: line.text,
        x: 0,
        y: top,
        width: slotWidth,
      });

      if (
        range.end.segmentIndex === cursor.segmentIndex &&
        range.end.graphemeIndex === cursor.graphemeIndex
      ) {
        break;
      }

      cursor = range.end;
      top += lineHeight;
    }

    return { lines: nextLines, height: Math.max(top, lineHeight) };
  }, [
    containerWidth,
    text,
    font,
    lineHeight,
    obstacleTop,
    obstacleRight,
    obstacleWidth,
    obstacleHeight,
  ]);

  return (
    <div ref={containerRef} className={`relative w-full ${className ?? ""}`}>
      <div
        className="absolute z-10 flex items-center justify-center border border-stone-300 bg-stone-100 text-xs font-semibold uppercase tracking-wide text-stone-700"
        style={{
          top: obstacleTop,
          right: obstacleRight,
          width: obstacleWidth,
          height: obstacleHeight,
        }}
      >
        {obstacleLabel}
      </div>
      <div className="relative w-full" style={{ height }}>
        {lines.map((line, index) => (
          <div
            key={`${line.y}-${index}`}
            className="absolute overflow-hidden whitespace-pre text-inherit"
            style={{
              top: line.y,
              left: line.x,
              width: line.width,
              lineHeight: `${lineHeight}px`,
              height: lineHeight,
            }}
          >
            {line.text}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DynamicTextRenderer;
