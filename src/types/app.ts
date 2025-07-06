// Additional type definitions for component state
import React from 'react';
import type { ItemDesc, CraftingRecipe, ItemConversionRecipe, ItemListDesc } from './bitcraft';
export interface PlanItem {
    itemId: string;
    quantity: number;
    name?: string;
}

export interface InventoryItem {
    itemId: string;
    have: number;
    name?: string;
}

export interface CraftingPlannerProps {
    items: ItemDesc[];
    recipes: (CraftingRecipe | ItemConversionRecipe)[];
    plan: PlanItem[];
    setPlan: React.Dispatch<React.SetStateAction<PlanItem[]>>;
    itemListDesc: ItemListDesc[];
    recipeMap: Map<string, CraftingRecipe | ItemConversionRecipe> | null;
    fallbackRecipeSearch: (recipes: (CraftingRecipe | ItemConversionRecipe)[], itemId: string) => CraftingRecipe | ItemConversionRecipe | undefined;
    inventory: InventoryItem[];
    setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
    fileInputRef: React.RefObject<HTMLInputElement>;
    handleDownload: () => void;
    handleUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
