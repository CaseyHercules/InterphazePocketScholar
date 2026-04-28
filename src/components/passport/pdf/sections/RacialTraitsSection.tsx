import { View, Text } from "@react-pdf/renderer";
import { styles } from "../PassportPDFStyles";
import { getRacialAdjustmentData } from "@/lib/utils/racial-adjustments";

type RacialTraitsSectionProps = {
  character: any;
};

function truncateBeforeColon(s: string): string {
  const idx = s.indexOf(":");
  return idx >= 0 ? s.slice(0, idx).trim() : s;
}

export function RacialTraitsSection({ character }: RacialTraitsSectionProps) {
  const racial = getRacialAdjustmentData(character);
  const statItems = racial.statItems.map((s) => ({
    label: truncateBeforeColon(s.formatted),
    status: s.optional ? "Optional" : "Included",
  }));
  const abilityItems = racial.abilityItems.map((a) => ({
    label: truncateBeforeColon(a.text),
    status: a.optional ? "Optional" : "Included",
  }));
  const allItems = [...statItems, ...abilityItems];

  return (
    <View style={[styles.table, { flex: 1, marginBottom: 0 }]}>
      <View style={[styles.tableRow, { backgroundColor: "#e8e8e8" }]}>
        <Text style={[styles.tableCell, { fontFamily: "Helvetica-Bold" }]}>
          RACE: {racial.race || "—"}
        </Text>
      </View>
      {allItems.length === 0 ? (
        <View style={styles.tableRow}>
          <Text style={[styles.tableCell, { color: "#999" }]}>—</Text>
        </View>
      ) : (
        allItems.map((item, i) => (
          <View
            key={i}
            style={[
              styles.tableRow,
              { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
            ]}
          >
            <Text style={[styles.tableCell, { flex: 1 }]}>{item.label}</Text>
            <Text style={[styles.tableCell, { width: 50, textAlign: "right", flexShrink: 0 }]}>
              {item.status}
            </Text>
          </View>
        ))
      )}
    </View>
  );
}
