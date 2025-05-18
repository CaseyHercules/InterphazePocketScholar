"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type EditorJS from "@editorjs/editorjs";
import { Card } from "@/components/ui/card";

interface EventEditorProps {
  onChange: (content: any) => void;
  initialContent?: any;
}

export const EventEditor = ({ onChange, initialContent }: EventEditorProps) => {
  const ref = useRef<EditorJS>();
  const [isMounted, setIsMounted] = useState<boolean>(false);

  const initializeEditor = useCallback(async () => {
    const EditorJS = (await import("@editorjs/editorjs")).default;
    const Header = (await import("@editorjs/header")).default;
    const List = (await import("@editorjs/list")).default;
    const InlineCode = (await import("@editorjs/inline-code")).default;

    if (!ref.current) {
      const editor = new EditorJS({
        holder: "event-editor",
        onReady() {
          ref.current = editor;
        },
        onChange: async () => {
          const content = await editor.save();
          onChange(content);
        },
        placeholder: "Type here to write your event description...",
        inlineToolbar: true,
        data: initialContent || { blocks: [] },
        tools: {
          header: Header,
          list: List,
          inlineCode: InlineCode,
        },
        minHeight: 50,
        defaultBlock: "paragraph",
      });

      // Add custom styles to the editor
      const style = document.createElement("style");
      style.textContent = `
        .codex-editor {
          width: 100% !important;
        }
        .codex-editor__redactor {
          padding: 0 !important;
          margin: 0 !important;
        }
        .ce-block__content {
          max-width: 90% !important;
          margin: 0 auto !important;
          position: relative !important;
        }
        .ce-toolbar__content {
          max-width: 90% !important;
          margin: 0 auto !important;
          position: relative !important;
        }
        .ce-block__content > div {
          width: 100% !important;
          margin: 0 !important;
        }
        .ce-toolbar__actions {
          position: absolute !important;
          right: -30px !important;
          top: 50% !important;
          transform: translateY(-50%) !important;
        }
        .ce-toolbar__plus {
          position: absolute !important;
          left: -30px !important;
          top: 50% !important;
          transform: translateY(-50%) !important;
        }
        .ce-block {
          margin: 0 !important;
          padding: 0.4em 0 !important;
          position: relative !important;
        }
        .ce-toolbar {
          background: white !important;
        }
        .ce-inline-toolbar {
          z-index: 5 !important;
        }
        .ce-conversion-toolbar {
          z-index: 5 !important;
        }
        .ce-settings {
          transform: translateX(-10px) !important;
        }
      `;
      document.head.appendChild(style);
    }
  }, [onChange, initialContent]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsMounted(true);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      await initializeEditor();
    };

    if (isMounted) {
      init();
      return () => {
        ref.current?.destroy();
        ref.current = undefined;
      };
    }
  }, [isMounted, initializeEditor]);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="w-full">
      <Card className="border border-input bg-background w-full">
        <div id="event-editor" className="min-h-[50px] w-full relative p-4" />
      </Card>
    </div>
  );
};
