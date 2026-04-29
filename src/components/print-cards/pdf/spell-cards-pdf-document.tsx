import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import type { Spell, SpellData } from "@/types/spell";
import { toRomanNumeral } from "@/lib/utils/roman-numerals";
import { mostRecentSpellCardSeasonYear } from "@/lib/utils/spell-card-date";

const PT_PER_IN = 72;
const GUTTER_PT = 8;

function pdfSafe(text: string | undefined | null, maxLen: number): string {
  if (text == null) {
    return "";
  }
  return String(text).replace(/\u0000/g, "").slice(0, maxLen);
}

function asPlainString(value: unknown, fallback = ""): string {
  if (value == null) {
    return fallback;
  }
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  try {
    return JSON.stringify(value);
  } catch {
    return fallback;
  }
}

function formatDescriptorLine(data: SpellData | undefined): string {
  const raw = data?.descriptor;
  if (raw == null) {
    return "—";
  }
  if (Array.isArray(raw)) {
    return raw.map((x) => asPlainString(x)).filter(Boolean).join(", ") || "—";
  }
  return asPlainString(raw, "—");
}

const COLORS = {
  border: "#d4d4d8",
  text: "#18181b",
  muted: "#71717a",
  methodBg: "#fafafa",
  methodBorder: "#e4e4e7",
};

function pageDims(paperSize: "letter" | "a4"): [number, number] {
  return paperSize === "letter" ? [792, 612] : [842, 595];
}

export type SpellCardsPdfLayoutOptions = {
  paperSize: "letter" | "a4";
  marginInches: number;
  showCropMarks: boolean;
};

function innerLayout(options: SpellCardsPdfLayoutOptions) {
  const [pw, ph] = pageDims(options.paperSize);
  const m = options.marginInches * PT_PER_IN;
  const innerW = pw - 2 * m;
  const innerH = ph - 2 * m;
  const cardW = (innerW - GUTTER_PT) / 2;
  const cardH = (innerH - GUTTER_PT) / 2;
  return { pw, ph, marginPt: m, innerW, innerH, cardW, cardH };
}

const pdfStyles = StyleSheet.create({
  cardOuter: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: "solid",
    backgroundColor: "#ffffff",
    padding: 5,
    overflow: "hidden",
    flexDirection: "column",
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 3,
  },
  title: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: COLORS.text,
    paddingRight: 4,
  },
  author: {
    fontSize: 6,
    color: COLORS.muted,
    maxWidth: 56,
    textAlign: "right",
  },
  subRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderTopWidth: 0.5,
    borderTopColor: "#e4e4e7",
    paddingTop: 2,
    marginBottom: 3,
  },
  subLeft: {
    fontSize: 7,
    color: COLORS.text,
    paddingRight: 4,
  },
  subRight: {
    fontSize: 7,
    color: COLORS.text,
    maxWidth: 200,
    textAlign: "right",
  },
  descWrap: {
    flexGrow: 1,
    flexShrink: 1,
    marginBottom: 3,
    minHeight: 24,
  },
  desc: {
    fontSize: 7,
    lineHeight: 1.25,
    color: COLORS.text,
  },
  sectionLabel: {
    fontSize: 6,
    fontFamily: "Helvetica-Bold",
    color: COLORS.muted,
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  detailGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 3,
  },
  detailPair: {
    width: "50%",
    paddingRight: 4,
    paddingBottom: 2,
  },
  detailText: {
    fontSize: 6,
    lineHeight: 1.25,
    color: COLORS.text,
  },
  methodBox: {
    borderTopWidth: 0.5,
    borderTopColor: COLORS.methodBorder,
    backgroundColor: COLORS.methodBg,
    paddingTop: 3,
    paddingHorizontal: 3,
    paddingBottom: 3,
    flexShrink: 0,
  },
  methodText: {
    fontSize: 7,
    lineHeight: 1.25,
    color: COLORS.text,
    maxHeight: 42,
  },
  emptySlot: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#c4c4ce",
    backgroundColor: "#fafafa",
  },
});

function cropMarks(show: boolean) {
  if (!show) return null;
  return (
    <View
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
      }}
    >
      <View
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 10,
          height: 10,
          borderLeftWidth: 0.5,
          borderTopWidth: 0.5,
          borderColor: "#888",
        }}
      />
      <View
        style={{
          position: "absolute",
          right: 0,
          bottom: 0,
          width: 10,
          height: 10,
          borderRightWidth: 0.5,
          borderBottomWidth: 0.5,
          borderColor: "#888",
        }}
      />
    </View>
  );
}

