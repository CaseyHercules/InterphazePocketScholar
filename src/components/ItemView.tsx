import { Item, ItemData } from "@/types/item";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ItemViewProps {
  item: Item;
  adjustmentTitle?: string;
}

export function ItemView({ item, adjustmentTitle }: ItemViewProps) {
  const data = item.data as ItemData | undefined;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <CardTitle className="text-2xl">{item.title}</CardTitle>
              {item.type && (
                <Badge variant="secondary">{item.type.replace(/_/g, " ")}</Badge>
              )}
            </div>
            <p className="text-muted-foreground mt-1">
              Quantity: {item.quantity ?? 1}
            </p>
            {item.description && <p className="mt-2">{item.description}</p>}
          </div>
          {adjustmentTitle && data?.adjustmentId && (
            <Badge variant="outline" className="shrink-0">
              Adjustment: {adjustmentTitle}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data?.weapon && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                Weapon Stats
              </h4>
              <dl className="grid grid-cols-2 gap-2 text-sm">
                {data.weapon.damage && (
                  <div>
                    <dt className="text-muted-foreground">Damage</dt>
                    <dd>{data.weapon.damage}</dd>
                  </div>
                )}
                {data.weapon.range && (
                  <div>
                    <dt className="text-muted-foreground">Range</dt>
                    <dd>{data.weapon.range}</dd>
                  </div>
                )}
                {data.weapon.properties && (
                  <div className="col-span-2">
                    <dt className="text-muted-foreground">Properties</dt>
                    <dd>{data.weapon.properties}</dd>
                  </div>
                )}
              </dl>
            </div>
          )}
          {data?.consumable && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                Consumable
              </h4>
              <dl className="space-y-2 text-sm">
                {data.consumable.effect && (
                  <div>
                    <dt className="text-muted-foreground">Effect</dt>
                    <dd>{data.consumable.effect}</dd>
                  </div>
                )}
                {data.consumable.uses != null && (
                  <div>
                    <dt className="text-muted-foreground">Uses</dt>
                    <dd>{data.consumable.uses}</dd>
                  </div>
                )}
              </dl>
            </div>
          )}
          {data?.magicItem &&
            Object.keys(data.magicItem).length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">
                  Magic Item
                </h4>
                <dl className="space-y-2 text-sm">
                  {Object.entries(data.magicItem).map(([key, value]) => (
                    <div key={key}>
                      <dt className="text-muted-foreground capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          {data?.incarnateItem &&
            Object.keys(data.incarnateItem).length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">
                  Incarnate Item
                </h4>
                <dl className="space-y-2 text-sm">
                  {Object.entries(data.incarnateItem).map(([key, value]) => (
                    <div key={key}>
                      <dt className="text-muted-foreground capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
