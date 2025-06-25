import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CharacterAttributesCardProps {
  character: any;
}

export function CharacterAttributesCard({
  character,
}: CharacterAttributesCardProps) {
  // Check if there are attributes to display (excluding race)
  const hasAttributes =
    character.Attributes &&
    Object.entries(character.Attributes as Record<string, any>).filter(
      ([key]) => key.toLowerCase() !== "race"
    ).length > 0;

  if (!hasAttributes) {
    return null;
  }

  return (
    <Card className="shadow-sm mt-4">
      <CardHeader className="p-1 sm:p-2">
        <CardTitle className="text-base">Additional Attributes</CardTitle>
      </CardHeader>
      <CardContent className="p-1 sm:p-2">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {Object.entries(character.Attributes as Record<string, any>)
            .filter(([key]) => key.toLowerCase() !== "race")
            .map(([key, value]) => (
              <div
                key={key}
                className="flex items-center justify-between bg-background border rounded-lg p-2"
              >
                <span className="text-sm capitalize">{key}</span>
                <span className="text-lg font-semibold">{value}</span>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
