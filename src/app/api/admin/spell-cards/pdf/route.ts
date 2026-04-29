import { NextResponse } from "next/server";
import { renderSpellCardsPdfBuffer } from "@/server/pdf/render-spell-cards-pdf";
import { logPdfDebug, pdfBufferResponse } from "@/server/pdf/render-utils";
import { loadSpellPdfPayload } from "@/server/pdf/spell-pdf-request";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const runId = `pdf-route-${Date.now()}`;
  logPdfDebug(runId, "H1", "route.ts:POST:start", "spell PDF route entered", {
    runtime,
  });
  const loaded = await loadSpellPdfPayload(req);
  if ("error" in loaded) {
    return loaded.error;
  }
  const { spells: ordered, paperSize, marginInches, showCropMarks } = loaded.payload;

  logPdfDebug(runId, "H3", "route.ts:POST:payload", "prepared spell payload", {
    spellCount: ordered.length,
    firstSpellTitleType: typeof ordered[0]?.title,
    firstSpellLevelType: typeof ordered[0]?.level,
    firstSpellAuthorType: typeof ordered[0]?.author,
    firstSpellDescriptorIsArray: Array.isArray(ordered[0]?.data?.descriptor),
  });

  try {
    const buffer = await renderSpellCardsPdfBuffer(ordered, {
      paperSize,
      marginInches,
      showCropMarks,
    });

    const stamp = new Date().toISOString().slice(0, 10);

    return pdfBufferResponse(buffer, `spell-cards-${stamp}.pdf`);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "PDF rendering failed. Try fewer spells or shorter text.";
    logPdfDebug(runId, "H4", "route.ts:POST:catch", "renderSpellCardsPdfBuffer failed", {
      message,
      name: err instanceof Error ? err.name : "unknown",
      stackTop:
        err instanceof Error && err.stack
          ? err.stack.split("\n").slice(0, 4).join(" | ")
          : "no-stack",
    });
    console.error("spell-cards pdf render:", message);
    if (err instanceof Error && err.stack) {
      console.error(err.stack);
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
