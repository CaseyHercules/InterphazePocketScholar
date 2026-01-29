"use client";

import { useRef, useState } from "react";

type HoverBreakdownProps = {
  content: React.ReactNode;
  children: React.ReactNode;
  offsetX?: number;
  offsetY?: number;
};

export function HoverBreakdown({
  content,
  children,
  offsetX = -5,
  offsetY = -30,
}: HoverBreakdownProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const pressTimer = useRef<number | null>(null);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    setPosition({
      x: event.clientX + offsetX,
      y: event.clientY + offsetY,
    });
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    if (pressTimer.current) {
      window.clearTimeout(pressTimer.current);
    }

    pressTimer.current = window.setTimeout(() => {
      const touch = event.touches[0];
      if (!touch) return;
      setPosition({
        x: touch.clientX + offsetX,
        y: touch.clientY + offsetY,
      });
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

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onMouseMove={handleMouseMove}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      {children}
      {isVisible && (
        <div
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
