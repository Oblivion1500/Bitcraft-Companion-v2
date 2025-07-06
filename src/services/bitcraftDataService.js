// src/services/bitcraftDataService.js
// Service to fetch Bitcraft item, recipe, and resource data from GitHub

const BASE_URL = 'https://raw.githubusercontent.com/BitCraftToolBox/BitCraft_GameData/refs/heads/main/server/region';

const endpoints = {
  item_desc: `${BASE_URL}/item_desc.json`,
  item_conversion_recipe_desc: `${BASE_URL}/item_conversion_recipe_desc.json`,
  item_list_desc: `${BASE_URL}/item_list_desc.json`,
  crafting_recipe_desc: `${BASE_URL}/crafting_recipe_desc.json`,
};

export async function fetchBitcraftData(type) {
  if (!endpoints[type]) throw new Error('Invalid data type');
  const response = await fetch(endpoints[type]);
  if (!response.ok) throw new Error(`Failed to fetch ${type}`);
  return response.json();
}

export async function fetchAllBitcraftData() {
  const [item_desc, item_conversion_recipe_desc, item_list_desc, crafting_recipe_desc] = await Promise.all([
    fetchBitcraftData('item_desc'),
    fetchBitcraftData('item_conversion_recipe_desc'),
    fetchBitcraftData('item_list_desc'),
    fetchBitcraftData('crafting_recipe_desc'),
  ]);
  return { item_desc, item_conversion_recipe_desc, item_list_desc, crafting_recipe_desc };
}

// Helper to ensure we always get the recipe array
function getRecipeArray(input) {
  if (Array.isArray(input)) return input;
  if (input && Array.isArray(input.crafting_recipe_desc)) {
    console.warn('WARNING: Passed object instead of array, using .crafting_recipe_desc property.');
    return input.crafting_recipe_desc;
  }
  console.warn('WARNING: craftingRecipes is not an array and has no .crafting_recipe_desc property:', input);
  return [];
}

// Find all recipes that produce a given itemId (type-safe, robust)
export function findRecipesThatProduce(itemId, craftingRecipes) {
  const recipesArr = getRecipeArray(craftingRecipes);
  return recipesArr.filter(recipe =>
    Array.isArray(recipe.crafted_item_stacks) &&
    recipe.crafted_item_stacks.some(stack => String(stack[0]) === String(itemId))
  );
}

// Find all recipes that consume a given itemId (type-safe, robust)
export function findRecipesThatConsume(itemId, craftingRecipes) {
  const recipesArr = getRecipeArray(craftingRecipes);
  return recipesArr.filter(recipe =>
    Array.isArray(recipe.consumed_item_stacks) &&
    recipe.consumed_item_stacks.some(stack => String(stack[0]) === String(itemId))
  );
}

// Debug utility: logs info and finds recipes that produce a given itemId
export function debugFindRecipesThatProduce(itemId, craftingRecipes) {
  const recipesArr = getRecipeArray(craftingRecipes);
  console.log('DEBUG: craftingRecipes type:', typeof craftingRecipes, Array.isArray(craftingRecipes));
  console.log('DEBUG: craftingRecipes sample:', recipesArr && recipesArr.length > 0 ? recipesArr[0] : recipesArr);
  console.log('DEBUG: itemId:', itemId, typeof itemId);
  const recipes = findRecipesThatProduce(itemId, recipesArr);
  console.log('DEBUG: Recipes found for itemId', itemId, recipes);
  return recipes;
}
