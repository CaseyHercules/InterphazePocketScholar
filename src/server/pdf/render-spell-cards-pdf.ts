import type { Spell } from "@/types/spell";
import type { SpellCardsPdfLayoutOptions } from "@/server/pdf/spell-pdf-layout";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { mostRecentSpellCardSeasonYear } from "@/lib/utils/spell-card-date";
import { toRomanNumeral } from "@/lib/utils/roman-numerals";
import { logPdfDebug } from "@/server/pdf/render-utils";

export async function renderSpellCardsPdfBuffer(
  spells: Spell[],
  layout: SpellCardsPdfLayoutOptions
): Promise<Buffer> {
  const runId = `render-module-${Date.now()}`;
  logPdfDebug(runId, "H2", "render-spell-cards-pdf.ts:entry", "render helper entered", {
    spellCount: spells.length,
    renderer: "pdf-lib",
    paperSize: layout.paperSize,
    marginInches: layout.marginInches,
    showCropMarks: layout.showCropMarks,
  });
  const pointsPerInch = 72;
  const gutter = 0;
  const page = layout.paperSize === "a4" ? { width: 842, height: 595 } : { width: 792, height: 612 };
  const margin = layout.marginInches * pointsPerInch;
  const innerWidth = page.width - margin * 2;
  const innerHeight = page.height - margin * 2;
  const cardWidth = (innerWidth - gutter) / 2;
  const cardHeight = (innerHeight - gutter) / 2;
  const [gentiumRegularBytes, gentiumBoldBytes, interRegularBytes, interBoldBytes] = await Promise.all([
    readFile(path.join(process.cwd(), "public", "fonts", "GentiumBookPlus-Regular.ttf")),
    readFile(path.join(process.cwd(), "public", "fonts", "GentiumBookPlus-Bold.ttf")),
    readFile(path.join(process.cwd(), "public", "fonts", "Inter-Regular.ttf")),
    readFile(path.join(process.cwd(), "public", "fonts", "Inter-Bold.ttf")),
  ]);
  const slots: (Spell | null)[] = [...spells];
  while (slots.length % 4 !== 0) slots.push(null);
  const document = await PDFDocument.create();
  document.registerFontkit(fontkit);
  const font = await document.embedFont(new Uint8Array(gentiumRegularBytes));
  const bold = await document.embedFont(new Uint8Array(gentiumBoldBytes));
  const ui = await document.embedFont(new Uint8Array(interRegularBytes));
  const uiBold = await document.embedFont(new Uint8Array(interBoldBytes));
  const palette = {
    text: rgb(0.12, 0.12, 0.14),
    muted: rgb(0.45, 0.45, 0.48),
    border: rgb(0.82, 0.84, 0.87),
    cardFill: rgb(0.99, 0.99, 0.99),
    methodFill: rgb(0.96, 0.965, 0.975),
    guide: rgb(0.52, 0.54, 0.58),
  };
  const spacing = {
    cardPad: 16,
    rowGap: 7,
    bodyLine: 10.35,
    methodHeight: 78,
  };
  const typeScale = {
    title: 21,
    meta: 8.4,
    body: 7.55,
    label: 7.1,
    details: 7.05,
  };

  const safe = (value: unknown, max: number) => String(value ?? "").replace(/\u0000/g, "").trim().slice(0, max);
  const clampLine = (
    value: unknown,
    maxWidth: number,
    size: number,
    face: typeof font | typeof bold | typeof ui | typeof uiBold
  ) => {
    const source = safe(value, 1000);
    if (!source) return "";
    if (face.widthOfTextAtSize(source, size) <= maxWidth) return source;
    let text = source;
    while (text.length > 1 && face.widthOfTextAtSize(`${text}…`, size) > maxWidth) {
      text = text.slice(0, -1);
    }
    return `${text.trimEnd()}…`;
  };
  const wrap = (
    input: string,
    maxWidth: number,
    size: number,
    maxLines: number,
    face: typeof font | typeof bold | typeof ui | typeof uiBold
  ): string[] => {
    const words = safe(input, 4000).split(/\s+/).filter(Boolean);
    if (words.length === 0) return ["-"];
    const lines: string[] = [];
    let current = "";
    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (face.widthOfTextAtSize(candidate, size) <= maxWidth) {
        current = candidate;
      } else {
        if (current) {
          lines.push(current);
          if (lines.length >= maxLines) break;
          current = word;
        } else {
          lines.push(clampLine(word, maxWidth, size, face));
          if (lines.length >= maxLines) break;
          current = "";
        }
      }
    }
    if (current && lines.length < maxLines) lines.push(current);
    if (lines.length > maxLines) return lines.slice(0, maxLines);
    if (lines.length === maxLines && words.length > 0) {
      lines[maxLines - 1] = clampLine(lines[maxLines - 1], maxWidth, size, face);
    }
    return lines;
  };
  const drawLabelValue = (args: {
    sheet: Awaited<ReturnType<typeof document.addPage>>;
    x: number;
    y: number;
    width: number;
    size: number;
    label: string;
    value: string;
  }) => {
    const { sheet, x, y, width, size, label, value } = args;
    const labelText = `${label}:`;
    const labelWidth = uiBold.widthOfTextAtSize(labelText, size);
    const valueWidth = Math.max(10, width - labelWidth - 3);
    sheet.drawText(labelText, {
      x,
      y,
      size,
      font: uiBold,
      color: palette.text,
      maxWidth: width,
    });
    sheet.drawText(clampLine(value || "-", valueWidth, size, ui), {
      x: x + labelWidth + 3,
      y,
      size,
      font: ui,
      color: palette.text,
      maxWidth: valueWidth,
    });
  };

  const drawSpellCard = (
    sheet: Awaited<ReturnType<typeof document.addPage>>,
    spell: Spell | null,
    x: number,
    y: number
  ) => {
    sheet.drawRectangle({ x, y, width: cardWidth, height: cardHeight, color: palette.cardFill });
    sheet.drawRectangle({ x, y, width: cardWidth, height: cardHeight, borderColor: palette.border, borderWidth: 1 });
    if (!spell) return;

    const title = safe(spell.title, 150);
    const author = safe(spell.author, 48);
    const recent = mostRecentSpellCardSeasonYear(spell);
    const authorLine = author ? `Author - ${author}${recent ? ` · ${recent}` : ""}` : "";
    const levelNum = Number(spell.level ?? 0);
    const level = Number.isFinite(levelNum) && levelNum > 0 ? toRomanNumeral(levelNum) : safe(spell.level, 3);
    const type = safe(spell.type || "Unassigned", 36);
    const descriptor = Array.isArray(spell.data?.descriptor)
      ? spell.data.descriptor.join(", ")
      : safe(spell.data?.descriptor || "—", 120);
    const description = safe(spell.description || "No description provided.", 2000);
    const method = safe(spell.data?.method || "No method provided.", 600);
    const left = x + spacing.cardPad;
    const rightWidth = cardWidth - spacing.cardPad * 2;
    const top = y + cardHeight - spacing.cardPad;
    const authorWidth = authorLine
      ? Math.min(170, uiBold.widthOfTextAtSize(clampLine(authorLine, 190, typeScale.meta, uiBold), typeScale.meta))
      : 0;
    const titleMaxWidth = Math.max(100, rightWidth - (authorWidth > 0 ? authorWidth + 14 : 0));
    let cursorY = top - 1;
    sheet.drawText(clampLine(title, titleMaxWidth, typeScale.title, bold), {
      x: left,
      y: cursorY,
      size: typeScale.title,
      font: bold,
      color: palette.text,
      maxWidth: titleMaxWidth,
    });
    if (authorLine) {
      sheet.drawText(clampLine(authorLine, authorWidth, typeScale.meta, uiBold), {
        x: x + cardWidth - spacing.cardPad - authorWidth,
        y: cursorY + 2.5,
        size: typeScale.meta,
        font: uiBold,
        color: palette.muted,
        maxWidth: authorWidth,
      });
    }
    cursorY -= spacing.rowGap + 5;
    if (authorLine) {
      cursorY -= 1.5;
    }

    sheet.drawLine({
      start: { x: left, y: cursorY + 3 },
      end: { x: x + cardWidth - spacing.cardPad, y: cursorY + 3 },
      thickness: 0.5,
      color: palette.border,
    });

    sheet.drawText(clampLine(`${type} · Level ${level}`, rightWidth * 0.56, typeScale.meta, ui), {
      x: left,
      y: cursorY + 0.5,
      size: typeScale.meta,
      font: uiBold,
      color: palette.text,
      maxWidth: rightWidth * 0.56,
    });
    const descriptorWidth = rightWidth * 0.42;
    const descriptorLabel = "Descriptor:";
    const descriptorLabelWidth = uiBold.widthOfTextAtSize(descriptorLabel, typeScale.meta);
    sheet.drawText(descriptorLabel, {
      x: x + cardWidth - spacing.cardPad - rightWidth * 0.42,
      y: cursorY + 0.25,
      size: typeScale.meta - 0.3,
      font: uiBold,
      color: palette.muted,
      maxWidth: descriptorWidth,
    });
    sheet.drawText(
      clampLine(descriptor, Math.max(12, descriptorWidth - descriptorLabelWidth - 4), typeScale.meta, ui),
      {
        x: x + cardWidth - spacing.cardPad - rightWidth * 0.42 + descriptorLabelWidth + 4,
        y: cursorY + 0.25,
        size: typeScale.meta - 0.3,
        font: ui,
        color: palette.muted,
        maxWidth: Math.max(12, descriptorWidth - descriptorLabelWidth - 4),
      }
    );
    cursorY -= spacing.rowGap + 4;
    sheet.drawLine({
      start: { x: left, y: cursorY },
      end: { x: x + cardWidth - spacing.cardPad, y: cursorY },
      thickness: 0.5,
      color: palette.border,
    });
    cursorY -= spacing.rowGap;

    const methodBoxY = y + spacing.cardPad;
    const methodBoxHeight = spacing.methodHeight;
    const detailsHeight = 61;
    const detailsY = methodBoxY + methodBoxHeight + 8;
    const bodyBottom = detailsY + detailsHeight + spacing.rowGap + 2;
    const availableBodyHeight = Math.max(18, cursorY - bodyBottom);
    const maxBodyLines = Math.max(2, Math.floor(availableBodyHeight / spacing.bodyLine));
    const bodyLines = wrap(description, rightWidth, typeScale.body, maxBodyLines, font);
    for (const line of bodyLines) {
      if (cursorY < bodyBottom + 1) break;
      sheet.drawText(line, {
        x: left,
        y: cursorY,
        size: typeScale.body,
        font,
        color: palette.text,
        maxWidth: rightWidth,
      });
      cursorY -= spacing.bodyLine;
    }

    sheet.drawText("SPELL DETAILS", {
      x: left,
      y: detailsY + detailsHeight - 10,
      size: typeScale.label,
      font: uiBold,
      color: palette.muted,
    });
    const details = [
      ["Casting Time", spell.data?.castingTime],
      ["Range", spell.data?.range],
      ["Area of Effect", spell.data?.areaOfEffect],
      ["Duration", spell.data?.duration],
      ["Save", spell.data?.save],
      ["Effect", spell.data?.effect],
    ] as const;
    const colW = (rightWidth - 10) / 2;
    let rowY = detailsY + detailsHeight - 24;
    for (let i = 0; i < details.length; i += 2) {
      const [l1, v1] = details[i];
      const [l2, v2] = details[i + 1];
      drawLabelValue({
        sheet,
        x: left,
        y: rowY,
        width: colW,
        size: typeScale.details,
        label: l1,
        value: safe(v1 || "-", 80),
      });
      drawLabelValue({
        sheet,
        x: left + colW + 10,
        y: rowY,
        width: colW,
        size: typeScale.details,
        label: l2,
        value: safe(v2 || "-", 80),
      });
      rowY -= 9.7;
    }

    sheet.drawRectangle({
      x: left - 1,
      y: methodBoxY,
      width: cardWidth - (left - x - 1) * 2,
      height: methodBoxHeight,
      color: palette.methodFill,
      borderColor: palette.border,
      borderWidth: 0.6,
    });
    sheet.drawText("METHOD", {
      x: left,
      y: methodBoxY + methodBoxHeight - 12,
      size: typeScale.label,
      font: uiBold,
      color: palette.muted,
    });
    const methodLines = wrap(method, rightWidth - 2, typeScale.body, 4, font);
    let methodY = methodBoxY + methodBoxHeight - 20;
    for (const line of methodLines) {
      sheet.drawText(line, {
        x: left,
        y: methodY,
        size: typeScale.body,
        font,
        color: palette.text,
        maxWidth: rightWidth,
      });
      methodY -= spacing.bodyLine;
    }
  };

  const drawCenterCutGuides = (sheet: Awaited<ReturnType<typeof document.addPage>>) => {
    if (!layout.showCropMarks) return;
    const centerX = margin + cardWidth;
    const centerY = margin + cardHeight;
    sheet.drawLine({
      start: { x: centerX, y: margin },
      end: { x: centerX, y: margin + innerHeight },
      thickness: 0.8,
      color: palette.guide,
    });
    sheet.drawLine({
      start: { x: margin, y: centerY },
      end: { x: margin + innerWidth, y: centerY },
      thickness: 0.8,
      color: palette.guide,
    });
  };

  const pageCount = slots.length / 4;
  for (let pageIndex = 0; pageIndex < pageCount; pageIndex += 1) {
    const sheet = document.addPage([page.width, page.height]);
    const slotIndex = pageIndex * 4;
    const topY = margin + cardHeight + gutter;
    drawSpellCard(sheet, slots[slotIndex], margin, topY);
    drawSpellCard(sheet, slots[slotIndex + 1], margin + cardWidth + gutter, topY);
    drawSpellCard(sheet, slots[slotIndex + 2], margin, margin);
    drawSpellCard(sheet, slots[slotIndex + 3], margin + cardWidth + gutter, margin);
    drawCenterCutGuides(sheet);
  }

  const bytes = await document.save();
  const buffer = Buffer.from(bytes);
  logPdfDebug(runId, "H1", "render-spell-cards-pdf.ts:success", "pdf-lib render succeeded", {
    pageCount,
    cardCount: spells.length,
    bufferLength: buffer.length,
  });
  return buffer;
}
