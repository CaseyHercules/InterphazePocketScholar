"use client";

import dynamic from "next/dynamic";
import { FC } from "react";
import CustomCodeRenderer from "@/components/renderers/CustomCodeRenderer";
import CustomImageRenderer from "@/components/renderers/CustomImageRenderer";

const Output = dynamic(
  async () => (await import("editorjs-react-renderer")).default,
  {
    ssr: false,
  }
);

interface EditorOutputProps {
  content: any;
}

const style = {
  header: {
    h2: { fontSize: "1.3rem", lineHeight: "1.5rem", fontWeight: "bold" },
  },
  paragraph: {
    fontSize: "1rem",
    lineHeight: "1.55rem",
  },
  list: {
    container: {
      paddingInlineStart: "1.2rem",
      listStyleType: "disc",
    },
    listItem: {
      paddingInlineStart: ".5rem",
    },
  },
};

const renderers = {
  image: CustomImageRenderer,
  code: CustomCodeRenderer,
};

const EditorOutput: FC<EditorOutputProps> = ({ content }) => {
  return (
    <Output
      data={content}
      style={style}
      className="text-sm"
      renderer={renderers}
    />
  );
};

export default EditorOutput;
