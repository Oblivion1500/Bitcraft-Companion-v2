// Service to fetch Bitcraft item, recipe, and resource data from GitHub
import type {
  ItemDesc,
  ItemConversionRecipe,
  ItemListDesc,
  CraftingRecipe,
} from "@/types/bitcraft";

const BASE_URL =
  "https://raw.githubusercontent.com/BitCraftToolBox/BitCraft_GameData/refs/heads/main/server/region";

type DataType =
  | "item_desc"
  | "item_conversion_recipe_desc"
  | "item_list_desc"
  | "crafting_recipe_desc";

const endpoints: Record<DataType, string> = {
  item_desc: `${BASE_URL}/item_desc.json`,
  item_conversion_recipe_desc: `${BASE_URL}/item_conversion_recipe_desc.json`,
  item_list_desc: `${BASE_URL}/item_list_desc.json`,
  crafting_recipe_desc: `${BASE_URL}/crafting_recipe_desc.json`,
};

export async function fetchBitcraftData<T>(type: DataType): Promise<T[]> {
  if (!endpoints[type]) throw new Error("Invalid data type");
  const response = await fetch(endpoints[type]);
  if (!response.ok) throw new Error(`Failed to fetch ${type}`);
  const res = await response.json();
  return Array.isArray(res) ? res : (Object.values(res) as T[]);
}

export async function fetchAllBitcraftData() {
  const [
    item_desc,
    item_conversion_recipe_desc,
    item_list_desc,
    crafting_recipe_desc,
  ] = await Promise.all([
    fetchBitcraftData<ItemDesc>("item_desc"),
    fetchBitcraftData<ItemConversionRecipe>("item_conversion_recipe_desc"),
    fetchBitcraftData<ItemListDesc>("item_list_desc"),
    fetchBitcraftData<CraftingRecipe>("crafting_recipe_desc"),
  ]);
  return {
    item_desc,
    item_conversion_recipe_desc,
    item_list_desc,
    crafting_recipe_desc,
  };
}

// Helper to ensure we always get the recipe array
function getRecipeArray(input: any): CraftingRecipe[] {
  if (Array.isArray(input)) return input;
  if (input && Array.isArray(input.crafting_recipe_desc)) {
    console.warn(
      "WARNING: Passed object instead of array, using .crafting_recipe_desc property."
    );
    return input.crafting_recipe_desc;
  }
  console.warn(
    "WARNING: craftingRecipes is not an array and has no .crafting_recipe_desc property:",
    input
  );
  return [];
}

// Find all recipes that produce a given itemId (type-safe, robust)
export function findRecipesThatProduce(
  itemId: number,
  craftingRecipes: CraftingRecipe[]
): CraftingRecipe[] {
  const recipesArr = getRecipeArray(craftingRecipes);
  return recipesArr.filter(
    (recipe) =>
      Array.isArray(recipe.crafted_item_stacks) &&
      recipe.crafted_item_stacks.some((stack) => stack[0] === itemId)
  );
}

// Find all recipes that consume a given itemId (type-safe, robust)
export function findRecipesThatConsume(
  itemId: number,
  craftingRecipes: CraftingRecipe[]
): CraftingRecipe[] {
  const recipesArr = getRecipeArray(craftingRecipes);
  return recipesArr.filter(
    (recipe) =>
      Array.isArray((recipe as any).consumed_item_stacks) &&
      (recipe as any).consumed_item_stacks.some(
        (stack: [number, number]) => stack[0] === itemId
      )
  );
}

// Debug utility: logs info and finds recipes that produce a given itemId
export function debugFindRecipesThatProduce(
  itemId: number,
  craftingRecipes: CraftingRecipe[]
): CraftingRecipe[] {
  const recipesArr = getRecipeArray(craftingRecipes);
  console.log(
    "DEBUG: craftingRecipes type:",
    typeof craftingRecipes,
    Array.isArray(craftingRecipes)
  );
  console.log(
    "DEBUG: craftingRecipes sample:",
    recipesArr && recipesArr.length > 0 ? recipesArr[0] : recipesArr
  );
  console.log("DEBUG: itemId:", itemId, typeof itemId);
  const recipes = findRecipesThatProduce(itemId, recipesArr);
  console.log("DEBUG: Recipes found for itemId", itemId, recipes);
  return recipes;
}
