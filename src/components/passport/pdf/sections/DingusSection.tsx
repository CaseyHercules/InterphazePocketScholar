import { View, Text } from "@react-pdf/renderer";
import { styles, borderColor, mutedColor } from "../PassportPDFStyles";
import { getDingusItemsFromInlineEffects } from "@/types/inline-effects";

type DingusSectionProps = {
  character: any;
};

export function DingusSection({ character }: DingusSectionProps) {
  const dingusItems = getDingusItemsFromInlineEffects(character.inlineEffectsJson);

  return (
    <View
      style={{
        flex: 1,
        borderWidth: 1,
        borderColor,
        padding: 8,
        marginTop: 8,
      }}
    >
      <Text style={[styles.sectionTitle, { fontSize: 9, marginBottom: 6 }]}>
        DINGUS:
      </Text>
      {dingusItems.length === 0 ? (
        <Text style={{ fontSize: 8, color: "#999" }}>—</Text>
      ) : (
        dingusItems.map((item, i) => (
          <View key={i} style={{ marginBottom: 6 }}>
            <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold" }}>
              {item.title}:
            </Text>
            {item.note && (
              <Text style={{ fontSize: 8, marginTop: 2, color: mutedColor, lineHeight: 1.3 }}>
                {item.note}
              </Text>
            )}
          </View>
        ))
      )}
    </View>
  );
}
