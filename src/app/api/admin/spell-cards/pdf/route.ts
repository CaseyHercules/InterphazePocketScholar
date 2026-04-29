import { NextResponse } from "next/server";
import type { Spell, SpellData } from "@/types/spell";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { canReviewSpells } from "@/lib/spell-queries";
import { renderSpellCardsPdfBuffer } from "@/server/pdf/render-spell-cards-pdf";
import { appendFile } from "node:fs/promises";

export const runtime = "nodejs";

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

type Body = {
  spellIds?: string[];
  paperSize?: "letter" | "a4";
  marginInches?: number;
  showCropMarks?: boolean;
};

const ALLOWED_MARGINS = [0.25, 0.35, 0.5] as const;

function normalizeMarginInches(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  return ALLOWED_MARGINS.some((m) => Math.abs(m - n) < 1e-9) ? n : 0.25;
}

function serializeSpellForPdf(row: {
  id: string;
  title: string;
  description: string | null;
  level: number;
  type: string | null;
  author: string | null;
  data: unknown;
  createdAt: Date;
  reworkedAt: Date | null;
}): Spell {
  let data: SpellData | undefined;
  if (row.data != null) {
    try {
      data = JSON.parse(JSON.stringify(row.data)) as SpellData;
    } catch {
      data = undefined;
    }
  }
  return {
    id: row.id,
    title: String(row.title ?? ""),
    description: row.description == null ? undefined : String(row.description),
    level: Number.isFinite(Number(row.level)) ? Number(row.level) : 0,
    type: row.type == null ? undefined : String(row.type),
    author: row.author == null ? undefined : String(row.author),
    data,
    createdAt: row.createdAt,
    reworkedAt: row.reworkedAt ?? undefined,
  };
}

export async function POST(req: Request) {
  const runId = `pdf-route-${Date.now()}`;
  debugLog(runId, "H1", "route.ts:POST:start", "spell PDF route entered", {
    runtime,
  });
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const user = await db.user.findFirst({ where: { id: session.user.id } });
  if (!user || !canReviewSpells(user.role)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const spellIds = Array.isArray(body.spellIds)
    ? body.spellIds.filter((id): id is string => typeof id === "string" && id.length > 0)
    : [];
  if (spellIds.length === 0) {
    return NextResponse.json({ error: "spellIds required" }, { status: 400 });
  }

  const paperSize = body.paperSize === "a4" ? "a4" : "letter";
  const marginInches = normalizeMarginInches(body.marginInches);
  const showCropMarks = Boolean(body.showCropMarks);

  const uniqueKeys = [...new Set(spellIds)];
  const spellsDb = await db.spell.findMany({
    where: {
      OR: [
        { id: { in: uniqueKeys } },
        { title: { in: uniqueKeys } },
      ],
    },
  });

  const byId = new Map(spellsDb.map((s) => [s.id, s]));
  const byTitle = new Map(spellsDb.map((s) => [s.title, s]));

  const ordered: Spell[] = [];
  for (const key of spellIds) {
    const row = byId.get(key) ?? byTitle.get(key);
    if (!row) {
      return NextResponse.json(
        { error: `Spell not found for queue key "${key}". Use id or exact title.` },
        { status: 400 }
      );
    }
    ordered.push(serializeSpellForPdf(row));
  }

  debugLog(runId, "H3", "route.ts:POST:payload", "prepared spell payload", {
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

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="spell-cards-${stamp}.pdf"`,
      },
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "PDF rendering failed. Try fewer spells or shorter text.";
    debugLog(runId, "H4", "route.ts:POST:catch", "renderSpellCardsPdfBuffer failed", {
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
