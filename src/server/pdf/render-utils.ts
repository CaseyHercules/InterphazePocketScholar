import { appendFile } from "node:fs/promises";
import { NextResponse } from "next/server";

type DebugPayload = {
  sessionId: string;
  runId: string;
  hypothesisId: string;
  location: string;
  message: string;
  data: Record<string, unknown>;
  timestamp: number;
};

const DEBUG_SESSION_ID = "16d2f9";
const DEBUG_INGEST_URL =
  "http://127.0.0.1:7303/ingest/ceb4e0c0-a9af-479b-8dd9-06b2280bffe3";
const DEBUG_LOG_PATH =
  "/Users/icarus/Documents/Coding/InterphazePocketScholar/.cursor/debug-16d2f9.log";

export function logPdfDebug(
  runId: string,
  hypothesisId: string,
  location: string,
  message: string,
  data: Record<string, unknown>
) {
  const payload: DebugPayload = {
    sessionId: DEBUG_SESSION_ID,
    runId,
    hypothesisId,
    location,
    message,
    data,
    timestamp: Date.now(),
  };

  fetch(DEBUG_INGEST_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": DEBUG_SESSION_ID,
    },
    body: JSON.stringify(payload),
  }).catch(() => {});

  appendFile(DEBUG_LOG_PATH, `${JSON.stringify(payload)}\n`).catch(() => {});
}

export function pdfBufferResponse(buffer: Buffer | Uint8Array, filename: string): NextResponse {
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
