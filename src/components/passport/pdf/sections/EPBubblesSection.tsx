import { View, Text } from "@react-pdf/renderer";
import { styles } from "../PassportPDFStyles";

type EPBubblesSectionProps = {
  primaryClassTitle: string;
  primaryEP: number;
  secondaryClassTitle: string | null;
  secondaryEP: number;
};

function Bubbles({ count }: { count: number }) {
  return (
    <View style={styles.bubbleRow}>
      {Array.from({ length: Math.max(0, count) }).map((_, i) => (
        <View key={i} style={styles.bubble} />
      ))}
    </View>
  );
}

export function EPBubblesSection({
  primaryClassTitle,
  primaryEP,
  secondaryClassTitle,
  secondaryEP,
}: EPBubblesSectionProps) {
  return (
    <View style={{ flex: 1, minWidth: 100 }}>
      <View style={{ marginBottom: 12 }}>
        <Text style={[styles.sectionTitle, { fontSize: 8 }]}>
          {primaryClassTitle || "Primary"} EP
        </Text>
        <Bubbles count={primaryEP} />
      </View>
      <View>
        <Text style={[styles.sectionTitle, { fontSize: 8 }]}>
          {secondaryClassTitle || "Secondary"} EP
        </Text>
        <Bubbles count={secondaryEP} />
      </View>
    </View>
  );
}
