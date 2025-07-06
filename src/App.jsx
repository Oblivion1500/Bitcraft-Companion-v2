import React, { useEffect, useState, useRef } from 'react';
import './index.css'; // Use Tailwind and theme
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./components/ui/tabs";
import ItemList from './components/ItemList';
import CraftingPlanner from './components/CraftingPlanner';
import ResourceTracker from './components/ResourceTracker';
import { fetchAllBitcraftData } from './services/bitcraftDataService';

function buildRecipeMap(recipes, itemListDesc) {
  const map = new Map();
  for (const r of recipes) {
    if (r.output_item_id) map.set(r.output_item_id, r);
    if (Array.isArray(r.output_items)) {
      for (const o of r.output_items) {
        if (o.id) map.set(o.id, r);
      }
    }
    if (r.output && r.output.id) map.set(r.output.id, r);
    // NEW: Support crafted_item_stacks (Bitcraft crafting_recipe_desc)
    if (Array.isArray(r.crafted_item_stacks)) {
      for (const stack of r.crafted_item_stacks) {
        if (stack && stack.length > 0) map.set(String(stack[0]), r);
      }
    }
    if (itemListDesc && r.output_item_id && itemListDesc[r.output_item_id]) {
      map.set(itemListDesc[r.output_item_id].id, r);
    }
  }
  return map;
}

function findRecipeFallback(recipes, itemId) {
  return recipes.find(r => {
    if (r.output_item_id === itemId) return true;
    if (Array.isArray(r.output_items) && r.output_items.some(o => o.id === itemId)) return true;
    if (r.output && r.output.id === itemId) return true;
    // NEW: Support crafted_item_stacks
    if (Array.isArray(r.crafted_item_stacks) && r.crafted_item_stacks.some(stack => String(stack[0]) === String(itemId))) return true;
    return Object.values(r).some(val => {
      if (typeof val === 'string') return val === itemId;
      if (Array.isArray(val)) return val.some(v => v && v.id === itemId);
      if (val && typeof val === 'object') return val.id === itemId;
      return false;
    });
  });
}

