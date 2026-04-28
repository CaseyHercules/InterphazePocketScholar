import { View, Text } from "@react-pdf/renderer";
import { styles, borderColor } from "../PassportPDFStyles";
import { parseAlignmentFromJson, ALIGNMENT_MAX_TICKS } from "@/types/alignment";

type AlignmentSectionProps = {
  character: any;
};

export function AlignmentSection({ character }: AlignmentSectionProps) {
  const alignment = parseAlignmentFromJson(character.alignmentJson);
  const alignmentStr = alignment
    ? (() => {
        const [, upTicks, downTicks] = alignment;
        const upStr = Array.from({ length: ALIGNMENT_MAX_TICKS }, (_, i) =>
          i >= ALIGNMENT_MAX_TICKS - upTicks ? "X" : "O"
        ).join("");
        const downStr = Array.from({ length: ALIGNMENT_MAX_TICKS }, (_, i) =>
          i < downTicks ? "X" : "O"
        ).join("");
        return `Alignment: ${upStr} | ${alignment[0]} | ${downStr}`;
      })()
    : null;

  return (
    <View
      style={{
        borderWidth: 1,
        borderColor,
        padding: 6,
        marginTop: 8,
      }}
    >
      <Text style={{ fontSize: 9, fontFamily: "Courier" }}>
        {alignmentStr ?? "Alignment: —"}
      </Text>
    </View>
  );
}
