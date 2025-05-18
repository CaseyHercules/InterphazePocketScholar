import { Spell } from "@/types/spell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toRomanNumeral } from "@/lib/utils/roman-numerals";

interface SpellViewProps {
  spell: Spell;
}

export function SpellView({ spell }: SpellViewProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <CardTitle className="text-2xl">{spell.title}</CardTitle>
              {spell.data?.isInSpellLibrary && (
                <Badge
                  variant="outline"
                  className="bg-green-100 dark:bg-green-900/20"
                >
                  Public
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground mt-1 font-semibold">
              {spell.type} Level {toRomanNumeral(spell.level)}
            </p>
            {spell.description && <p className="mt-2">{spell.description}</p>}
          </div>
          {spell.data?.descriptor && spell.data.descriptor.length > 0 && (
            <div className="flex gap-2">
              {spell.data.descriptor.map((desc) => (
                <Badge key={desc} variant="secondary">
                  {desc}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <dl className="space-y-2">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                Casting Time
              </dt>
              <dd>{spell.data?.castingTime || "—"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                Range
              </dt>
              <dd>{spell.data?.range || "—"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                Area of Effect
              </dt>
              <dd>{spell.data?.areaOfEffect || "—"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                Duration
              </dt>
              <dd>{spell.data?.duration || "—"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                Save
              </dt>
              <dd>{spell.data?.save || "—"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                Effect
              </dt>
              <dd className="whitespace-pre-wrap">
                {spell.data?.effect || "—"}
              </dd>
            </div>
            {spell.data?.method && (
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Method
                </dt>
                <dd className="whitespace-pre-wrap">{spell.data.method}</dd>
              </div>
            )}
          </dl>
        </div>
      </CardContent>
    </Card>
  );
}
