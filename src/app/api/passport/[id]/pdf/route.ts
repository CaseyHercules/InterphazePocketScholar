import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCharacterForPassport } from "@/lib/actions/passport";
import { PassportPDFDocument } from "@/components/passport/pdf/PassportPDFDocument";
import React from "react";
import { generateQrDataUrl } from "@/lib/qr";
import { pdfBufferResponse } from "@/server/pdf/render-utils";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const main = searchParams.get("main") !== "false";
  const spells = searchParams.get("spells") !== "false";
  const items = searchParams.get("items") !== "false";

  try {
    const character = await getCharacterForPassport(id);

    if (
      character.userId !== session.user.id &&
      session.user.role !== "ADMIN" &&
      session.user.role !== "SUPERADMIN"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ??
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "https://interphaze-pocket-scholar.vercel.app");
    const passportUrl = `${baseUrl}/passport/${id}`;
    const qrDataUrl = await generateQrDataUrl(passportUrl);

    const scope = { main, spells, items };
    const playerName = (character.user as { name?: string } | null)?.name ?? null;

    const doc = React.createElement(PassportPDFDocument, {
      character,
      playerName,
      scope,
      qrDataUrl,
    }) as React.ReactElement<any>;

    const { renderToBuffer } = await import("@react-pdf/renderer");
    const buffer = await renderToBuffer(doc);

    return pdfBufferResponse(buffer, `${character.name}-passport.pdf`);
  } catch (err) {
    console.error("PDF generation failed:", err);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
