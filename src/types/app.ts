// Additional type definitions for component state
import React from "react";
import type {
  ItemDesc,
  CraftingRecipe,
  ItemConversionRecipe,
  ItemListDesc,
} from "./bitcraft";
export interface PlanItem {
  itemId: number;
  quantity: number;
  name?: string;
}

export interface InventoryItem {
  itemId: number;
  have: number;
  name?: string;
}

export type FallbackSearch = (
  recipes: ItemConversionRecipe[],
  itemId: number
) => ItemConversionRecipe | undefined;

export interface CraftingPlannerProps {
  items: ItemDesc[];
  recipes: ItemConversionRecipe[];
  plan: PlanItem[];
  setPlan: React.Dispatch<React.SetStateAction<PlanItem[]>>;
  itemListDesc: ItemListDesc[];
  recipeMap: Map<number, CraftingRecipe> | null;
  fallbackRecipeSearch: FallbackSearch;
  inventory: InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleDownload: () => void;
  handleUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
