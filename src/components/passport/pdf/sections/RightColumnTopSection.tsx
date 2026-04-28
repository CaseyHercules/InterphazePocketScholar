import { View, Text } from "@react-pdf/renderer";
import { styles, borderColor } from "../PassportPDFStyles";
import {
  calculateStatValue,
  getStatBreakdown,
} from "@/lib/utils/character-stats";
import { getSpecialAbilitiesFromInlineEffects } from "@/types/inline-effects";
import { HeaderSection } from "./HeaderSection";

type RightColumnTopSectionProps = {
  character: any;
  characterTitle?: string | null;
  playerName?: string | null;
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
    <View style={[styles.statBox, { flex: 1, minWidth: 70 }]}>
      <Text style={[styles.statLabel, { fontFamily: "Helvetica-Bold" }]}>{label}:</Text>
      <Text style={styles.statValue}>{value}</Text>
      {subLines?.map((line, i) => (
        <Text key={i} style={{ fontSize: 7, marginTop: 1 }}>{String(line ?? "")}</Text>
      ))}
      {Array.from({ length: 4 - (subLines?.length ?? 0) }).map((_, i) => (
        <View key={i} style={{ borderBottomWidth: 1, borderBottomColor: "#ccc", marginTop: 2, width: "80%" }} />
      ))}
    </View>
  );
}

function HPBox({ hp }: { hp: number }) {
  const totalBubbles = Math.max(hp, 48);
  const rows = Math.ceil(totalBubbles / 5);
  return (
    <View style={[styles.statBox, { flex: 1, minWidth: 80 }]}>
      <Text style={[styles.statLabel, { fontFamily: "Helvetica-Bold" }]}>Hit Points:</Text>
      <Text style={[styles.statValue, { marginBottom: 4 }]}>{hp}</Text>
      <View style={{ flexDirection: "column" }}>
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <View key={rowIdx} style={[styles.bubbleRow, { marginBottom: 1 }]}>
            {Array.from({
              length: rowIdx < rows - 1 ? 5 : (totalBubbles % 5) || 5,
            }).map((_, i) => (
              <View key={i} style={styles.bubble} />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

export function RightColumnTopSection({
  character,
  characterTitle,
  playerName,
}: RightColumnTopSectionProps) {
  const attack = getStatBreakdown(character, "Attack");
  const accuracy = getStatBreakdown(character, "Accuracy");
  const defense = getStatBreakdown(character, "Defense");
  const resistance = getStatBreakdown(character, "Resistance");
  const hp = calculateStatValue(character, "HP");
  const tough = calculateStatValue(character, "Tough");
  const quick = calculateStatValue(character, "Quick");
  const mind = calculateStatValue(character, "Mind");

  const attackSub = [
    ...attack.adjustments.slice(0, 2).map((a) => a.title),
    ...attack.skillBonuses.slice(0, 2).map((s) => s.title),
  ].filter(Boolean);
  const accuracySub = [
    ...accuracy.adjustments.slice(0, 2).map((a) => a.title),
    ...accuracy.skillBonuses.slice(0, 2).map((s) => s.title),
  ].filter(Boolean);
  const defenseSub = defense.adjustments.map((a) => a.title).slice(0, 2);
  const resistSub = resistance.adjustments.map((a) => a.title).slice(0, 2);

  const abilities = getSpecialAbilitiesFromInlineEffects(character.inlineEffectsJson);
  const specialAbility = abilities[0];

  return (
    <View style={{ flex: 1.2, minWidth: 200 }}>
      <HeaderSection
        characterName={character.name}
        characterTitle={characterTitle}
        playerName={playerName}
      />
      <View
        style={[
          styles.bordered,
          {
            marginBottom: 8,
            paddingRight: 56,
            position: "relative",
          },
        ]}
      >
        <Text style={[styles.sectionTitle, { fontSize: 9, marginBottom: 4 }]}>
          Special Ability:{" "}
          <Text style={{ fontFamily: "Helvetica-Bold" }}>
            {specialAbility ? `${specialAbility.title}` : "None"}
          </Text>
        </Text>
        <Text style={{ fontSize: 8, lineHeight: 1.4 }}>
          {specialAbility
            ? String(specialAbility.note ?? "").slice(0, 200)
            : ""}
        </Text>
        <View
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Text style={{ fontSize: 7 }}>Day 1: OOO</Text>
          <Text style={{ fontSize: 7 }}>Day 2: OOO</Text>
          <Text style={{ fontSize: 7 }}>Day 3: OOO</Text>
        </View>
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
        <StatBox label="Attack" value={attack.total} subLines={attackSub} />
        <StatBox label="Accuracy" value={accuracy.total} subLines={accuracySub} />
        <HPBox hp={hp} />
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
        <StatBox label="Defense" value={defense.total} subLines={defenseSub} />
        <StatBox label="Resistance" value={resistance.total} subLines={resistSub} />
      </View>
      <View
        style={{
          flexDirection: "row",
          marginTop: 6,
          padding: 6,
          borderWidth: 1,
          borderColor,
          gap: 16,
        }}
      >
        <Text style={{ fontSize: 9 }}>Tough: {tough}</Text>
        <Text style={{ fontSize: 9 }}>Quick: {quick}</Text>
        <Text style={{ fontSize: 9 }}>Mind: {mind}</Text>
      </View>
    </View>
  );
}
