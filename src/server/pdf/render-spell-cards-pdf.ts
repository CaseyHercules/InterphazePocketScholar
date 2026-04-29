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
  const gutter = 8;
  const page = layout.paperSize === "a4" ? { width: 842, height: 595 } : { width: 792, height: 612 };
  const margin = layout.marginInches * pointsPerInch;
  const innerWidth = page.width - margin * 2;
  const innerHeight = page.height - margin * 2;
  const cardWidth = (innerWidth - gutter) / 2;
  const cardHeight = (innerHeight - gutter) / 2;
  const slots: (Spell | null)[] = [...spells];
  while (slots.length % 4 !== 0) slots.push(null);
  const document = await PDFDocument.create();
  const font = await document.embedFont(StandardFonts.Helvetica);
  const bold = await document.embedFont(StandardFonts.HelveticaBold);
  const colorText = rgb(0.1, 0.1, 0.1);
  const colorMuted = rgb(0.43, 0.43, 0.45);
  const colorBorder = rgb(0.84, 0.84, 0.87);

  const safe = (value: unknown, max: number) => String(value ?? "").replace(/\u0000/g, "").trim().slice(0, max);
  const wrap = (input: string, maxChars: number, maxLines: number): string[] => {
    const words = input.split(/\s+/).filter(Boolean);
    if (words.length === 0) return [""];
    const lines: string[] = [];
    let current = "";
    for (const word of words) {
      const next = current ? `${current} ${word}` : word;
      if (next.length > maxChars) {
        if (current) lines.push(current);
        current = word.slice(0, maxChars);
      } else {
        current = next;
      }
      if (lines.length >= maxLines) break;
    }
    if (current && lines.length < maxLines) lines.push(current);
    return lines.slice(0, maxLines);
  };

  const drawCropMarks = (sheet: Awaited<ReturnType<typeof document.addPage>>, x: number, y: number) => {
    if (!layout.showCropMarks) return;
    const mark = 8;
    sheet.drawLine({ start: { x: x - mark, y }, end: { x, y }, thickness: 0.6, color: colorMuted });
    sheet.drawLine({ start: { x, y: y - mark }, end: { x, y }, thickness: 0.6, color: colorMuted });
    sheet.drawLine({
      start: { x: x + cardWidth, y: y + cardHeight + mark },
      end: { x: x + cardWidth, y: y + cardHeight },
      thickness: 0.6,
      color: colorMuted,
    });
    sheet.drawLine({
      start: { x: x + cardWidth + mark, y: y + cardHeight },
      end: { x: x + cardWidth, y: y + cardHeight },
      thickness: 0.6,
      color: colorMuted,
    });
  };

  const drawSpellCard = (
    sheet: Awaited<ReturnType<typeof document.addPage>>,
    spell: Spell | null,
    x: number,
    y: number
  ) => {
    sheet.drawRectangle({ x, y, width: cardWidth, height: cardHeight, borderColor: colorBorder, borderWidth: 1 });
    drawCropMarks(sheet, x, y);
    if (!spell) return;

    const title = safe(spell.title, 90);
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

    let cursorY = y + cardHeight - 14;
    sheet.drawText(title, { x: x + 8, y: cursorY, size: 10, font: bold, color: colorText, maxWidth: cardWidth - 16 });
    cursorY -= 10;
    if (authorLine) {
      sheet.drawText(authorLine, {
        x: x + 8,
        y: cursorY,
        size: 6,
        font,
        color: colorMuted,
        maxWidth: cardWidth - 16,
      });
      cursorY -= 10;
    } else {
      cursorY -= 2;
    }

    sheet.drawText(`${type} · Level ${level}`, {
      x: x + 8,
      y: cursorY,
      size: 7,
      font,
      color: colorText,
      maxWidth: cardWidth - 16,
    });
    cursorY -= 10;
    sheet.drawText(`Descriptor: ${safe(descriptor, 85)}`, {
      x: x + 8,
      y: cursorY,
      size: 7,
      font,
      color: colorText,
      maxWidth: cardWidth - 16,
    });
    cursorY -= 12;

    const bodyLines = wrap(description, 60, 13);
    for (const line of bodyLines) {
      if (cursorY < y + 60) break;
      sheet.drawText(line, { x: x + 8, y: cursorY, size: 7, font, color: colorText, maxWidth: cardWidth - 16 });
      cursorY -= 8;
    }

    sheet.drawText("METHOD", { x: x + 8, y: y + 42, size: 6, font: bold, color: colorMuted });
    const methodLines = wrap(method, 60, 4);
    let methodY = y + 32;
    for (const line of methodLines) {
      sheet.drawText(line, { x: x + 8, y: methodY, size: 7, font, color: colorText, maxWidth: cardWidth - 16 });
      methodY -= 8;
    }
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
