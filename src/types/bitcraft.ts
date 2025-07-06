// Type definitions for Bitcraft game data

export interface ItemDesc {
    id: number;
    name: string;
    tier?: number;
    description?: string;
    icon?: string;
    stack_size?: number;
    type?: string;
    category?: string;
    rarity?: string;
    [key: string]: any;
}

export interface ItemStack {
    id: string;
    count: number;
}

export interface CraftingRecipe {
    id: string;
    name?: string;
    description?: string;
    crafted_item_stacks: [string, number][];
    required_item_stacks?: [string, number][];
    required_items?: ItemStack[];
    required_skills?: string[];
    crafting_time?: number;
    tier?: number;
    building_type?: string;
    [key: string]: any;
}

export interface ItemConversionRecipe {
    id: string;
    output_item_id?: string;
    output_items?: Array<{ id: string; count?: number }>;
    output?: { id: string; count?: number };
    input_items?: ItemStack[];
    conversion_rate?: number;
    tier?: number;
    [key: string]: any;
}

export interface ItemListDesc {
    id: string;
    items: string[];
    name?: string;
    description?: string;
    [key: string]: any;
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
