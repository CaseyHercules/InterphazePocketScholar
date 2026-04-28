"use client";

import { PDFViewer } from "@react-pdf/renderer";
import { PassportPDFDocument } from "@/components/passport/pdf/PassportPDFDocument";
import type { PassportExportScope } from "@/components/passport/pdf/PassportPDFDocument";

type PassportPDFViewerProps = {
  character: any;
  scope: PassportExportScope;
  qrDataUrl: string | null;
  refreshKey: number;
};

export function PassportPDFViewer({
  character,
  scope,
  qrDataUrl,
  refreshKey,
}: PassportPDFViewerProps) {
  return (
    <PDFViewer key={refreshKey} width="100%" height={800} showToolbar>
      <PassportPDFDocument
        character={character}
        playerName={(character.user as { name?: string } | null)?.name ?? null}
        scope={scope}
        qrDataUrl={qrDataUrl}
      />
    </PDFViewer>
  );
}
