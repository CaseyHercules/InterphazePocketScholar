import { View } from "@react-pdf/renderer";
import { getEPAvailableValues } from "@/lib/utils/character-stats";
import { DailyTrackingSection } from "./DailyTrackingSection";
import { RightColumnTopSection } from "./RightColumnTopSection";

type TopHalfSectionProps = {
  character: any;
  characterTitle?: string | null;
  playerName?: string | null;
};

export function TopHalfSection({
  character,
  characterTitle,
  playerName,
}: TopHalfSectionProps) {
  const epValues = getEPAvailableValues(character);
  const primaryTitle = character.primaryClass?.Title ?? "";
  const secondaryTitle =
    character.secondaryClass &&
    !String(character.secondaryClass?.Title || "").toLowerCase().includes("none")
      ? character.secondaryClass.Title
      : null;

  return (
    <View style={{ flexDirection: "row", flex: 1, marginBottom: 12, gap: 12 }}>
      <DailyTrackingSection
        primaryClassTitle={primaryTitle}
        primaryEP={epValues.primary}
        secondaryClassTitle={secondaryTitle}
        secondaryEP={epValues.secondary}
      />
      <RightColumnTopSection
        character={character}
        characterTitle={characterTitle}
        playerName={playerName}
      />
    </View>
  );
}
