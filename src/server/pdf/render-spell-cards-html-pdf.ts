import { chromium } from "playwright";
import { readFileSync } from "node:fs";
import path from "node:path";
import type { Spell } from "@/types/spell";
import type { SpellCardsPdfLayoutOptions } from "@/server/pdf/spell-pdf-layout";
import { toRomanNumeral } from "@/lib/utils/roman-numerals";
import { mostRecentSpellCardSeasonYear } from "@/lib/utils/spell-card-date";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function chunkFour(spells: Spell[]): (Spell | null)[][] {
  const slots: (Spell | null)[] = [...spells];
  while (slots.length % 4 !== 0) slots.push(null);
  const pages: (Spell | null)[][] = [];
  for (let i = 0; i < slots.length; i += 4) {
    pages.push(slots.slice(i, i + 4));
  }
  return pages;
}

function detailsMarkup(spell: Spell): string {
  const details = [
    ["Casting Time", spell.data?.castingTime],
    ["Range", spell.data?.range],
    ["Area of Effect", spell.data?.areaOfEffect],
    ["Duration", spell.data?.duration],
    ["Save", spell.data?.save],
    ["Effect", spell.data?.effect],
  ] as const;
  return details
    .map(
      ([label, value]) =>
        `<div class="detail-item"><span class="detail-label">${escapeHtml(label)}:</span> ${escapeHtml((value || "-").trim())}</div>`
    )
    .join("");
}

function fontFaceCss(): string {
  const fontPath = (file: string) => path.join(process.cwd(), "public", "fonts", file);
  const toDataUrl = (file: string) => {
    const bytes = readFileSync(fontPath(file));
    return `data:font/ttf;base64,${bytes.toString("base64")}`;
  };
  try {
    const gentiumRegular = toDataUrl("GentiumBookPlus-Regular.ttf");
    const gentiumBold = toDataUrl("GentiumBookPlus-Bold.ttf");
    const interRegular = toDataUrl("Inter-Regular.ttf");
    const interBold = toDataUrl("Inter-Bold.ttf");
    return `
      @font-face {
        font-family: "AppSerif";
        src: url("${gentiumRegular}") format("truetype");
        font-weight: 400;
        font-style: normal;
      }
      @font-face {
        font-family: "AppSerif";
        src: url("${gentiumBold}") format("truetype");
        font-weight: 700;
        font-style: normal;
      }
      @font-face {
        font-family: "AppSans";
        src: url("${interRegular}") format("truetype");
        font-weight: 400;
        font-style: normal;
      }
      @font-face {
        font-family: "AppSans";
        src: url("${interBold}") format("truetype");
        font-weight: 700;
        font-style: normal;
      }
    `;
  } catch {
    return "";
  }
}

function spellCardMarkup(spell: Spell | null): string {
  if (!spell) return `<article class="card empty"></article>`;
  const authorName = spell.author?.trim() ?? "";
  const mostRecent = mostRecentSpellCardSeasonYear(spell);
  const authorLine = authorName ? `Author - ${authorName}${mostRecent ? ` · ${mostRecent}` : ""}` : "";
  const typeLabel = spell.type?.trim() || "Unassigned";
  const levelRoman = toRomanNumeral(spell.level);
  const descriptorLine =
    spell.data?.descriptor && spell.data.descriptor.length > 0 ? spell.data.descriptor.join(", ") : "—";
  const description = spell.description?.trim() || "No description provided.";
  const method = spell.data?.method?.trim() || "No method provided.";
  return `
    <article class="card">
      <header class="header">
        <div class="title-row">
          <h2>${escapeHtml(spell.title)}</h2>
          ${authorLine ? `<div class="author">${escapeHtml(authorLine)}</div>` : ""}
        </div>
        <div class="meta-row">
          <div class="left-meta">${escapeHtml(typeLabel)} · Level ${escapeHtml(levelRoman)}</div>
          <div class="right-meta"><span class="meta-label">Descriptor:</span> ${escapeHtml(descriptorLine)}</div>
        </div>
      </header>
      <section class="description">${escapeHtml(description)}</section>
      <section class="details-wrap">
        <h3>SPELL DETAILS</h3>
        <div class="details-grid">
          ${detailsMarkup(spell)}
        </div>
      </section>
      <footer class="method">
        <h3>METHOD</h3>
        <p>${escapeHtml(method)}</p>
      </footer>
    </article>
  `;
}

