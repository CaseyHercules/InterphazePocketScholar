import { View, Text } from "@react-pdf/renderer";
import { styles } from "../PassportPDFStyles";
import {
  calculateStatValue,
  getStatBreakdown,
  getEPAvailableValues,
} from "@/lib/utils/character-stats";

type CombatStatsSectionProps = {
  character: any;
};

function StatBox({
  label,
  value,
  subLines,
}: {
  label: string;
  value: number;
  subLines?: string[];
}) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
      {subLines?.map((line, i) => (
        <Text key={i} style={{ fontSize: 7, marginTop: 2 }}>{String(line ?? "")}</Text>
      ))}
    </View>
  );
}

export function CombatStatsSection({ character }: CombatStatsSectionProps) {
  const attack = getStatBreakdown(character, "Attack");
  const accuracy = getStatBreakdown(character, "Accuracy");
  const epValues = getEPAvailableValues(character);

  const attackSub = [
    ...attack.adjustments.slice(0, 2).map((a) => a.title),
    ...attack.skillBonuses.slice(0, 2).map((s) => s.title),
  ];
  const accuracySub = [
    ...accuracy.adjustments.slice(0, 2).map((a) => a.title),
    ...accuracy.skillBonuses.slice(0, 2).map((s) => s.title),
  ];

  const hp = calculateStatValue(character, "HP");
  const defense = getStatBreakdown(character, "Defense");
  const resistance = getStatBreakdown(character, "Resistance");
  const defenseSub = defense.adjustments.map((a) => a.title).slice(0, 2);
  const resistSub = resistance.adjustments.map((a) => a.title).slice(0, 2);

  const tough = calculateStatValue(character, "Tough");
  const quick = calculateStatValue(character, "Quick");
  const mind = calculateStatValue(character, "Mind");

  return (
    <View style={[styles.row, { flexWrap: "wrap", marginBottom: 12, gap: 8 }]}>
      <StatBox label="Attack" value={attack.total} subLines={attackSub} />
      <StatBox label="Accuracy" value={accuracy.total} subLines={accuracySub} />
      <View style={styles.statBox}>
        <Text style={styles.statLabel}>Hit Points</Text>
        <Text style={styles.statValue}>{hp}</Text>
        {[1, 2, 3, 4, 5].map((i) => (
          <Text key={i} style={{ fontSize: 7, marginTop: 2, color: "#999" }}>
            00000 00000
          </Text>
        ))}
      </View>
      <StatBox label="Defense" value={defense.total} subLines={defenseSub} />
      <StatBox label="Resistance" value={resistance.total} subLines={resistSub} />
      <View style={[styles.statBox, { flexDirection: "row", gap: 12 }]}>
        <Text style={{ fontSize: 9 }}>Tough: {tough}</Text>
        <Text style={{ fontSize: 9 }}>Quick: {quick}</Text>
        <Text style={{ fontSize: 9 }}>Mind: {mind}</Text>
      </View>
    </View>
  );
}
