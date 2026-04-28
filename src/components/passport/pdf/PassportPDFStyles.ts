import { StyleSheet } from "@react-pdf/renderer";

export const borderColor = "#333";
export const mutedColor = "#555";

export const styles = StyleSheet.create({
  page: {
    padding: 24,
    fontFamily: "Helvetica",
    fontSize: 9,
    color: "#000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  emblem: {
    width: 48,
    height: 48,
    borderWidth: 1,
    borderColor,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  titleRow: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
  interphaze: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1,
  },
  passportLabel: {
    fontSize: 10,
    marginTop: 2,
  },
  characterName: {
    fontSize: 18,
    fontFamily: "Times-Italic",
    marginTop: 4,
    textAlign: "left",
  },
  characterTitle: {
    fontSize: 11,
    fontFamily: "Times-Italic",
    textAlign: "left",
    marginTop: 2,
  },
  playerName: {
    fontSize: 9,
    fontFamily: "Times-Roman",
    textAlign: "left",
    marginTop: 4,
    color: mutedColor,
  },
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },
  bordered: {
    borderWidth: 1,
    borderColor,
    padding: 6,
  },
  row: {
    flexDirection: "row",
  },
  dailyBox: {
    borderWidth: 1,
    borderColor,
    padding: 6,
    marginBottom: 6,
  },
  statBox: {
    borderWidth: 1,
    borderColor,
    padding: 6,
    marginBottom: 6,
    minWidth: 80,
  },
  statLabel: {
    fontSize: 8,
    color: mutedColor,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
  },
  table: {
    borderWidth: 1,
    borderColor,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: borderColor,
    padding: 4,
    minHeight: 20,
  },
  tableCell: {
    flex: 1,
    fontSize: 8,
  },
  card: {
    borderWidth: 1,
    borderColor,
    padding: 8,
    margin: 4,
    width: "48%",
    minHeight: 140,
  },
  cardRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
  },
  cardTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: borderColor,
    paddingBottom: 4,
  },
  cardContent: {
    fontSize: 8,
    color: mutedColor,
  },
  qrContainer: {
    position: "absolute",
    top: 24,
    right: 24,
    width: 48,
    height: 48,
  },
  bubble: {
    width: 6,
    height: 6,
    borderRadius: 3,
    borderWidth: 1,
    borderColor,
    marginRight: 1,
    marginBottom: 1,
  },
  bubbleRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
});
