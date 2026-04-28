"use client";

import { BlobProvider } from "@react-pdf/renderer";
import { PassportPDFDocument } from "./pdf/PassportPDFDocument";
import type { PassportExportScope } from "./pdf/PassportPDFDocument";

type PDFBlobGeneratorProps = {
  docProps: {
    character: any;
    playerName?: string | null;
    scope: PassportExportScope;
    qrDataUrl: string | null;
  };
  onBlobReady: (state: { blob: Blob | null; loading: boolean }) => void;
  onDone: () => void;
};

export function PDFBlobGenerator({
  docProps,
  onBlobReady,
  onDone,
}: PDFBlobGeneratorProps) {
  const doc = (
    <PassportPDFDocument
      character={docProps.character}
      playerName={docProps.playerName}
      scope={docProps.scope}
      qrDataUrl={docProps.qrDataUrl}
    />
  );
  return (
    <BlobProvider document={doc}>
      {({ blob, loading }: { blob: Blob | null; loading: boolean }) => {
        if (!loading && blob) {
          onBlobReady({ blob, loading });
          onDone();
        }
        return null;
      }}
    </BlobProvider>
  );
}
