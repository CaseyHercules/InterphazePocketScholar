import { View, Text } from "@react-pdf/renderer";
import { styles } from "../PassportPDFStyles";
import { getSpecialAbilitiesFromInlineEffects } from "@/types/inline-effects";

type SpecialAbilitySectionProps = {
  character: any;
};

export function SpecialAbilitySection({ character }: SpecialAbilitySectionProps) {
  const abilities = getSpecialAbilitiesFromInlineEffects(character.inlineEffectsJson);
  const first = abilities[0];

  if (!first) {
    return (
      <View style={[styles.bordered, { marginBottom: 12, minHeight: 80 }]}>
        <Text style={styles.sectionTitle}>Special Ability</Text>
        <Text style={{ fontSize: 8, color: "#999" }}>None</Text>
      </View>
    );
  }

  return (
    <View style={[styles.bordered, { marginBottom: 12 }]}>
      <Text style={[styles.sectionTitle, { marginBottom: 4 }]}>
        Special Ability: {first.title}
      </Text>
      <Text style={{ fontSize: 8, lineHeight: 1.4 }}>
        {first.note || ""}
      </Text>
      <View style={{ position: "absolute", top: 8, right: 12, flexDirection: "row", gap: 12 }}>
        <Text style={{ fontSize: 7 }}>Day 1: 000</Text>
        <Text style={{ fontSize: 7 }}>Day 2: 000</Text>
        <Text style={{ fontSize: 7 }}>Day 3: 000</Text>
      </View>
    </View>
  );
}
