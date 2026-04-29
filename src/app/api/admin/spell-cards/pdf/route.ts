import { NextResponse } from "next/server";
import React from "react";
import type { Spell, SpellData } from "@/types/spell";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { canReviewSpells } from "@/lib/spell-queries";
import { SpellCardsPdfDocument } from "@/components/print-cards/pdf/spell-cards-pdf-document";
import { renderToBuffer } from "@react-pdf/renderer";

export const runtime = "nodejs";

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

  const pdfElement = React.createElement(SpellCardsPdfDocument, {
    spells: ordered,
    layout: {
      paperSize,
      marginInches,
      showCropMarks,
    },
  });

  try {
    const buffer = await renderToBuffer(
      pdfElement as Parameters<typeof renderToBuffer>[0]
    );

    const stamp = new Date().toISOString().slice(0, 10);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="spell-cards-${stamp}.pdf"`,
      },
    });
  } catch (err) {
    console.error("spell-cards pdf render:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "PDF rendering failed. Try fewer spells or shorter text.",
      },
      { status: 500 }
    );
  }
}