export function buildSpellCardsHtmlDocument(spells: Spell[], layout: SpellCardsPdfLayoutOptions): string {
  const pages = chunkFour(spells);
  const pageSize = layout.paperSize === "a4" ? "297mm 210mm" : "11in 8.5in";
  const marginInches = `${layout.marginInches}in`;
  const cropClass = layout.showCropMarks ? "show-crop" : "";
  const pageMarkup = pages
    .map(
      (slots) => `
      <section class="sheet ${cropClass}">
        <div class="grid">
          ${slots.map((s) => spellCardMarkup(s)).join("")}
        </div>
      </section>
    `
    )
    .join("");

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8"/>
    <title>Spell Cards</title>
    <style>
      ${fontFaceCss()}
      @page { size: ${pageSize}; margin: 0; }
      html, body { margin: 0; padding: 0; }
      body { font-family: "AppSerif", "Gentium Book Plus", Georgia, serif; color: #171717; background: #fff; }
      .sheet {
        box-sizing: border-box;
        width: 100vw;
        min-height: 100vh;
        padding: ${marginInches};
        position: relative;
        page-break-after: always;
      }
      .sheet:last-child { page-break-after: auto; }
      .grid {
        width: 100%;
        height: calc(100vh - (${marginInches} * 2));
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: 1fr 1fr;
        gap: 0;
        position: relative;
      }
      .card {
        box-sizing: border-box;
        border: 1px solid #d6d6d6;
        padding: 14px 14px 10px 14px;
        background: #fff;
        display: flex;
        flex-direction: column;
        min-height: 0;
      }
      .card.empty { background: #fff; }
      .header { display: block; }
      .title-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
      h2 { margin: 0; font-size: 18px; line-height: 1.15; font-weight: 700; letter-spacing: 0; }
      .author {
        font-family: "AppSans", Inter, Arial, sans-serif;
        font-size: 10px;
        font-weight: 700;
        color: #6b7280;
        text-align: right;
        white-space: nowrap;
      }
      .meta-row {
        margin-top: 5px;
        padding-top: 6px;
        border-top: 1px solid #e5e7eb;
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        gap: 12px;
        font-family: "AppSans", Inter, Arial, sans-serif;
        font-size: 11.2px;
        line-height: 1.15;
      }
      .left-meta { font-weight: 600; color: #1f2937; }
      .right-meta { text-align: right; color: #4b5563; max-width: 58%; }
      .meta-label { font-weight: 700; color: #6b7280; }
      .description {
        margin-top: 10px;
        font-size: 13.9px;
        line-height: 1.34;
        min-height: 96px;
        max-height: 126px;
        overflow: hidden;
      }
      .details-wrap { margin-top: auto; padding-top: 8px; }
      h3 {
        margin: 0 0 6px 0;
        font-family: "AppSans", Inter, Arial, sans-serif;
        font-size: 11.2px;
        letter-spacing: 0.03em;
        color: #6b7280;
        font-weight: 700;
      }
      .details-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        column-gap: 14px;
        row-gap: 5px;
        font-size: 12.2px;
        line-height: 1.2;
      }
      .detail-label { font-weight: 700; }
      .method {
        margin-top: 10px;
        border: 1px solid #e4e6ea;
        background: #f5f6f8;
        padding: 9px 10px;
        border-radius: 4px;
      }
      .method h3 { margin-bottom: 5px; }
      .method p {
        margin: 0;
        font-size: 12.3px;
        line-height: 1.3;
        white-space: pre-wrap;
      }
      .sheet.show-crop .grid::before,
      .sheet.show-crop .grid::after {
        content: "";
        position: absolute;
        background: #4b5563;
        pointer-events: none;
      }
      .sheet.show-crop .grid::before { width: 1px; height: 100%; left: 50%; top: 0; transform: translateX(-0.5px); }
      .sheet.show-crop .grid::after { height: 1px; width: 100%; top: 50%; left: 0; transform: translateY(-0.5px); }
    </style>
  </head>
  <body>${pageMarkup}</body>
</html>`;
}

export async function renderSpellCardsHtmlPdfBuffer(
  spells: Spell[],
  layout: SpellCardsPdfLayoutOptions
): Promise<Buffer> {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    const html = buildSpellCardsHtmlDocument(spells, layout);
    await page.setContent(html, { waitUntil: "networkidle" });
    const pdf = await page.pdf({
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    });
    return Buffer.from(new Uint8Array(pdf));
  } finally {
    await browser.close();
  }
}
