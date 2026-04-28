import { View, Text } from "@react-pdf/renderer";
import { styles } from "../PassportPDFStyles";

type Skill = {
  title?: string;
  descriptionShort?: string;
  tier?: number;
  epCost?: unknown;
  permenentEpReduction?: unknown;
};

function formatEpDisplay(skill: Skill): string | null {
  const red = Number(skill?.permenentEpReduction);
  if (Number.isFinite(red) && red > 0) return `Permanent EP -${red}`;
  const ep = skill?.epCost;
  if (ep === "Level" || String(ep).toLowerCase() === "level") return "EP=Level";
  const cost = Number(ep);
  if (Number.isFinite(cost) && cost > 0) return `${cost} EP`;
  return null;
}

function ClassTable({
  title,
  skills,
}: {
  title: string;
  skills: Skill[];
}) {
  return (
    <View style={[styles.table, { flex: 1, marginBottom: 8 }]}>
      <View style={[styles.tableRow, { backgroundColor: "#e8e8e8" }]}>
        <Text style={[styles.tableCell, { fontFamily: "Helvetica-Bold", flex: 1 }]}>
          {title}
        </Text>
      </View>
      {skills.length === 0 ? (
        <View style={styles.tableRow}>
          <Text style={[styles.tableCell, { color: "#999" }]}>—</Text>
        </View>
      ) : (
        skills.map((skill, i) => {
          const epStr = formatEpDisplay(skill);
          const label = epStr ?? "Included";
          return (
            <View
              key={i}
              style={[
                styles.tableRow,
                { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
              ]}
            >
              <Text style={[styles.tableCell, { flex: 1 }]}>
                {skill.title || "—"}
                {skill.tier != null ? ` (Tier ${skill.tier})` : ""}
                {skill.descriptionShort
                  ? `: ${String(skill.descriptionShort).slice(0, 70)}${String(skill.descriptionShort).length > 70 ? "…" : ""}`
                  : ""}
              </Text>
              <Text style={[styles.tableCell, { width: 50, textAlign: "right", flexShrink: 0 }]}>
                {label}
              </Text>
            </View>
          );
        })
      )}
    </View>
  );
}

type ClassSkillsSectionProps = {
  character: any;
  variant: "primary" | "secondary";
};

export function ClassSkillsSection({ character, variant }: ClassSkillsSectionProps) {
  const skills =
    variant === "primary"
      ? Array.isArray(character.primarySkills)
        ? character.primarySkills
        : []
      : Array.isArray(character.secondarySkills)
        ? character.secondarySkills
        : [];
  const primaryTitle = `${character.primaryClass?.Title ?? "Primary"} Level ${character.primaryClassLvl ?? 0}`;
  const secondaryTitle =
    character.secondaryClass &&
    !String(character.secondaryClass?.Title || "").toLowerCase().includes("none")
      ? `${character.secondaryClass.Title} Level ${character.secondaryClassLvl ?? 0}`
      : "Secondary Class";
  const title = variant === "primary" ? `Primary Class: ${primaryTitle}` : `Secondary Class: ${secondaryTitle}`;

  return <ClassTable title={title} skills={skills} />;
}
