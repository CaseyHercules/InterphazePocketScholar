import { View, Text } from "@react-pdf/renderer";
import { styles } from "../PassportPDFStyles";

type HeaderSectionProps = {
  characterName: string;
  characterTitle?: string | null;
  playerName?: string | null;
};

export function HeaderSection({
  characterName,
  characterTitle,
  playerName,
}: HeaderSectionProps) {
  return (
    <View style={{ marginBottom: 8 }}>
      <View style={styles.header}>
        <View style={styles.emblem}>
          <Text style={{ fontSize: 10 }}>◇</Text>
        </View>
        <View style={styles.titleRow}>
          <Text style={[styles.interphaze, { fontFamily: "Times-Bold", letterSpacing: 1 }]}>
            INTERPHAZE
          </Text>
          <Text style={styles.passportLabel}>Passport</Text>
        </View>
      </View>
      <Text style={styles.characterName}>{characterName}</Text>
      {characterTitle && (
        <Text style={styles.characterTitle}>{characterTitle}</Text>
      )}
      {playerName && (
        <Text style={styles.playerName}>{playerName}</Text>
      )}
    </View>
  );
}
