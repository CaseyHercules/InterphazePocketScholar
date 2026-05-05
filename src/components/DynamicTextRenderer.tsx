"use client";

import {
  layoutNextLineRange,
  materializeLineRange,
  prepareWithSegments,
  type LayoutCursor,
} from "@chenglou/pretext";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

interface DynamicTextRendererProps {
  text: string;
  postTitle?: string;
  className?: string;
  font?: string;
  lineHeight?: number;
  quickNavigationLinks?: Array<{ label: string; href: string }>;
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
const DEFAULT_QUICK_LINKS = [
  { label: "Home", href: "/" },
  { label: "Events", href: "/events" },
  { label: "Rules", href: "/rules/summary" },
];

const DynamicTextRenderer = ({
  text,
  postTitle,
  className,
  font = DEFAULT_FONT,
  lineHeight = DEFAULT_LINE_HEIGHT,
  quickNavigationLinks,
  obstacleWidth = 172,
  obstacleHeight = 112,
  obstacleTop = 0,
  obstacleRight = 8,
}: DynamicTextRendererProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const navBoxRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [titleBlockHeight, setTitleBlockHeight] = useState(0);
  const [measuredNavHeight, setMeasuredNavHeight] = useState(obstacleHeight);

  const resolvedQuickLinks = useMemo(
    () =>
      quickNavigationLinks === undefined
        ? DEFAULT_QUICK_LINKS
        : quickNavigationLinks,
    [quickNavigationLinks]
  );

  const estimatedNavHeight = useMemo(() => {
    const paddingY = 32;
    const titleBlock = 48;
    const perLink = 26;
    const linksTotal = resolvedQuickLinks.length * perLink;
    const raw = paddingY + titleBlock + linksTotal;
    return Math.max(obstacleHeight, raw);
  }, [obstacleHeight, resolvedQuickLinks.length]);

  useEffect(() => {
    setMeasuredNavHeight(estimatedNavHeight);
  }, [estimatedNavHeight]);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const nextWidth = entries[0]?.contentRect?.width ?? 0;
      setContainerWidth(nextWidth);
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = navBoxRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const h = entries[0]?.contentRect?.height ?? 0;
      if (h > 0) setMeasuredNavHeight(h);
    });
    observer.observe(el);
    const initial = el.getBoundingClientRect().height;
    if (initial > 0) setMeasuredNavHeight(initial);
    return () => observer.disconnect();
  }, [resolvedQuickLinks]);

  useLayoutEffect(() => {
    if (!postTitle) {
      setTitleBlockHeight(0);
      return;
    }
    const el = titleRef.current;
    if (!el) return;
    const update = () =>
      setTitleBlockHeight(el.getBoundingClientRect().height);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [postTitle]);

  const bodyTop = postTitle ? titleBlockHeight : 0;

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
      const globalTop = bodyTop + top;
      const overlapsObstacle =
        globalTop < obstacleTop + measuredNavHeight &&
        globalTop + lineHeight > obstacleTop;
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
    bodyTop,
    containerWidth,
    text,
    font,
    lineHeight,
    obstacleTop,
    obstacleRight,
    obstacleWidth,
    measuredNavHeight,
  ]);

  const articleMinHeight = height;

  const titleRightPad = obstacleWidth + obstacleRight + 8;

  return (
    <div ref={containerRef} className={`relative w-full ${className ?? ""}`}>
      {postTitle ? (
        <h1
          ref={titleRef}
          className="text-2xl font-semibold leading-7 text-amber-950 pb-4"
          style={{ paddingRight: titleRightPad }}
        >
          {postTitle}
        </h1>
      ) : null}

      <div
        ref={navBoxRef}
        className="absolute z-10 h-fit min-h-0 rounded-md border border-stone-300 bg-stone-100 p-4 text-stone-700 shadow-sm"
        style={{
          top: obstacleTop,
          right: obstacleRight,
          width: obstacleWidth,
        }}
      >
        <div className="mb-3 text-center">
          <p className="whitespace-nowrap text-base font-semibold uppercase tracking-wide text-stone-800">
            Quick Navigation
          </p>
        </div>
        <ul className="space-y-1 text-right text-sm leading-snug pl-0.5">
          {resolvedQuickLinks.map((link) => (
            <li key={`${link.label}-${link.href}`} className="text-right">
              <a className="underline underline-offset-2" href={link.href}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="relative w-full" style={{ minHeight: articleMinHeight }}>
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
