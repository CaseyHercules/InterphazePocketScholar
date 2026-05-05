const SKILL_TABLE_TAG_REGEX = /\[\[SkillTable\s+class\s*=\s*([^\]]+)\]\]/gi;

interface SkillTableEmbed {
  type: "skilltable";
  className: string;
}

export interface NormalizedPostContent {
  text: string;
  embeds: SkillTableEmbed[];
  skillTableClassName: string | null;
  isEmpty: boolean;
  isLegacyBlocks: boolean;
}

const extractSkillTags = (input: string) => {
  const classes: string[] = [];
  const cleaned = input.replace(SKILL_TABLE_TAG_REGEX, (_, className: string) => {
    const trimmed = String(className ?? "").trim();
    if (trimmed) classes.push(trimmed);
    return "";
  });
  SKILL_TABLE_TAG_REGEX.lastIndex = 0;
  return { cleaned, classes };
};

const parseStringAsJson = (value: string): unknown => {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const extractOps = (content: unknown): any[] | null => {
  if (!content || typeof content !== "object") return null;
  const record = content as Record<string, unknown>;

  if (Array.isArray(record.ops)) {
    return record.ops;
  }

  if (
    record.content &&
    typeof record.content === "object" &&
    Array.isArray((record.content as Record<string, unknown>).ops)
  ) {
    return (record.content as Record<string, any>).ops;
  }

  if (typeof record.content === "string") {
    const parsed = parseStringAsJson(record.content);
    if (
      parsed &&
      typeof parsed === "object" &&
      Array.isArray((parsed as Record<string, unknown>).ops)
    ) {
      return (parsed as Record<string, any>).ops;
    }
  }

  return null;
};

export const normalizePostContent = (content: unknown): NormalizedPostContent => {
  if (!content) {
    return {
      text: "",
      embeds: [],
      skillTableClassName: null,
      isEmpty: true,
      isLegacyBlocks: false,
    };
  }

  if (
    typeof content === "object" &&
    content !== null &&
    Array.isArray((content as Record<string, unknown>).blocks)
  ) {
    return {
      text: "",
      embeds: [],
      skillTableClassName: null,
      isEmpty: false,
      isLegacyBlocks: true,
    };
  }

  if (typeof content === "string") {
    const parsed = parseStringAsJson(content);
    if (typeof parsed === "string") {
      const { cleaned, classes } = extractSkillTags(parsed);
      const trimmed = cleaned.trim();
      return {
        text: trimmed,
        embeds: classes.map((className) => ({ type: "skilltable" as const, className })),
        skillTableClassName: classes[0] ?? null,
        isEmpty: trimmed.length === 0,
        isLegacyBlocks: false,
      };
    }
    return normalizePostContent(parsed);
  }

  const ops = extractOps(content);
  if (!ops) {
    return {
      text: "",
      embeds: [],
      skillTableClassName: null,
      isEmpty: true,
      isLegacyBlocks: false,
    };
  }

  const textParts: string[] = [];
  const embeds: SkillTableEmbed[] = [];
  const tagClasses: string[] = [];

  for (const op of ops) {
    const insert = op?.insert;
    if (typeof insert === "string") {
      const { cleaned, classes } = extractSkillTags(insert);
      if (classes.length > 0) tagClasses.push(...classes);
      textParts.push(cleaned);
      continue;
    }

    if (
      insert &&
      typeof insert === "object" &&
      typeof insert.skilltable?.className === "string"
    ) {
      const className = insert.skilltable.className.trim();
      if (className) {
        embeds.push({ type: "skilltable", className });
      }
    }
  }

  const text = textParts.join("").replace(/\r\n/g, "\n");
  const skillTableClassName = embeds[0]?.className ?? tagClasses[0] ?? null;

  return {
    text: text.trim(),
    embeds: [
      ...embeds,
      ...tagClasses.map((className) => ({ type: "skilltable" as const, className })),
    ],
    skillTableClassName,
    isEmpty: text.trim().length === 0,
    isLegacyBlocks: false,
  };
};
