import { View, Text } from "@react-pdf/renderer";
import { styles, borderColor } from "../PassportPDFStyles";

type DailyTrackingSectionProps = {
  primaryClassTitle: string;
  primaryEP: number;
  secondaryClassTitle: string | null;
  secondaryEP: number;
};

function EPBubblesRow({ count = 5 }: { count?: number }) {
  return (
    <View style={styles.bubbleRow}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={styles.bubble} />
      ))}
    </View>
  );
}

export function DailyTrackingSection({
  primaryClassTitle,
  primaryEP,
  secondaryClassTitle,
  secondaryEP,
}: DailyTrackingSectionProps) {
  const days = [1, 2, 3];
  return (
    <View style={{ flex: 1, minWidth: 140 }}>
      {days.map((day) => (
        <View key={day} style={styles.dailyBox}>
          <Text style={[styles.sectionTitle, { fontSize: 9, marginBottom: 4 }]}>
            DAY {day}
          </Text>
          <View style={{ marginBottom: 6 }}>
            <Text style={{ fontSize: 8, fontFamily: "Helvetica-Bold" }}>
              Primary Class: {primaryClassTitle || "—"}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 2 }}>
              <Text style={{ fontSize: 8, marginRight: 4 }}>EP:</Text>
              <View style={{ borderWidth: 1, borderColor, paddingHorizontal: 4, paddingVertical: 2 }}>
                <Text style={{ fontSize: 8 }}>{primaryEP}</Text>
              </View>
            </View>
            <View style={{ marginTop: 2 }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <EPBubblesRow key={i} count={5} />
              ))}
              <EPBubblesRow count={4} />
            </View>
          </View>
          <View>
            <Text style={{ fontSize: 8, fontFamily: "Helvetica-Bold" }}>
              Secondary Class: {secondaryClassTitle || "—"}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 2 }}>
              <Text style={{ fontSize: 8, marginRight: 4 }}>EP:</Text>
              <View style={{ borderWidth: 1, borderColor, paddingHorizontal: 4, paddingVertical: 2 }}>
                <Text style={{ fontSize: 8 }}>{secondaryEP}</Text>
              </View>
            </View>
            <View style={{ marginTop: 2 }}>
              {Array.from({ length: 2 }).map((_, i) => (
                <EPBubblesRow key={i} count={5} />
              ))}
              <EPBubblesRow count={3} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}
