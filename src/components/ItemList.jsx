// src/components/ItemList.jsx
import React, { useState } from 'react';

/**
 * ItemList component displays a list of items filtered by tier (1-10) and excludes developer tool items.
 * @param {Object[]} items - Array of item objects from item_desc.json
 * @param {Object} itemListDesc - item_list_desc.json for extra info (optional)
 * @param {function} onAddToPlanner - callback to add item to crafting planner
 * @param {function} onAddToInventory - callback to add item to inventory/resource tracker
 */
export default function ItemList({ items, itemListDesc, onAddToPlanner, onAddToInventory }) {
  const [search, setSearch] = useState('');
  const [tier, setTier] = useState('');

  // Per-item quantity state
  const [quantities, setQuantities] = useState({});

  // Only show items with tier 1-10 and not dev tools
  const filtered = items.filter(
    (item) => {
      // Some items may not have a tier or devTool property, so check safely
      const itemTier = item.tier ?? item.Tier ?? (itemListDesc?.[item.id]?.tier ?? null);
      const isDevTool = item.devTool ?? item.isDevTool ?? false;
      const matchesTier = tier ? itemTier === Number(tier) : itemTier >= 1 && itemTier <= 10;
      const name = (item.name || item.displayName || item.id || '').toLowerCase();
      const matchesSearch = name.includes(search.toLowerCase());
      return matchesTier && !isDevTool && matchesSearch;
    }
  );

  return (
    <div className="item-list">
      <h2>Items (Tiers 1-10)</h2>
      <div style={{ marginBottom: 12 }}>
        <label htmlFor="item-search-input" style={{marginRight:4}}>Search:</label>
        <input
          id="item-search-input"
          name="item-search"
          type="text"
          placeholder="Search items..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ marginRight: 8 }}
        />
        <label htmlFor="item-tier-select" style={{marginRight:4}}>Tier:</label>
        <select id="item-tier-select" name="item-tier" value={tier} onChange={e => setTier(e.target.value)}>
          <option value="">All Tiers</option>
          {[...Array(10)].map((_, i) => (
            <option key={i+1} value={i+1}>Tier {i+1}</option>
          ))}
        </select>
      </div>
      <ul>
        {filtered.map((item) => {
          const qty = quantities[item.id] || 1;
          return (
            <li key={item.id || item.name}>
              {item.name || item.displayName || item.id} {item.tier ? `(Tier ${item.tier})` : ''}
              <label htmlFor={`itemlist-qty-${item.id}`} style={{marginLeft:8,marginRight:4}}>Qty:</label>
              <input
                id={`itemlist-qty-${item.id}`}
                name={`itemlist-qty-${item.id}`}
                type="number"
                min="1"
                value={qty}
                onChange={e => {
                  const val = Math.max(1, Number(e.target.value));
                  setQuantities(q => ({ ...q, [item.id]: val }));
                }}
                style={{ width: 60 }}
              />
              <button style={{marginLeft: 4}} onClick={() => onAddToPlanner?.(item.id, qty)}>Add to Planner</button>
              <button style={{marginLeft: 4}} onClick={() => onAddToInventory?.(item.id, qty)}>Add to Inventory</button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
