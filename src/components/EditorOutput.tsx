"use client";

import { FC, useEffect, useRef } from "react";
import "quill/dist/quill.snow.css";
import "@/styles/quill.css";

interface EditorOutputProps {
  content: any;
}

const SKILL_TABLE_TAG_REGEX =
  /\[\[SkillTable\s+class\s*=\s*([^\]]+)\]\]/gi;

const EditorOutput: FC<EditorOutputProps> = ({
  content,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<any>();
  const stripSkillTableTags = () => {
    if (!containerRef.current) return;
    const editor = containerRef.current.querySelector(".ql-editor");
    if (!editor) return;

    const blocks = Array.from(editor.querySelectorAll("p, li"));
    blocks.forEach((block) => {
      const rawText = block.textContent ?? "";
      const trimmedText = rawText.trim();
      const matches = Array.from(trimmedText.matchAll(SKILL_TABLE_TAG_REGEX));
      if (matches.length !== 1) return;
      const fullMatch = matches[0][0];
      if (trimmedText !== fullMatch) return;
      block.remove();
    });
  };

  useEffect(() => {
    const initQuill = async () => {
      if (!containerRef.current) return;

      // Handle null or undefined content
      if (!content) {
        containerRef.current.innerHTML =
          "<div class='text-base text-muted-foreground'>No content available</div>";
        return;
      }

      // If content is in the old EditorJS format, show message
      if (content?.blocks) {
        containerRef.current.innerHTML =
          "<div class='text-base text-muted-foreground'>Content format not supported</div>";
        return;
      }

      try {
        const { default: Quill } = await import("quill");
        const BlockEmbed = Quill.import("blots/block/embed");

        class SkillTableBlot extends (BlockEmbed as unknown as {
          new (): object;
          create(value?: unknown): HTMLElement;
        }) {
          static blotName = "skilltable";
          static tagName = "div";
          static className = "ql-skilltable-embed";

          static create(value: { className?: string }) {
            const node = super.create() as HTMLElement;
            const className = value?.className?.trim() || "Unknown";
            node.setAttribute("data-embed", "skill-table");
            node.setAttribute("data-class", className);
            node.setAttribute("contenteditable", "false");
            node.textContent = `Skill Table: ${className}`;
            return node;
          }

          static value(node: HTMLElement) {
            return { className: node.getAttribute("data-class") || "" };
          }
        }

        // @ts-expect-error Quill blot types don't fully match RegistryDefinition
        Quill.register(SkillTableBlot, true);

        // Initialize Quill in read-only mode
        const quill = new Quill(containerRef.current, {
          readOnly: true,
          modules: {
            toolbar: false,
          },
          theme: "snow",
        });

        // Handle different content formats
        if (content?.content?.ops) {
          // Standard format from the editor
          quill.setContents(content.content.ops);
        } else if (typeof content === "object" && content.ops) {
          // Direct Delta object
          quill.setContents(content.ops);
        } else if (content.content && typeof content.content === "string") {
          // Try to parse string content as JSON
          try {
            const parsedContent = JSON.parse(content.content);
            if (parsedContent.ops) {
              quill.setContents(parsedContent.ops);
            }
          } catch (e) {
            console.error("Failed to parse content string:", e);
            quill.setText("Content could not be displayed properly");
          }
        } else {
          // Fallback for other formats
          quill.setText("Content available in different format");
        }

        // Remove toolbar in read mode
        const toolbar = quill.container.querySelector(".ql-toolbar");
        if (toolbar) {
          toolbar.remove();
        }

        // Add read-only specific styles
        quill.container.classList.add("read-only");

        quillRef.current = quill;
        stripSkillTableTags();
      } catch (error) {
        console.error("Error initializing Quill:", error);
        if (containerRef.current) {
          containerRef.current.innerHTML =
            "<div class='text-base text-muted-foreground'>Error displaying content</div>";
        }
      }
    };

    initQuill();

    // Cleanup
    return () => {
      if (quillRef.current) {
        quillRef.current = undefined;
      }
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [content]);

  return (
    <div className="quill read-only">
      <div ref={containerRef} className="ql-container ql-snow" />
    </div>
  );
};

export default EditorOutput;
