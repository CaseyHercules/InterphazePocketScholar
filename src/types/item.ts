export const ITEM_TYPES = [
  "WEAPON",
  "ARMOR",
  "CONSUMABLE",
  "MISC",
  "MAGIC_ITEM",
  "INCARNATE_ITEM",
] as const;

export interface ItemWeaponData {
  damage?: string;
  range?: string;
  properties?: string;
}

export interface ItemConsumableData {
  effect?: string;
  uses?: number;
}

export interface ItemData {
  adjustmentId?: string;
  weapon?: ItemWeaponData;
  consumable?: ItemConsumableData;
  magicItem?: Record<string, string>;
  incarnateItem?: Record<string, string>;
}

export interface Item {
  id?: string;
  title: string;
  description?: string | null;
  type?: string | null;
  quantity: number;
  data?: ItemData | null;
  archived?: boolean;
  visibilityRoles?: string[];
  characterId?: string | null;
}

export interface CreateItemInput {
  title: string;
  description?: string;
  type?: string;
  quantity?: number;
  data?: ItemData;
  visibilityRoles?: string[];
}

export interface UpdateItemInput extends Partial<CreateItemInput> {
  id: string;
}