function SpellCardPdf({
  spell,
  width,
  height,
  showCropMarks,
}: {
  spell: Spell | null;
  width: number;
  height: number;
  showCropMarks: boolean;
}) {
  if (!spell) {
    return (
      <View style={{ width, height, position: "relative" }}>
        <View style={[pdfStyles.emptySlot, { width, height }]} />
        {cropMarks(showCropMarks)}
      </View>
    );
  }

  const data = spell.data as SpellData | undefined;
  const typeLabel = pdfSafe(asPlainString(spell.type, "Unassigned").trim() || "Unassigned", 120);
  const levelNum = Math.trunc(Number(spell.level));
  const levelRoman =
    Number.isFinite(levelNum) && levelNum > 0
      ? toRomanNumeral(levelNum)
      : pdfSafe(asPlainString(spell.level, "0"), 8);
  const descriptorLine = formatDescriptorLine(data);
  const authorRaw = asPlainString(spell.author, "");
  const authorName = authorRaw.trim() || undefined;
  const recent = mostRecentSpellCardSeasonYear(spell);

  const details = [
    ["Casting Time", data?.castingTime],
    ["Range", data?.range],
    ["Area of Effect", data?.areaOfEffect],
    ["Duration", data?.duration],
    ["Save", data?.save],
    ["Effect", data?.effect],
  ] as const;

  const descriptionText = (() => {
    const d = asPlainString(spell.description, "");
    return d.trim() || "No description provided.";
  })();

  const methodText = (() => {
    const m = asPlainString(data?.method, "");
    return m.trim() || "No method provided.";
  })();

  return (
    <View style={{ width, height, position: "relative" }}>
      <View style={[pdfStyles.cardOuter, { width, height }]}>
        <View style={pdfStyles.titleRow}>
          <Text style={pdfStyles.title}>{pdfSafe(String(spell.title ?? ""), 200)}</Text>
          {authorName ? (
            <Text style={pdfStyles.author}>
              {pdfSafe(
                `Author - ${authorName}${recent ? ` · ${recent}` : ""}`,
                120
              )}
            </Text>
          ) : null}
        </View>
        <View style={pdfStyles.subRow}>
          <Text style={pdfStyles.subLeft}>
            {`${typeLabel} · Level ${levelRoman}`}
          </Text>
          <Text style={pdfStyles.subRight}>
            {`Descriptor: ${pdfSafe(descriptorLine, 400)}`}
          </Text>
        </View>
        <View style={pdfStyles.descWrap}>
          <Text style={pdfStyles.desc}>{pdfSafe(descriptionText, 2200)}</Text>
        </View>
        <View>
          <Text style={pdfStyles.sectionLabel}>SPELL DETAILS</Text>
          <View style={pdfStyles.detailGrid}>
            {details.map(([label, value]) => (
              <View key={label} style={pdfStyles.detailPair}>
                <Text style={pdfStyles.detailText}>
                  {`${label}: ${pdfSafe(asPlainString(value, "-"), 900)}`}
                </Text>
              </View>
            ))}
          </View>
        </View>
        <View style={pdfStyles.methodBox}>
          <Text style={pdfStyles.sectionLabel}>METHOD</Text>
          <Text style={pdfStyles.methodText}>{pdfSafe(methodText, 1200)}</Text>
        </View>
      </View>
      {cropMarks(showCropMarks)}
    </View>
  );
}

function padSpells(spells: Spell[]): (Spell | null)[] {
  const out: (Spell | null)[] = [...spells];
  while (out.length % 4 !== 0) {
    out.push(null);
  }
  return out;
}

export function SpellCardsPdfDocument({
  spells,
  layout,
}: {
  spells: Spell[];
  layout: SpellCardsPdfLayoutOptions;
}) {
  const padded = padSpells(spells);
  const pages: (Spell | null)[][] = [];
  for (let i = 0; i < padded.length; i += 4) {
    pages.push(padded.slice(i, i + 4));
  }

  const { pw, ph, marginPt, innerW, innerH, cardW, cardH } = innerLayout(layout);

  return (
    <Document>
      {pages.map((slots, pageIdx) => (
        <Page
          key={`p-${pageIdx}`}
          size={[pw, ph]}
          style={{
            padding: marginPt,
            backgroundColor: "#ffffff",
          }}
        >
          <View
            style={{
              width: innerW,
              height: innerH,
              flexDirection: "column",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                width: innerW,
                height: cardH,
                marginBottom: GUTTER_PT,
                justifyContent: "space-between",
              }}
            >
              <SpellCardPdf
                spell={slots[0] ?? null}
                width={cardW}
                height={cardH}
                showCropMarks={layout.showCropMarks}
              />
              <SpellCardPdf
                spell={slots[1] ?? null}
                width={cardW}
                height={cardH}
                showCropMarks={layout.showCropMarks}
              />
            </View>
            <View
              style={{
                flexDirection: "row",
                width: innerW,
                height: cardH,
                justifyContent: "space-between",
              }}
            >
              <SpellCardPdf
                spell={slots[2] ?? null}
                width={cardW}
                height={cardH}
                showCropMarks={layout.showCropMarks}
              />
              <SpellCardPdf
                spell={slots[3] ?? null}
                width={cardW}
                height={cardH}
                showCropMarks={layout.showCropMarks}
              />
            </View>
          </View>
        </Page>
      ))}
    </Document>
  );
}
