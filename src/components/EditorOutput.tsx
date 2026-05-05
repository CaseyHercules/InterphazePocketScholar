"use client";

import { FC } from "react";
import DynamicTextRenderer from "@/components/DynamicTextRenderer";
import { normalizePostContent } from "@/lib/post-content/normalize";

interface EditorOutputProps {
  content: any;
  dynamicLayout?: boolean;
  quickNavigationLinks?: Array<{ label: string; href: string }>;
}

const EditorOutput: FC<EditorOutputProps> = ({
  content,
  dynamicLayout = false,
  quickNavigationLinks,
}) => {
  const normalized = normalizePostContent(content);

  if (normalized.isLegacyBlocks) {
    return (
      <div className="text-base text-muted-foreground">
        Content format not supported
      </div>
    );
  }

  if (normalized.isEmpty) {
    return (
      <div className="text-base text-muted-foreground">
        No content available
      </div>
    );
  }

  return (
    <div className="text-sm text-zinc-800">
      {dynamicLayout ? (
        <DynamicTextRenderer
          text={normalized.text}
          font='400 14px "Inter", sans-serif'
          lineHeight={22}
          quickNavigationLinks={quickNavigationLinks}
        />
      ) : (
        <div className="whitespace-pre-wrap leading-6">{normalized.text}</div>
      )}
    </div>
  );
};

export default EditorOutput;
