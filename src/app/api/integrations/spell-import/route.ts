import { createHash, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { createSpellRecord } from "@/lib/spell-create";
import { checkSpellImportRateLimit } from "@/lib/spell-import-rate-limit";
import type { CreateSpellInput } from "@/types/spell";

function apiKeysMatch(secret: string, provided: string): boolean {
  const a = createHash("sha256").update(secret).digest();
  const b = createHash("sha256").update(provided).digest();
  return (
    a.length === b.length &&
    timingSafeEqual(new Uint8Array(a), new Uint8Array(b))
  );
}

function getBearerToken(req: NextRequest): string | null {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  return auth.slice(7).trim();
}

function clientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}

export async function POST(req: NextRequest) {
  const configuredKey = process.env.SPELL_IMPORT_API_KEY;
  if (!configuredKey) {
    return NextResponse.json(
      { error: "Spell import is not configured" },
      { status: 503 }
    );
  }

  const token = getBearerToken(req);
  if (!token || !apiKeysMatch(configuredKey, token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!checkSpellImportRateLimit(clientIp(req))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const body: CreateSpellInput = await req.json();
    const canPublish = process.env.SPELL_IMPORT_CAN_PUBLISH === "true";
    const defaultAuthor = process.env.SPELL_IMPORT_DEFAULT_AUTHOR?.trim();
    const merged: CreateSpellInput = {
      ...body,
      author: body.author ?? defaultAuthor ?? undefined,
    };

    const result = await createSpellRecord(merged, {
      actingAsReviewer: canPublish,
    });

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    return NextResponse.json(result.spell);
  } catch {
    return NextResponse.json(
      { error: "Error creating spell" },
      { status: 500 }
    );
  }
}
