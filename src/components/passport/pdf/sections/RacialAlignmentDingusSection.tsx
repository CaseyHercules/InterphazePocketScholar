import { View, Text } from "@react-pdf/renderer";
import { styles, mutedColor } from "../PassportPDFStyles";
import { getRacialAdjustmentData } from "@/lib/utils/racial-adjustments";
import { parseAlignmentFromJson, ALIGNMENT_MAX_TICKS } from "@/types/alignment";
import { getDingusItemsFromInlineEffects } from "@/types/inline-effects";

type RacialAlignmentDingusSectionProps = {
  character: any;
};

export function RacialAlignmentDingusSection({ character }: RacialAlignmentDingusSectionProps) {
  const racial = getRacialAdjustmentData(character);
  const alignment = parseAlignmentFromJson(character.alignmentJson);
  const dingusItems = getDingusItemsFromInlineEffects(character.inlineEffectsJson);

  const alignmentStr = alignment
    ? (() => {
        const [, upTicks, downTicks] = alignment;
        const upStr = Array.from({ length: ALIGNMENT_MAX_TICKS }, (_, i) =>
          i >= ALIGNMENT_MAX_TICKS - upTicks ? "X" : "O"
        ).join(" ");
        const downStr = Array.from({ length: ALIGNMENT_MAX_TICKS }, (_, i) =>
          i < downTicks ? "X" : "O"
        ).join(" ");
        return `${upStr} | ${alignment[0]} | ${downStr}`;
      })()
    : null;

  const allRacialItems = [
    ...racial.statItems.map((s) => s.formatted + (s.optional ? " (Optional)" : " (Included)")),
    ...racial.abilityItems.map((a) => a.text + (a.optional ? " (Optional)" : " (Included)")),
  ];

  return (
    <View style={[styles.row, { marginBottom: 12 }]}>
      <View style={[styles.table, { flex: 1, marginRight: 8 }]}>
        <View style={[styles.tableRow, { backgroundColor: "#f5f5f5" }]}>
          <Text style={[styles.tableCell, { fontFamily: "Helvetica-Bold" }]}>
            RACE: {racial.race || "—"}
          </Text>
        </View>
        {allRacialItems.length === 0 ? (
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, { color: "#999" }]}>—</Text>
          </View>
        ) : (
          allRacialItems.map((item, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={styles.tableCell}>{String(item ?? "")}</Text>
            </View>
          ))
        )}
      </View>

      <View style={{ flex: 1 }}>
        <View style={[styles.bordered, { marginBottom: 8 }]}>
          <Text style={styles.sectionTitle}>Alignment</Text>
          <Text style={{ fontSize: 9, fontFamily: "Courier" }}>
            {alignmentStr || "—"}
          </Text>
        </View>

        <View style={styles.bordered}>
          <Text style={styles.sectionTitle}>DINGUS</Text>
          {dingusItems.length === 0 ? (
            <Text style={{ fontSize: 8, color: "#999" }}>—</Text>
          ) : (
            dingusItems.map((item, i) => (
              <View key={i} style={{ marginBottom: 4 }}>
                <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold" }}>
                  {item.title}
                </Text>
                {item.note && (
                  <Text style={{ fontSize: 8, marginTop: 2, color: mutedColor }}>
                    {item.note}
                  </Text>
                )}
              </View>
            ))
          )}
        </View>
      </View>
    </View>
  );
}
