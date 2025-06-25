import { Backpack } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

interface CharacterInventoryCardProps {
  character: any;
}

export function CharacterInventoryCard({
  character,
}: CharacterInventoryCardProps) {
  const hasItems = character.inventory.length > 0;

  return (
    <Card className="shadow-sm">
      <CardHeader className="p-3 sm:p-4">
        <CardTitle className="flex items-center text-base sm:text-lg">
          <Backpack className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
          Inventory
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Items carried by this character
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 pt-0">
        {hasItems ? (
          <div className="space-y-3">
            <div className="grid grid-cols-12 font-medium text-xs sm:text-sm border-b pb-2">
              <div className="col-span-6 sm:col-span-5">Name</div>
              <div className="col-span-3 hidden sm:block">Type</div>
              <div className="col-span-3 sm:col-span-2 text-right">Qty</div>
              <div className="col-span-3 sm:col-span-2 text-right">Actions</div>
            </div>
            <ScrollArea className="h-[250px] sm:h-[350px]">
              <div className="space-y-2">
                {character.inventory.map((item: any) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-12 items-center py-2 border-b last:border-0"
                  >
                    <div className="col-span-6 sm:col-span-5 font-medium text-sm">
                      {item.title}
                    </div>
                    <div className="hidden sm:block col-span-3 text-xs text-muted-foreground">
                      {item.type || "Misc"}
                    </div>
                    <div className="col-span-3 sm:col-span-2 text-right text-sm">
                      {item.quantity}
                    </div>
                    <div className="col-span-3 sm:col-span-2 text-right">
                      <Button variant="ghost" size="sm" className="h-7 text-xs">
                        Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            This character doesn&apos;t have any items yet.
          </p>
        )}
      </CardContent>
      <CardFooter className="p-3 sm:p-4 pt-0 flex justify-between">
        <p className="text-xs sm:text-sm text-muted-foreground">
          Total Items: {character.inventory.length}
        </p>
        <Button size="sm" className="h-7 text-xs" disabled>
          Add Item
        </Button>
      </CardFooter>
    </Card>
  );
}
