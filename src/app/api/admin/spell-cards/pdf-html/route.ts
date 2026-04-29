import { NextResponse } from "next/server";
import {
  renderSpellCardsHtmlPdfBuffer,
  type HtmlPdfVisualPreset,
} from "@/server/pdf/render-spell-cards-html-pdf";
import { logPdfDebug, pdfBufferResponse } from "@/server/pdf/render-utils";
import { loadSpellPdfPayload } from "@/server/pdf/spell-pdf-request";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const runId = `pdf-html-route-${Date.now()}`;
  logPdfDebug(runId, "H1", "pdf-html/route.ts:POST:start", "spell HTML PDF route entered", {
    runtime,
  });

  let preset: HtmlPdfVisualPreset = "editorial-bold";
  try {
    const cloned = req.clone();
    const body = (await cloned.json()) as { visualPreset?: HtmlPdfVisualPreset };
    if (body.visualPreset === "luxury-minimal" || body.visualPreset === "editorial-bold") {
      preset = body.visualPreset;
    }
  } catch {
    preset = "editorial-bold";
  }

  const loaded = await loadSpellPdfPayload(req);
  if ("error" in loaded) {
    return loaded.error;
  }
  const { spells, paperSize, marginInches, showCropMarks } = loaded.payload;

  try {
    const buffer = await renderSpellCardsHtmlPdfBuffer(spells, {
      paperSize,
      marginInches,
      showCropMarks,
    }, preset);
    const stamp = new Date().toISOString().slice(0, 10);
    return pdfBufferResponse(buffer, `spell-cards-html-${preset}-${stamp}.pdf`);
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : "HTML PDF pilot rendering failed. Verify Playwright browser availability.";
    logPdfDebug(runId, "H4", "pdf-html/route.ts:POST:catch", "renderSpellCardsHtmlPdfBuffer failed", {
      message,
      name: err instanceof Error ? err.name : "unknown",
      stackTop:
        err instanceof Error && err.stack ? err.stack.split("\n").slice(0, 4).join(" | ") : "no-stack",
    });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