function App() {
  const [data, setData] = useState({ item_desc: [], item_conversion_recipe_desc: [], item_list_desc: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recipeMap, setRecipeMap] = useState(null);
  const [firstRenderDone, setFirstRenderDone] = useState(false);

  // State for crafting planner and inventory
  const [plan, setPlan] = useState(() => {
    try {
      const saved = localStorage.getItem('bitcraft-plan');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [inventory, setInventory] = useState(() => {
    try {
      const saved = localStorage.getItem('bitcraft-inventory');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('bitcraft-plan', JSON.stringify(plan));
  }, [plan]);
  useEffect(() => {
    localStorage.setItem('bitcraft-inventory', JSON.stringify(inventory));
  }, [inventory]);

  // Download/upload refs
  const fileInputRef = useRef();

  // Download JSON
  const handleDownload = () => {
    const data = { plan, inventory };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bitcraft_save.json';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };

  // Upload JSON
  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target.result);
        if (Array.isArray(data.plan)) setPlan(data.plan);
        if (Array.isArray(data.inventory)) setInventory(data.inventory);
      } catch (err) {
        alert('Invalid JSON file.');
      }
    };
    reader.readAsText(file);
  };

  useEffect(() => {
    setLoading(true);
    fetchAllBitcraftData()
      .then((loadedData) => {
        setData(loadedData);
        const items = Array.isArray(loadedData.item_desc) ? loadedData.item_desc : Object.values(loadedData.item_desc);
        // Merge both recipe sources
        const recipes1 = Array.isArray(loadedData.item_conversion_recipe_desc) ? loadedData.item_conversion_recipe_desc : Object.values(loadedData.item_conversion_recipe_desc);
        const recipes2 = Array.isArray(loadedData.crafting_recipe_desc) ? loadedData.crafting_recipe_desc : Object.values(loadedData.crafting_recipe_desc);
        const recipes = [...recipes1, ...recipes2];
        const itemListDesc = loadedData.item_list_desc;
        const map = buildRecipeMap(recipes, itemListDesc);
        setRecipeMap(map);
        // Debug: dump all recipe outputs for manual search
        // const allOutputs = [];
        // for (const r of recipes) {
        //   if (r.output_item_id) allOutputs.push(r.output_item_id);
        //   if (Array.isArray(r.output_items)) allOutputs.push(...r.output_items.map(o => o.id));
        //   if (r.output && r.output.id) allOutputs.push(r.output.id);
        // }
        // console.log('All recipe outputs:', allOutputs);
        // Debug: check for Rough Leather
        // if (!map.has('1070004')) {
        //   const fallback = findRecipeFallback(recipes, '1070004');
        //   if (fallback) {
        //     console.warn('Fallback recipe found for Rough Leather (ID: 1070004):', fallback);
        //   } else {
        //     console.warn('No recipe found for Rough Leather (ID: 1070004) in any field.');
        //   }
        // }
        // Debug: check map keys and crafted_item_stacks for 1070004
        // const mapKeys = Array.from(map.keys());
        // console.log('RecipeMap keys (string):', mapKeys);
        // console.log('Has key "1070004":', map.has('1070004'));
        // console.log('Has key 1070004:', map.has(1070004));
        // const recipesWith1070004 = recipes.filter(r => Array.isArray(r.crafted_item_stacks) && r.crafted_item_stacks.some(stack => String(stack[0]) === '1070004'));
        // console.log('Recipes with crafted_item_stacks containing 1070004:', recipesWith1070004);

        setTimeout(() => setLoading(false), 100);
      })
      .catch((err) => setError(err.toString() + (err.stack ? `\n${err.stack}` : '')));
  }, []);

  // Convert item_desc to array if it's an object
  const items = Array.isArray(data.item_desc) ? data.item_desc : Object.values(data.item_desc);
  const recipes = Array.isArray(data.item_conversion_recipe_desc) ? data.item_conversion_recipe_desc : Object.values(data.item_conversion_recipe_desc);
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
  if (error) return (
    <div className="bg-red-800 text-white p-6 rounded-lg max-w-4xl mx-auto mt-8">
      <strong>Error:</strong> {error}
      <br />
      <code>item_desc.json URL: https://raw.githubusercontent.com/BitCraftToolBox/BitCraft_GameData/refs/heads/main/server/region/item_desc.json</code>
      <br />
      <code>item_conversion_recipe_desc.json URL: https://raw.githubusercontent.com/BitCraftToolBox/BitCraft_GameData/refs/heads/main/server/region/item_conversion_recipe_desc.json</code>
      <br />
      <code>item_list_desc.json URL: https://raw.githubusercontent.com/BitCraftToolBox/BitCraft_GameData/refs/heads/main/server/region/item_list_desc.json</code>
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
            <TabsList className="inline-flex bg-bitcraft-bg-tabs rounded-lg p-2 md:p-3">
              <TabsTrigger 
                value="items" 
                className="data-[state=active]:bg-bitcraft-bg-card data-[state=active]:text-bitcraft-primary px-4 md:px-6 py-2 rounded-md transition-colors text-sm md:text-base font-medium"
              >
                📦 Items
              </TabsTrigger>
              <TabsTrigger 
                value="planner" 
                className="data-[state=active]:bg-bitcraft-bg-card data-[state=active]:text-bitcraft-primary px-4 md:px-6 py-2 rounded-md transition-colors text-sm md:text-base font-medium"
              >
                🔨 Crafting Planner
              </TabsTrigger>
              <TabsTrigger 
                value="inventory" 
                className="data-[state=active]:bg-bitcraft-bg-card data-[state=active]:text-bitcraft-primary px-4 md:px-6 py-2 rounded-md transition-colors text-sm md:text-base font-medium"
              >
                🎒 Inventory
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="items">
            <ItemList
              items={items}
              itemListDesc={itemListDesc}
              onAddToPlanner={(itemId, qty = 1) => setPlan((prev) => {
                const idStr = String(itemId);
                const exists = prev.find((p) => String(p.itemId) === idStr);
                if (exists) {
                  return prev.map((p) =>
                    String(p.itemId) === idStr ? { ...p, quantity: p.quantity + (qty || 1) } : p
                  );
                }
                return [...prev, { itemId: idStr, quantity: qty || 1, have: 0 }];
              })}
              onAddToInventory={(itemId, qty = 1) => setInventory((prev) => {
                const idStr = String(itemId);
                const exists = prev.find((r) => String(r.itemId) === idStr);
                if (exists) {
                  return prev.map((r) =>
                    String(r.itemId) === idStr ? { ...r, have: r.have + (qty || 1) } : r
                  );
                }
                return [...prev, { itemId: idStr, have: qty || 1 }];
              })}
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
