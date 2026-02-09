"use client";

import { useLayoutEffect, useRef, useState } from "react";

const VIEWPORT_PADDING = 8;

function clampToViewport(
  x: number,
  y: number,
  width: number,
  height: number
): { x: number; y: number } {
  if (typeof window === "undefined") return { x, y };
  const maxX = window.innerWidth - width - VIEWPORT_PADDING;
  const maxY = window.innerHeight - height - VIEWPORT_PADDING;
  return {
    x: Math.max(VIEWPORT_PADDING, Math.min(x, maxX)),
    y: Math.max(VIEWPORT_PADDING, Math.min(y, maxY)),
  };
}

type HoverBreakdownProps = {
  content: React.ReactNode;
  children: React.ReactNode;
  offsetX?: number;
  offsetY?: number;
};

const FALLBACK_WIDTH = 240;
const FALLBACK_HEIGHT = 200;

export function HoverBreakdown({
  content,
  children,
  offsetX = -5,
  offsetY = -30,
}: HoverBreakdownProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const pressTimer = useRef<number | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!isVisible || !tooltipRef.current || typeof window === "undefined")
      return;
    const rect = tooltipRef.current.getBoundingClientRect();
    const clamped = clampToViewport(
      position.x,
      position.y,
      rect.width,
      rect.height
    );
    if (clamped.x !== position.x || clamped.y !== position.y) {
      setPosition(clamped);
    }
  }, [isVisible, position.x, position.y]);

  const setPositionFromCoords = (clientX: number, clientY: number) => {
    const next = clampToViewport(
      clientX + offsetX,
      clientY + offsetY,
      FALLBACK_WIDTH,
      FALLBACK_HEIGHT
    );
    setPosition(next);
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    setPositionFromCoords(event.clientX, event.clientY);
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    if (pressTimer.current) {
      window.clearTimeout(pressTimer.current);
    }

    pressTimer.current = window.setTimeout(() => {
      const touch = event.touches[0];
      if (!touch) return;
      setPositionFromCoords(touch.clientX, touch.clientY);
      setIsVisible(true);
    }, 400);
  };

  const handleTouchEnd = () => {
    if (pressTimer.current) {
      window.clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
    setIsVisible(false);
  };

  const handleMouseEnter = (event: React.MouseEvent<HTMLDivElement>) => {
    setPositionFromCoords(event.clientX, event.clientY);
    setIsVisible(true);
  };

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsVisible(false)}
      onMouseMove={handleMouseMove}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      {children}
      {isVisible && (
        <div
          ref={tooltipRef}
          className="pointer-events-none fixed z-50"
          style={{ left: position.x, top: position.y }}
        >
          <div className="rounded-md border bg-background p-2 shadow-md">
            {content}
          </div>
        </div>
      )}
    </div>
  );
}
