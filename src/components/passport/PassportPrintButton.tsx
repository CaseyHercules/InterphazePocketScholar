"use client";

import { useState, useRef } from "react";
import dynamic from "next/dynamic";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PassportExportScope } from "./pdf/PassportPDFDocument";

const PDFBlobGenerator = dynamic(
  () => import("./PDFBlobGenerator").then((m) => m.PDFBlobGenerator),
  { ssr: false }
);

type PassportPrintButtonProps = {
  characterId: string;
  character: any;
  playerName?: string | null;
};

async function generateQrDataUrl(url: string): Promise<string> {
  const QRCode = (await import("qrcode")).default;
  return QRCode.toDataURL(url, { width: 128, margin: 1 });
}

export function PassportPrintButton({
  characterId,
  character,
  playerName,
}: PassportPrintButtonProps) {
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [docProps, setDocProps] = useState<{
    character: any;
    playerName?: string | null;
    scope: PassportExportScope;
    qrDataUrl: string | null;
  } | null>(null);
  const printTriggered = useRef(false);

  const handlePrint = async () => {
    setLoading(true);
    try {
      const baseUrl =
        typeof window !== "undefined"
          ? window.location.origin
          : "https://interphaze-pocket-scholar.vercel.app";
      const passportUrl = `${baseUrl}/passport/${characterId}`;
      const qrDataUrl = await generateQrDataUrl(passportUrl);
      const scope: PassportExportScope = { main: true, spells: false, items: false };
      setDocProps({ character, playerName, scope, qrDataUrl });
      setGenerating(true);
    } catch (err) {
      console.error("QR generation failed:", err);
      setLoading(false);
    }
  };

  const handleBlobReady = (state: { blob: Blob | null; loading: boolean }) => {
    if (!state.blob || state.loading || printTriggered.current || !docProps)
      return;
    printTriggered.current = true;
    const url = URL.createObjectURL(state.blob);
    const iframe = document.createElement("iframe");
    iframe.style.position = "absolute";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "none";
    document.body.appendChild(iframe);
    iframe.src = url;
    iframe.onload = () => {
      setTimeout(() => {
        iframe.contentWindow?.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
          URL.revokeObjectURL(url);
        }, 500);
      }, 250);
    };
    setLoading(false);
    setGenerating(false);
    setDocProps(null);
  };

  return (
    <>
      <Button size="sm" variant="outline" onClick={handlePrint} disabled={loading}>
        <Printer className="h-4 w-4 mr-2" />
        Print
      </Button>
      {generating && docProps && (
        <PDFBlobGenerator
          docProps={docProps}
          onBlobReady={handleBlobReady}
          onDone={() => {
            setGenerating(false);
            setDocProps(null);
          }}
        />
      )}
    </>
  );
}
