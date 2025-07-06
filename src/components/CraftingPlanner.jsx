// src/components/CraftingPlanner.jsx
import React, { useState, useMemo } from 'react';

/**
 * CraftingPlanner component allows users to add items to their crafting plan and track what they have/need.
 * @param {Object[]} items - Array of item objects from item_desc.json
 * @param {Object[]} recipes - Array of recipe objects from item_conversion_recipe_desc.json
 * @param {Array} plan - The current crafting plan [{itemId, quantity, have}]
 * @param {function} setPlan - Setter for the crafting plan
 */
function getItemName(items, id) {
  const idStr = String(id);
  const item = items.find((i) => String(i.id) === idStr);
  return item ? item.name || item.displayName || idStr : idStr;
}

function getRecipeInputs(recipe) {
  if (Array.isArray(recipe.input_items)) return recipe.input_items;
  if (Array.isArray(recipe.inputs)) return recipe.inputs;
  if (Array.isArray(recipe.input)) return recipe.input;
  // NEW: Support Bitcraft's consumed_item_stacks
  if (Array.isArray(recipe.consumed_item_stacks)) {
    // Map Bitcraft's [itemId, quantity, ...] to {id, count}
    return recipe.consumed_item_stacks.map(stack => ({
      id: stack[0],
      count: stack[1] || 1
    }));
  }
  return [];
}

function Collapsible({ label, children, defaultOpen = false, depth = 0 }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ marginLeft: depth * 16 }}>
      <span
        style={{ cursor: 'pointer', userSelect: 'none', fontWeight: open ? 'bold' : 'normal' }}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? '▼' : '▶'} {label}
      </span>
      {open && <div>{children}</div>}
    </div>
  );
}

function RecipeBreakdown({ itemId, quantity, items, recipeMap, recipes, fallbackRecipeSearch, depth = 0, visited = new Set() }) {
  // Prevent infinite recursion/circular dependencies
  if (visited.has(itemId) || depth > 10) return null;
  const newVisited = new Set(visited);
  newVisited.add(itemId);

  let recipe = recipeMap.get(String(itemId)); // Always use string key
  let usedFallback = false;
  if (!recipe && fallbackRecipeSearch) {
    recipe = fallbackRecipeSearch(recipes, itemId);
    usedFallback = !!recipe;
  }

  // If no recipe, just show the item and quantity needed (no error/warning)
  if (!recipe) {
    return (
      <div style={{ marginLeft: depth * 16 }}>
        {quantity} × {getItemName(items, itemId)}
      </div>
    );
  }
  const inputs = getRecipeInputs(recipe);
  return (
    <Collapsible
      label={<><strong>To craft {quantity} × {getItemName(items, itemId)}</strong>{usedFallback && <span style={{color:'orange'}}> (Fallback recipe used)</span>}</>}
      defaultOpen={depth === 0}
      depth={depth}
    >
      <ul style={{ margin: 0, paddingLeft: 20 }}>
        {inputs.map((input, idx) => {
          // Try to get input id and count
          const inputId = input.id || input.item_id || input.input_item_id;
          const inputQty = (input.count || input.quantity || input.amount || 1) * quantity;
          return (
            <li key={inputId || idx} style={{ listStyle: 'none', margin: 0 }}>
              <RecipeBreakdown
                itemId={inputId}
                quantity={inputQty}
                items={items}
                recipeMap={recipeMap}
                recipes={recipes}
                fallbackRecipeSearch={fallbackRecipeSearch}
                depth={depth + 1}
                visited={newVisited}
              />
            </li>
          );
        })}
      </ul>
      {depth === 10 && <div style={{color:'orange'}}>Max recipe depth reached. Some requirements may not be shown.</div>}
    </Collapsible>
  );
}

