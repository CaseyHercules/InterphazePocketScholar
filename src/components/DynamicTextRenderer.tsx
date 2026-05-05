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

interface BandRect {
  top: number;
  bottom: number;
  left: number;
}

const DEFAULT_FONT = '400 14px "Inter", sans-serif';
const DEFAULT_LINE_HEIGHT = 22;
const DEFAULT_QUICK_LINKS = [
  { label: "Home", href: "/" },
  { label: "Events", href: "/events" },
  { label: "Rules", href: "/rules/summary" },
];

function collectQuickNavBandRects(
  container: HTMLElement,
  navRoot: HTMLElement | null
): BandRect[] {
  if (!navRoot) return [];
  const c = container.getBoundingClientRect();
  const bands: BandRect[] = [];

  const pushEl = (el: Element | null) => {
    if (!(el instanceof HTMLElement)) return;
    const r = el.getBoundingClientRect();
    bands.push({
      top: r.top - c.top,
      bottom: r.bottom - c.top,
      left: r.left - c.left,
    });
  };

  pushEl(navRoot.querySelector("[data-quick-nav-label]"));
  navRoot.querySelectorAll("[data-quick-nav-chip]").forEach((el) => pushEl(el));

  return bands;
}

function slotWidthForBand(
  bandTop: number,
  bandBottom: number,
  containerWidth: number,
  bands: BandRect[]
): number {
  if (bands.length === 0) return Math.max(1, containerWidth);

  let minLeft = containerWidth;
  for (const r of bands) {
    if (r.bottom <= bandTop || r.top >= bandBottom) continue;
    minLeft = Math.min(minLeft, r.left);
  }
  return Math.max(1, minLeft);
}

function fallbackSlotWidthLegacy(
  globalTop: number,
  globalBandBottom: number,
  containerWidth: number,
  obstacleTop: number,
  obstacleRight: number,
  obstacleWidth: number,
  measuredNavHeight: number
): number {
  const overlapsNavColumn =
    globalTop < obstacleTop + measuredNavHeight &&
    globalBandBottom > obstacleTop;
  const obstacleLeft = containerWidth - obstacleRight - obstacleWidth;
  return overlapsNavColumn
    ? Math.max(1, obstacleLeft)
    : Math.max(1, containerWidth);
}

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
  const [navBandRects, setNavBandRects] = useState<BandRect[]>([]);

  const resolvedQuickLinks = useMemo(
    () =>
      quickNavigationLinks === undefined
        ? DEFAULT_QUICK_LINKS
        : quickNavigationLinks,
    [quickNavigationLinks]
  );

  const estimatedNavHeight = useMemo(() => {
    const paddingY = 12;
    const labelBlock = 32;
    const perLink = 34;
    const linksTotal = resolvedQuickLinks.length * perLink;
    const raw = paddingY + labelBlock + linksTotal;
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

  const measureBands = () => {
    const container = containerRef.current;
    const nav = navBoxRef.current;
    if (!container) return;
    setNavBandRects(collectQuickNavBandRects(container, nav));
  };

  useLayoutEffect(() => {
    measureBands();
    const container = containerRef.current;
    const nav = navBoxRef.current;
    if (!container) return;
    const ro = new ResizeObserver(measureBands);
    ro.observe(container);
    if (nav) ro.observe(nav);
    return () => ro.disconnect();
  }, [resolvedQuickLinks, postTitle, containerWidth, obstacleTop, obstacleRight, obstacleWidth]);

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
      const globalBandBottom = globalTop + lineHeight;

      let slotWidth: number;
      if (navBandRects.length > 0) {
        slotWidth = slotWidthForBand(
          globalTop,
          globalBandBottom,
          containerWidth,
          navBandRects
        );
      } else {
        slotWidth = fallbackSlotWidthLegacy(
          globalTop,
          globalBandBottom,
          containerWidth,
          obstacleTop,
          obstacleRight,
          obstacleWidth,
          measuredNavHeight
        );
      }

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
    navBandRects,
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
        className="pointer-events-none absolute z-10 h-fit min-h-0 pl-2 text-amber-950"
        style={{
          top: obstacleTop,
          right: obstacleRight,
          width: obstacleWidth,
        }}
      >
        <div className="mb-2 text-right" data-quick-nav-label>
          <p className="whitespace-nowrap text-xs font-semibold uppercase tracking-widest text-amber-800/80">
            Quick Navigation
          </p>
        </div>
        <ul className="flex flex-col items-end gap-1.5">
          {resolvedQuickLinks.map((link) => (
            <li key={`${link.label}-${link.href}`} className="max-w-full text-right">
              <a
                data-quick-nav-chip
                className="pointer-events-auto inline-block max-w-full break-words text-right text-sm font-medium leading-snug text-amber-950 underline decoration-amber-900/35 underline-offset-[3px] transition-colors hover:text-amber-900 hover:decoration-amber-900/70 focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-800"
                href={link.href}
              >
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
