"use client";

import { FC, useEffect, useRef } from "react";
import "quill/dist/quill.snow.css";
import "@/styles/quill.css";

interface EditorOutputProps {
  content: any;
}

const EditorOutput: FC<EditorOutputProps> = ({ content }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<any>();

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
        const container = quillRef.current.container;
        container.remove();
        quillRef.current = undefined;
      }
    };
  }, [content]);

  return (
    <div className="quill">
      <div ref={containerRef} className="ql-container ql-snow read-only" />
    </div>
  );
};

export default EditorOutput;
