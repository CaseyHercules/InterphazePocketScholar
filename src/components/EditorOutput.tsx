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

      // If content is in the old EditorJS format, show message
      if (content?.blocks) {
        containerRef.current.innerHTML =
          "<div class='text-base text-muted-foreground'>Content format not supported</div>";
        return;
      }

      const { default: Quill } = await import("quill");

      // Initialize Quill in read-only mode
      const quill = new Quill(containerRef.current, {
        readOnly: true,
        modules: {
          toolbar: false,
        },
        theme: "snow",
      });

      // Set the content
      if (content?.content?.ops) {
        quill.setContents(content.content.ops);
      }

      // Remove toolbar in read mode
      const toolbar = quill.container.querySelector(".ql-toolbar");
      if (toolbar) {
        toolbar.remove();
      }

      // Add read-only specific styles
      quill.container.classList.add("read-only");

      quillRef.current = quill;
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
