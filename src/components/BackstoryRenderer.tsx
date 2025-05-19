"use client";

import { useRef, useEffect } from "react";
import "quill/dist/quill.bubble.css";
import type Quill from "quill";

type BackstoryRendererProps = {
  content: string;
};

export function BackstoryRenderer({ content }: BackstoryRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const loadQuill = async () => {
      const { default: Quill } = await import("quill");

      // Create new quill instance in read-only mode
      const quill = new Quill(containerRef.current as HTMLElement, {
        readOnly: true,
        theme: "bubble",
      });

      try {
        // Try to parse the content
        const parsedContent = JSON.parse(content);

        // Set the content to the quill instance
        quill.setContents(parsedContent);
      } catch (e) {
        // If parsing fails, just set the content as text
        quill.setText(content);
      }
    };

    loadQuill();

    return () => {
      // Clean up if necessary
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [content]);

  return (
    <div className="backstory-content">
      <div ref={containerRef} className="min-h-[100px]" />
    </div>
  );
}
