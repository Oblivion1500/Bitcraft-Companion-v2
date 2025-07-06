import React, { useEffect, useState, useRef } from "react";
import "./index.css"; // Use Tailwind and theme
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ItemList from "@/components/ItemList";
import CraftingPlanner from "@/components/CraftingPlanner";
import ResourceTracker from "@/components/ResourceTracker";
import { fetchAllBitcraftData } from "@/services/bitcraftDataService";
import type {
  BitcraftGameData,
  CraftingRecipe,
  ItemConversionRecipe,
} from "@/types/bitcraft";
import type { PlanItem, InventoryItem } from "@/types/app";

function buildCraftingRecipeMap(craftingRecipes: CraftingRecipe[]) {
  const map = new Map<string, CraftingRecipe>();
  // NEW: Support crafted_item_stacks (Bitcraft crafting_recipe_desc)
  for (const r of craftingRecipes) {
    if (Array.isArray(r.crafted_item_stacks)) {
      for (const stack of r.crafted_item_stacks) {
        if (stack && stack.length > 0) map.set(String(stack[0]), r);
      }
    }
  }
  return map;
}

function findRecipeFallback(recipes: ItemConversionRecipe[], itemId: number) {
  return recipes.find((r) => {
    const inputIds = r.input_items?.map((tuple) => tuple[0]);
    return r.id === itemId || inputIds?.includes(itemId);
  });
}

function App() {
  const [data, setData] = useState<BitcraftGameData>({
    item_desc: [],
    item_conversion_recipe_desc: [],
    item_list_desc: [],
    crafting_recipe_desc: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recipeMap, setRecipeMap] = useState<Map<
    string,
    CraftingRecipe
  > | null>(null);
  const [firstRenderDone, setFirstRenderDone] = useState(false);

  // State for crafting planner and inventory
  const [plan, setPlan] = useState<PlanItem[]>(() => {
    try {
      const saved = localStorage.getItem("bitcraft-plan");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    try {
      const saved = localStorage.getItem("bitcraft-inventory");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem("bitcraft-plan", JSON.stringify(plan));
  }, [plan]);
  useEffect(() => {
    localStorage.setItem("bitcraft-inventory", JSON.stringify(inventory));
  }, [inventory]);

  // Download/upload refs
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Download JSON
  const handleDownload = () => {
    const data = { plan, inventory };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bitcraft_save.json";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };

  // Upload JSON
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const result = evt.target?.result;
        if (typeof result === "string") {
          const data = JSON.parse(result);
          if (Array.isArray(data.plan)) setPlan(data.plan);
          if (Array.isArray(data.inventory)) setInventory(data.inventory);
        }
      } catch (err) {
        alert("Invalid JSON file.");
      }
    };
    reader.readAsText(file);
  };

  useEffect(() => {
    setLoading(true);
    fetchAllBitcraftData()
      .then((loadedData) => {
        setData(loadedData);
        const craftingRecipeMap = buildCraftingRecipeMap(
          loadedData.crafting_recipe_desc
        );
        setRecipeMap(craftingRecipeMap);
        setTimeout(() => setLoading(false), 100);
      })
      .catch((err) =>
        setError(err.toString() + (err.stack ? `\n${err.stack}` : ""))
      );
  }, []);

  // Convert item_desc to array if it's an object
  const items = data.item_desc;
  const recipes = data.item_conversion_recipe_desc;
  const itemListDesc = data.item_list_desc;

  // Show spinner overlay until first render is complete
  useEffect(() => {
    if (!loading && recipeMap && !firstRenderDone) {
      setTimeout(() => setFirstRenderDone(true), 300); // Give browser time to render
    }
  }, [loading, recipeMap, firstRenderDone]);

  if (loading || !recipeMap || !firstRenderDone) {
    return (
      <div className="fixed inset-0 bg-bitcraft-bg text-bitcraft-text z-50 flex items-center justify-center text-2xl">
        Loading Bitcraft data and recipes...
      </div>
    );
  }
  if (error)
    return (
      <div className="bg-red-800 text-white p-6 rounded-lg max-w-4xl mx-auto mt-8">
        <strong>Error:</strong> {error}
        <br />
        <code>
          item_desc.json URL:
          https://raw.githubusercontent.com/BitCraftToolBox/BitCraft_GameData/refs/heads/main/server/region/item_desc.json
        </code>
        <br />
        <code>
          item_conversion_recipe_desc.json URL:
          https://raw.githubusercontent.com/BitCraftToolBox/BitCraft_GameData/refs/heads/main/server/region/item_conversion_recipe_desc.json
        </code>
        <br />
        <code>
          item_list_desc.json URL:
          https://raw.githubusercontent.com/BitCraftToolBox/BitCraft_GameData/refs/heads/main/server/region/item_list_desc.json
        </code>
      </div>
    );

  return (
    <div className="min-h-screen bg-bitcraft-bg py-4 md:py-8">
      <div className="app-container">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 text-bitcraft-primary">
            Bitcraft Companion
          </h1>
          <p className="text-bitcraft-text-muted text-lg">
            Plan your crafting, track your resources, and manage your inventory
          </p>
        </div>

        <Tabs defaultValue="items" className="w-full">
          <div className="tabs flex justify-center mb-6">
            <TabsList className="inline-flex bg-bitcraft-bg-tabs rounded-lg p-2 md:p-3 h-16">
              <TabsTrigger value="items">📦 Items</TabsTrigger>
              <TabsTrigger value="planner">🔨 Crafting Planner</TabsTrigger>
              <TabsTrigger value="inventory">🎒 Inventory</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="items">
            <ItemList
              items={items}
              itemListDesc={itemListDesc}
              onAddToPlanner={(itemId: number, qty = 1) =>
                setPlan((prev) => {
                  const exists = prev.find(
                    (p: PlanItem) => p.itemId === itemId
                  );
                  if (exists) {
                    return prev.map((p: PlanItem) =>
                      p.itemId === itemId
                        ? { ...p, quantity: p.quantity + (qty || 1) }
                        : p
                    );
                  }
                  return [...prev, { itemId: itemId, quantity: qty || 1 }];
                })
              }
              onAddToInventory={(itemId: number, qty = 1) =>
                setInventory((prev) => {
                  const exists = prev.find(
                    (r: InventoryItem) => r.itemId === itemId
                  );
                  if (exists) {
                    return prev.map((r: InventoryItem) =>
                      r.itemId === itemId
                        ? { ...r, have: r.have + (qty || 1) }
                        : r
                    );
                  }
                  return [...prev, { itemId: itemId, have: qty || 1 }];
                })
              }
            />
          </TabsContent>

          <TabsContent value="planner">
            <CraftingPlanner
              items={items}
              recipes={recipes}
              plan={plan}
              setPlan={setPlan}
              itemListDesc={itemListDesc}
              recipeMap={recipeMap}
              fallbackRecipeSearch={findRecipeFallback}
              inventory={inventory}
              setInventory={setInventory}
              fileInputRef={fileInputRef}
              handleDownload={handleDownload}
              handleUpload={handleUpload}
            />
          </TabsContent>

          <TabsContent value="inventory">
            <ResourceTracker
              items={items}
              inventory={inventory}
              setInventory={setInventory}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default App;
