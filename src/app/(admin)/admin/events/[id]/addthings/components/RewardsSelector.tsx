"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Plus, Minus, Trash2, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Reward {
  id: string;
  name: string;
  description: string;
  type: "ITEM" | "SPELL" | "GOLD" | "XP" | "OTHER";
  value: string;
  quantity: number;
}

interface RewardsSelectorProps {
  eventId: string;
  onSave: (rewardList: Reward[]) => Promise<boolean>;
  initialRewards: Reward[];
}

export function RewardsSelector({
  eventId: _eventId,
  onSave,
  initialRewards,
}: RewardsSelectorProps) {
  const [rewards, setRewards] = useState<Reward[]>(initialRewards);
  const [newReward, setNewReward] = useState<Partial<Reward>>({
    name: "",
    description: "",
    type: "OTHER",
    value: "",
    quantity: 1,
  });
  const [isPending, setIsPending] = useState(false);

  const handleAddReward = () => {
    if (!newReward.name) {
      toast({
        title: "Error",
        description: "Reward name is required",
        variant: "destructive",
      });
      return;
    }

    const reward: Reward = {
      id: Math.random().toString(36).substr(2, 9),
      name: newReward.name,
      description: newReward.description || "",
      type: newReward.type || "OTHER",
      value: newReward.value || "",
      quantity: newReward.quantity || 1,
    };

    setRewards([...rewards, reward]);
    setNewReward({
      name: "",
      description: "",
      type: "OTHER",
      value: "",
      quantity: 1,
    });

    toast({
      title: "Success",
      description: `Added ${reward.name} to event`,
    });
  };

  const handleRemoveReward = (id: string) => {
    setRewards(rewards.filter((reward) => reward.id !== id));
  };

  const handleUpdateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemoveReward(id);
      return;
    }

    const updatedRewards = rewards.map((reward) =>
      reward.id === id ? { ...reward, quantity: newQuantity } : reward
    );

    setRewards(updatedRewards);
  };

  const handleSave = async () => {
    setIsPending(true);
    try {
      const success = await onSave(rewards);

      if (success) {
        toast({
          title: "Success",
          description: "Rewards saved successfully",
        });
      } else {
        throw new Error("Failed to save rewards");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save rewards",
        variant: "destructive",
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Reward Name</Label>
          <Input
            id="name"
            value={newReward.name}
            onChange={(e) =>
              setNewReward({ ...newReward, name: e.target.value })
            }
            placeholder="Enter reward name"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={newReward.description}
            onChange={(e) =>
              setNewReward({ ...newReward, description: e.target.value })
            }
            placeholder="Enter reward description"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="type">Reward Type</Label>
          <Select
            value={newReward.type}
            onValueChange={(value: Reward["type"]) =>
              setNewReward({ ...newReward, type: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select reward type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ITEM">Item</SelectItem>
              <SelectItem value="SPELL">Spell</SelectItem>
              <SelectItem value="GOLD">Gold</SelectItem>
              <SelectItem value="XP">Experience Points</SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="value">Value</Label>
          <Input
            id="value"
            value={newReward.value}
            onChange={(e) =>
              setNewReward({ ...newReward, value: e.target.value })
            }
            placeholder="Enter reward value"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            type="number"
            min="1"
            value={newReward.quantity}
            onChange={(e) =>
              setNewReward({
                ...newReward,
                quantity: parseInt(e.target.value) || 1,
              })
            }
            placeholder="Enter quantity"
          />
        </div>

        <Button onClick={handleAddReward} className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Add Reward
        </Button>
      </div>

      {rewards.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Added Rewards</h3>
          <div className="grid gap-4">
            {rewards.map((reward) => (
              <Card key={reward.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{reward.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {reward.description}
                      </p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="default">{reward.type}</Badge>
                        <Badge variant="outline">x{reward.quantity}</Badge>
                        {reward.value && (
                          <Badge variant="secondary">
                            Value: {reward.value}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleRemoveReward(reward.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>

                      <div className="flex items-center gap-1 mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() =>
                            handleUpdateQuantity(reward.id, reward.quantity - 1)
                          }
                        >
                          <Minus className="h-3 w-3" />
                        </Button>

                        <span className="w-8 text-center text-sm font-medium">
                          {reward.quantity}
                        </span>

                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() =>
                            handleUpdateQuantity(reward.id, reward.quantity + 1)
                          }
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Button onClick={handleSave} disabled={isPending} className="w-full">
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Rewards"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
