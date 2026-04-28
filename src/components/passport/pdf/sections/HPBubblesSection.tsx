import { View, Text } from "@react-pdf/renderer";
import { styles, borderColor } from "../PassportPDFStyles";
import { calculateStatValue } from "@/lib/utils/character-stats";

type HPBubblesSectionProps = {
  character: any;
};

function Bubbles({ count, perRow = 10 }: { count: number; perRow?: number }) {
  const rows = Math.ceil(count / perRow) || 1;
  return (
    <View>
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <View key={rowIdx} style={[styles.bubbleRow, { marginBottom: 2 }]}>
          {Array.from({
            length: rowIdx < rows - 1 ? perRow : count - rowIdx * perRow || 1,
          }).map((_, i) => (
            <View key={i} style={styles.bubble} />
          ))}
        </View>
      ))}
    </View>
  );
}

export function HPBubblesSection({ character }: HPBubblesSectionProps) {
  const hp = calculateStatValue(character, "HP");
  return (
    <View style={{ width: 70, borderWidth: 1, borderColor, padding: 6 }}>
      <Text style={[styles.sectionTitle, { fontSize: 8, marginBottom: 4 }]}>
        HP
      </Text>
      <Text style={{ fontSize: 12, fontFamily: "Helvetica-Bold", marginBottom: 4 }}>{hp}</Text>
      <Bubbles count={Math.max(hp, 10)} perRow={5} />
    </View>
  );
}
