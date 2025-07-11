// Type definitions for Bitcraft game data

export interface ItemDesc {
  id: number;
  name: string;
  description: string | null;
  volume: number;
  durability: number;
  convert_to_on_durability_zero: number;
  secondary_knowledge_id: number;
  model_asset_name: string | null;
  icon_asset_name: string;
  tier: number;
  tag: string;
  rarity: [number, Record<string, unknown>];
  compendium_entry: boolean;
  item_list_id: number;
}

export interface CraftingRecipe {
  id: number;
  name: string;
  crafted_item_stacks: [number, number][];
  consumed_item_stacks: [number, number][];
  time_requirement: number;
  stamina_requirement: number;
  is_passive: boolean;
}

export interface ItemConversionRecipe {
  id: number;
  name: string;
  time_cost: number;
  stamina_cost: number;
  input_items?: Array<[number, number]>;
}

export interface ItemListDesc {
  id: string;
  name?: string;
}

export interface BitcraftGameData {
  item_desc: ItemDesc[];
  item_conversion_recipe_desc: ItemConversionRecipe[];
  item_list_desc: ItemListDesc[];
  crafting_recipe_desc: CraftingRecipe[];
}

export interface CraftingNode {
  id: string;
  name: string;
  quantity: number;
  children: CraftingNode[];
  recipe?: CraftingRecipe | ItemConversionRecipe;
  isBasicResource: boolean;
  tier?: number;
}

export interface ResourceRequirement {
  id: string;
  name: string;
  quantity: number;
  tier?: number;
}

export interface CraftingPlan {
  targetItem: string;
  targetQuantity: number;
  tree: CraftingNode;
  totalResources: ResourceRequirement[];
}
