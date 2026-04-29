import type { Spell } from "@/types/spell";
import type { SpellCardsPdfLayoutOptions } from "@/server/pdf/spell-pdf-layout";
import { appendFile } from "node:fs/promises";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { mostRecentSpellCardSeasonYear } from "@/lib/utils/spell-card-date";
import { toRomanNumeral } from "@/lib/utils/roman-numerals";

function debugLog(
  runId: string,
  hypothesisId: string,
  location: string,
  message: string,
  data: Record<string, unknown>
) {
  const payload = {
    sessionId: "16d2f9",
    runId,
    hypothesisId,
    location,
    message,
    data,
    timestamp: Date.now(),
  };
  // #region agent log
  fetch("http://127.0.0.1:7303/ingest/ceb4e0c0-a9af-479b-8dd9-06b2280bffe3", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "16d2f9",
    },
    body: JSON.stringify(payload),
  }).catch(() => {});
  // #endregion
  // #region agent log
  appendFile(
    "/Users/icarus/Documents/Coding/InterphazePocketScholar/.cursor/debug-16d2f9.log",
    `${JSON.stringify(payload)}\n`
  ).catch(() => {});
  // #endregion
}

export async function renderSpellCardsPdfBuffer(
  spells: Spell[],
  layout: SpellCardsPdfLayoutOptions
): Promise<Buffer> {
  const runId = `render-module-${Date.now()}`;
  debugLog(runId, "H2", "render-spell-cards-pdf.ts:entry", "render helper entered", {
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
  const slots: (Spell | null)[] = [...spells];
  while (slots.length % 4 !== 0) slots.push(null);
  const document = await PDFDocument.create();
  const font = await document.embedFont(StandardFonts.TimesRoman);
  const bold = await document.embedFont(StandardFonts.TimesRomanBold);
  const palette = {
    text: rgb(0.12, 0.12, 0.14),
    muted: rgb(0.45, 0.45, 0.48),
    border: rgb(0.82, 0.84, 0.87),
    cardFill: rgb(0.99, 0.99, 0.99),
    methodFill: rgb(0.96, 0.965, 0.975),
    guide: rgb(0.52, 0.54, 0.58),
  };
  const spacing = {
    cardPad: 14,
    rowGap: 8,
    bodyLine: 10.5,
    methodHeight: 74,
  };
  const typeScale = {
    title: 19,
    meta: 8.3,
    body: 7.8,
    label: 6.9,
    details: 7.3,
  };

  const safe = (value: unknown, max: number) => String(value ?? "").replace(/\u0000/g, "").trim().slice(0, max);
  const clampLine = (
    value: unknown,
    maxWidth: number,
    size: number,
    face: typeof font | typeof bold
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
    face: typeof font | typeof bold
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
    let cursorY = top;
    sheet.drawText(title, {
      x: left,
      y: cursorY,
      size: typeScale.title,
      font: bold,
      color: palette.text,
      maxWidth: rightWidth,
    });
    if (authorLine) {
      sheet.drawText(clampLine(authorLine, 140, typeScale.meta, bold), {
        x: x + cardWidth - spacing.cardPad - 140,
        y: cursorY + 1.5,
        size: typeScale.meta,
        font: bold,
        color: palette.muted,
        maxWidth: 140,
      });
    }
    cursorY -= spacing.rowGap + 3;
    if (authorLine) {
      cursorY -= 1;
    }

    sheet.drawLine({
      start: { x: left, y: cursorY + 3 },
      end: { x: x + cardWidth - spacing.cardPad, y: cursorY + 3 },
      thickness: 0.5,
      color: palette.border,
    });

    sheet.drawText(clampLine(`${type} · Level ${level}`, rightWidth * 0.56, typeScale.meta, font), {
      x: left,
      y: cursorY,
      size: typeScale.meta,
      font,
      color: palette.text,
      maxWidth: rightWidth * 0.56,
    });
    sheet.drawText(clampLine(`Descriptor: ${descriptor}`, rightWidth * 0.42, typeScale.meta, font), {
      x: x + cardWidth - spacing.cardPad - rightWidth * 0.42,
      y: cursorY,
      size: typeScale.meta,
      font,
      color: palette.muted,
      maxWidth: rightWidth * 0.42,
    });
    cursorY -= spacing.rowGap + 3;
    sheet.drawLine({
      start: { x: left, y: cursorY },
      end: { x: x + cardWidth - spacing.cardPad, y: cursorY },
      thickness: 0.5,
      color: palette.border,
    });
    cursorY -= spacing.rowGap;

    const methodBoxY = y + spacing.cardPad;
    const methodBoxHeight = spacing.methodHeight;
    const detailsHeight = 66;
    const detailsY = methodBoxY + methodBoxHeight + 10;
    const bodyBottom = detailsY + detailsHeight + spacing.rowGap;
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
      font: bold,
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
    const colW = (rightWidth - 14) / 2;
    let rowY = detailsY + detailsHeight - 24;
    for (let i = 0; i < details.length; i += 2) {
      const [l1, v1] = details[i];
      const [l2, v2] = details[i + 1];
      sheet.drawText(clampLine(`${l1}: ${safe(v1 || "-", 80)}`, colW, typeScale.details, font), {
        x: left,
        y: rowY,
        size: typeScale.details,
        font,
        color: palette.text,
        maxWidth: colW,
      });
      sheet.drawText(clampLine(`${l2}: ${safe(v2 || "-", 80)}`, colW, typeScale.details, font), {
        x: left + colW + 14,
        y: rowY,
        size: typeScale.details,
        font,
        color: palette.text,
        maxWidth: colW,
      });
      rowY -= 10.2;
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
      font: bold,
      color: palette.muted,
    });
    const methodLines = wrap(method, rightWidth - 2, typeScale.body, 4, font);
    let methodY = methodBoxY + methodBoxHeight - 22;
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
  debugLog(runId, "H1", "render-spell-cards-pdf.ts:success", "pdf-lib render succeeded", {
    pageCount,
    cardCount: spells.length,
    bufferLength: buffer.length,
  });
  return buffer;
}
