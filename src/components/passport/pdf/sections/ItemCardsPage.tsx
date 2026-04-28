import { Page, View, Text } from "@react-pdf/renderer";
import { styles } from "../PassportPDFStyles";

type Item = { id: string; title?: string; type?: string; quantity?: number; description?: string; data?: Record<string, unknown> };

function ItemCard({ item }: { item: Item }) {
  const desc = item.description ?? (item.data && typeof (item.data as any).description === "string" ? (item.data as any).description : "");
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>
        {item.title || "—"}
        {item.quantity != null && item.quantity !== 1 ? ` (x${item.quantity})` : ""}
      </Text>
      {item.type && (
        <Text style={[styles.cardContent, { marginBottom: 4 }]}>Type: {item.type}</Text>
      )}
      {desc && (
        <Text style={[styles.cardContent, { fontSize: 7 }]}>
          {String(desc).slice(0, 250)}
          {String(desc).length > 250 ? "…" : ""}
        </Text>
      )}
    </View>
  );
}

export function ItemCardsPage({
  items,
  characterName,
}: {
  items: Item[];
  characterName: string;
}) {
  const cardsPerPage = 4;
  const pages: Item[][] = [];
  for (let i = 0; i < items.length; i += cardsPerPage) {
    pages.push(items.slice(i, i + cardsPerPage));
  }

  if (pages.length === 0) return null;

  return (
    <>
      {pages.map((pageItems, pageIdx) => (
        <Page key={pageIdx} size="A4" style={styles.page}>
          <Text style={{ fontSize: 10, marginBottom: 8 }}>{characterName} — Item Cards</Text>
          <View style={{ flexDirection: "column" }}>
            {[0, 2].map((rowStart) => (
              <View key={rowStart} style={{ flexDirection: "row", width: "100%", minHeight: 180 }}>
                {pageItems.slice(rowStart, rowStart + 2).map((item) => (
                  <View key={item.id} style={{ width: "50%", padding: 4 }}>
                    <ItemCard item={item} />
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
