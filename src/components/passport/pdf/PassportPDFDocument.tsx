import { Document, Page, View, Image } from "@react-pdf/renderer";
import { styles } from "./PassportPDFStyles";
import { TopHalfSection } from "./sections/TopHalfSection";
import { ClassSkillsSection } from "./sections/ClassSkillsSection";
import { RacialTraitsSection } from "./sections/RacialTraitsSection";
import { DingusSection } from "./sections/DingusSection";
import { AlignmentSection } from "./sections/AlignmentSection";
import { SpellCardsPage } from "./sections/SpellCardsPage";
import { ItemCardsPage } from "./sections/ItemCardsPage";

export type PassportExportScope = {
  main: boolean;
  spells: boolean;
  items: boolean;
};

type PassportPDFDocumentProps = {
  character: any;
  playerName?: string | null;
  scope: PassportExportScope;
  qrDataUrl?: string | null;
};

export function PassportPDFDocument({
  character,
  playerName,
  scope,
  qrDataUrl,
}: PassportPDFDocumentProps) {
  const characterTitle =
    character.notes && typeof character.notes === "object" && character.notes.title
      ? String(character.notes.title)
      : null;

  const spells = Array.isArray(character.spells) ? character.spells : [];
  const items = Array.isArray(character.inventory) ? character.inventory : [];

  const showMain = scope.main || (!scope.spells && !scope.items);
  const mainPages = showMain ? (
    <>
      <Page size="A4" orientation="landscape" style={styles.page}>
        {qrDataUrl && (
          <View style={styles.qrContainer}>
            <Image src={qrDataUrl} style={{ width: 48, height: 48 }} />
          </View>
        )}
        <View wrap={false} style={{ flexDirection: "column", flex: 1 }}>
          <TopHalfSection
            character={character}
            characterTitle={characterTitle}
            playerName={playerName}
          />
        </View>
      </Page>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={{ flexDirection: "row", flex: 1, gap: 12 }}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <ClassSkillsSection character={character} variant="primary" />
            <RacialTraitsSection character={character} />
            <AlignmentSection character={character} />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <ClassSkillsSection character={character} variant="secondary" />
            <DingusSection character={character} />
          </View>
        </View>
      </Page>
    </>
  ) : null;

  const spellPages = scope.spells && spells.length > 0 ? (
    <SpellCardsPage spells={spells} characterName={character.name} />
  ) : null;

  const itemPages = scope.items && items.length > 0 ? (
    <ItemCardsPage items={items} characterName={character.name} />
  ) : null;

  return (
    <Document>
      {mainPages}
      {spellPages}
      {itemPages}
    </Document>
  );
}