export default function CraftingPlanner({ items, recipes, plan, setPlan, itemListDesc, recipeMap, fallbackRecipeSearch, inventory = [], setInventory, fileInputRef, handleDownload, handleUpload }) {
  const [selected, setSelected] = useState('');
  const [qty, setQty] = useState(1);
  const [search, setSearch] = useState('');
  const [tier, setTier] = useState('');

  // Preprocess recipes into a map for fast lookup, using itemListDesc for better mapping
  const recipeMapMemo = useMemo(() => recipeMap, [recipeMap]);

  // Filter items by search and tier
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch =
        !search ||
        (item.name && item.name.toLowerCase().includes(search.toLowerCase())) ||
        (item.displayName && item.displayName.toLowerCase().includes(search.toLowerCase())) ||
        (String(item.id).includes(search));
      const matchesTier = !tier || String(item.tier) === String(tier);
      return matchesSearch && matchesTier;
    });
  }, [items, search, tier]);

  const addToPlan = (itemId, quantity = 1) => {
    if (!itemId) return;
    setPlan((prev) => {
      const idStr = String(itemId);
      const exists = prev.find((p) => String(p.itemId) === idStr);
      if (exists) {
        return prev.map((p) =>
          String(p.itemId) === idStr ? { ...p, quantity: p.quantity + quantity } : p
        );
      }
      return [...prev, { itemId: idStr, quantity, have: 0 }];
    });
  };

  // Helper to get 'have' from inventory for a given itemId
  const getHaveFromInventory = (itemId) => {
    const idStr = String(itemId);
    const found = inventory.find((r) => String(r.itemId) === idStr);
    return found ? found.have : 0;
  };

  const updateHave = (itemId, have) => {
    setPlan((prev) => prev.map((p) => (p.itemId === itemId ? { ...p, have } : p)));
  };

  return (
    <div className="crafting-planner">
      <h2>Crafting Planner</h2>
      <div className="add-item" style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <label htmlFor="planner-search-input">Search:</label>
        <input
          id="planner-search-input"
          name="planner-search"
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search items..."
          style={{ minWidth: 120 }}
        />
        <label htmlFor="planner-tier-select">Tier:</label>
        <select
          id="planner-tier-select"
          name="planner-tier"
          value={tier}
          onChange={e => setTier(e.target.value)}
        >
          <option value="">All</option>
          {[...Array(10)].map((_, i) => (
            <option key={i + 1} value={i + 1}>Tier {i + 1}</option>
          ))}
        </select>
        <label htmlFor="planner-item-select" style={{marginRight:4}}>Item:</label>
        <select id="planner-item-select" name="planner-item" value={selected} onChange={e => setSelected(e.target.value)}>
          <option value="">Select item...</option>
          {filteredItems.map((item) => (
            <option key={item.id} value={item.id}>{item.name || item.displayName || item.id}</option>
          ))}
        </select>
        <label htmlFor="planner-qty-input" style={{marginLeft:8,marginRight:4}}>Qty:</label>
        <input id="planner-qty-input" name="planner-qty" type="number" min="1" value={qty} onChange={e => setQty(Number(e.target.value))} />
        <button onClick={() => addToPlan(selected, qty)}>Add</button>
      </div>
      <ul>
        {plan.map((entry) => {
          const have = getHaveFromInventory(entry.itemId);
          return (
            <li key={entry.itemId}>
              {getItemName(items, entry.itemId)}: 
              <label htmlFor={`need-input-${entry.itemId}`} style={{marginLeft:4,marginRight:4}}>Need</label>
              <input
                id={`need-input-${entry.itemId}`}
                name={`need-input-${entry.itemId}`}
                type="number"
                min="0"
                value={entry.quantity}
                onChange={e => setPlan(prev => prev.map(p => p.itemId === entry.itemId ? { ...p, quantity: Math.max(0, Number(e.target.value)) } : p))}
                style={{ width: 60, marginLeft: 2, marginRight: 2 }}
              />
              , Have
              <label htmlFor={`have-input-${entry.itemId}`} style={{display:'none'}}>Have</label>
              <input
                id={`have-input-${entry.itemId}`}
                name={`have-input-${entry.itemId}`}
                type="number"
                min="0"
                value={have}
                onChange={e => {
                  const newHave = Number(e.target.value);
                  setInventory(prev => {
                    const idStr = String(entry.itemId);
                    const exists = prev.find((r) => String(r.itemId) === idStr);
                    if (exists) {
                      return prev.map((r) => String(r.itemId) === idStr ? { ...r, have: newHave } : r);
                    }
                    return [...prev, { itemId: idStr, have: newHave }];
                  });
                }}
                style={{ width: 60, marginLeft: 4 }}
              />
              , Still Need <strong>{Math.max(0, entry.quantity - have)}</strong>
              <button
                aria-label={`Remove ${getItemName(items, entry.itemId)} from plan`}
                title="Remove from plan"
                style={{ marginLeft: 8 }}
                onClick={() => setPlan(prev => prev.filter(p => p.itemId !== entry.itemId))}
              >
                ❌
              </button>
              <RecipeBreakdown
                itemId={entry.itemId}
                quantity={entry.quantity}
                items={items}
                recipeMap={recipeMapMemo}
                recipes={recipes}
                fallbackRecipeSearch={fallbackRecipeSearch}
              />
            </li>
          );
        })}
      </ul>
      <div style={{marginTop:24,display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
        <button onClick={handleDownload}>Download Save (JSON)</button>
        <label style={{display:'inline-block'}}>
          <button type="button" onClick={() => fileInputRef?.current?.click()}>Upload Save (JSON)</button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            style={{display:'none'}}
            onChange={handleUpload}
          />
        </label>
        <button
          style={{marginLeft:8}}
          onClick={() => {
            if (window.confirm('Clear all saved planner and inventory data? This cannot be undone.')) {
              localStorage.removeItem('bitcraft-plan');
              localStorage.removeItem('bitcraft-inventory');
              setPlan([]);
              setInventory([]);
            }
          }}
        >
          Clear Save
        </button>
      </div>
    </div>
  );
}
