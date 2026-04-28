import { Page, View, Text } from "@react-pdf/renderer";
import { styles } from "../PassportPDFStyles";

type Spell = { id: string; title?: string; level?: number; description?: string; type?: string; data?: { descriptor?: string[] } };

function SpellCard({ spell }: { spell: Spell }) {
  const descriptors = Array.isArray(spell?.data?.descriptor) ? spell.data.descriptor : [];
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>
        {spell.title || "—"} {spell.level != null ? `(Lv. ${spell.level})` : ""}
      </Text>
      {spell.description && (
        <Text style={[styles.cardContent, { marginBottom: 4 }]}>
          {String(spell.description).slice(0, 300)}
          {String(spell.description).length > 300 ? "…" : ""}
        </Text>
      )}
      {spell.type && (
        <Text style={[styles.cardContent, { fontSize: 7 }]}>Type: {spell.type}</Text>
      )}
      {descriptors.length > 0 && (
        <Text style={[styles.cardContent, { fontSize: 7, marginTop: 2 }]}>
          {descriptors.join(", ")}
        </Text>
      )}
    </View>
  );
}

export function SpellCardsPage({
  spells,
  characterName,
}: {
  spells: Spell[];
  characterName: string;
}) {
  const cardsPerPage = 4;
  const pages: Spell[][] = [];
  for (let i = 0; i < spells.length; i += cardsPerPage) {
    pages.push(spells.slice(i, i + cardsPerPage));
  }

  if (pages.length === 0) return null;

  return (
    <>
      {pages.map((pageSpells, pageIdx) => (
        <Page key={pageIdx} size="A4" style={styles.page}>
          <Text style={{ fontSize: 10, marginBottom: 8 }}>{characterName} — Spell Cards</Text>
          <View style={{ flexDirection: "column" }}>
            {[0, 2].map((rowStart) => (
              <View key={rowStart} style={{ flexDirection: "row", width: "100%", minHeight: 180 }}>
                {pageSpells.slice(rowStart, rowStart + 2).map((spell) => (
                  <View key={spell.id} style={{ width: "50%", padding: 4 }}>
                    <SpellCard spell={spell} />
                  </View>
                ))}
              </View>
            ))}
          </View>
        </Page>
      ))}
    </>
  );
}
