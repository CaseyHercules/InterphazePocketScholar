"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Plus, Search, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Item {
  id: string;
  title: string;
  description?: string;
  type?: string;
}

interface EventItem extends Item {
  quantity: number;
}

interface ItemSelectorProps {
  eventId: string;
  onSave: (items: { itemId: string; quantity: number }[]) => Promise<boolean>;
  initialItems: EventItem[];
  availableItems: Item[];
}

export function ItemSelector({
  eventId,
  onSave,
  initialItems,
  availableItems,
}: ItemSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [addingItems, setAddingItems] = useState<Set<string>>(new Set());

  // Filter items by search query and ensure uniqueness by ID
  const filteredItems = availableItems
    .filter(
      (item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description &&
          item.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .filter(
      (item, index, self) => index === self.findIndex((t) => t.id === item.id)
    );

  const handleAddItem = async (item: Item) => {
    setAddingItems((prev) => new Set(prev).add(item.id));

    try {
      // Find existing item and increment quantity, or add new one
      const existingItemIndex = initialItems.findIndex((i) => i.id === item.id);
      let updatedItems;

      if (existingItemIndex >= 0) {
        // Increment existing item quantity
        updatedItems = initialItems.map((i, index) =>
          index === existingItemIndex
            ? { ...i, quantity: i.quantity + 1 }
            : { ...i, quantity: i.quantity }
        );
      } else {
        // Add new item
        updatedItems = [
          ...initialItems.map((i) => ({ ...i, quantity: i.quantity })),
          { ...item, quantity: 1 },
        ];
      }

      const success = await onSave(
        updatedItems.map((item) => ({
          itemId: item.id,
          quantity: item.quantity,
        }))
      );

      if (success) {
        toast({
          title: "Success",
          description: `Added ${item.title} to event`,
        });
      } else {
        throw new Error("Failed to save item");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item",
        variant: "destructive",
      });
    } finally {
      setAddingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(item.id);
        return newSet;
      });
    }
  };

  // Calculate how many of each item are in the list
  const getItemCount = (itemId: string): number => {
    const existingItem = initialItems.find((item) => item.id === itemId);
    return existingItem ? existingItem.quantity : 0;
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>

        <div className="grid gap-4 max-h-[400px] overflow-y-auto p-1">
          {filteredItems.length > 0 ? (
            filteredItems.map((item: Item) => {
              const itemCount = getItemCount(item.id);
              const isAdding = addingItems.has(item.id);

              return (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{item.title}</h4>
                        {item.description && (
                          <p className="text-sm text-muted-foreground">
                            {item.description}
                          </p>
                        )}
                        <div className="flex gap-2 mt-1">
                          {item.type && (
                            <Badge variant="secondary">{item.type}</Badge>
                          )}
                          {itemCount > 0 && (
                            <Badge variant="outline">
                              {itemCount} in event
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleAddItem(item)}
                        disabled={isAdding}
                      >
                        {isAdding ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Plus className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              {searchQuery
                ? "No items matching your search"
                : "No items available"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
