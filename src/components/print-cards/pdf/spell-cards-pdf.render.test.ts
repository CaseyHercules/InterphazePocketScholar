import { test } from "node:test";
import assert from "node:assert/strict";
import { PDFDocument } from "pdf-lib";
import { renderSpellCardsPdfBuffer } from "@/server/pdf/render-spell-cards-pdf";
import {
  defaultPdfLayout,
  messySpells,
  minimalSpells,
} from "@/components/print-cards/pdf/__fixtures__/spell-fixtures";

function assertPdfMagic(buf: Buffer) {
  assert.ok(buf.length > 500, "buffer should be non-trivial size");
  assert.equal(buf.subarray(0, 5).toString(), "%PDF-", "should start with PDF magic");
}

test("spell renderer returns valid PDF bytes for minimal fixture", async () => {
  const buf = await renderSpellCardsPdfBuffer(minimalSpells(), defaultPdfLayout);
  assertPdfMagic(buf);
});

test("spell renderer handles minimal fixture set", async () => {
  const buf = await renderSpellCardsPdfBuffer(minimalSpells(), defaultPdfLayout);
  assertPdfMagic(buf);
});

test("spell renderer handles messy edge-case fixture set", async () => {
  const buf = await renderSpellCardsPdfBuffer(messySpells(), {
    ...defaultPdfLayout,
    showCropMarks: true,
  });
  assertPdfMagic(buf);
  assert.ok(buf.length > 2000, "styled messy PDF should remain non-trivial");
});

test("renderer supports a4 layout option", async () => {
  const buf = await renderSpellCardsPdfBuffer(minimalSpells(), {
    ...defaultPdfLayout,
    paperSize: "a4",
  });
  assertPdfMagic(buf);
});

test("renderer keeps four-card page packing invariant", async () => {
  const spells = [
    ...minimalSpells(),
    ...messySpells(),
    ...minimalSpells(),
    ...minimalSpells(),
    ...minimalSpells(),
  ];
  const buf = await renderSpellCardsPdfBuffer(spells, defaultPdfLayout);
  assertPdfMagic(buf);
  const doc = await PDFDocument.load(buf);
  assert.equal(doc.getPageCount(), 2);
});
