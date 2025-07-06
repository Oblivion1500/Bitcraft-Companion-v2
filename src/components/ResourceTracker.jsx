// src/components/ResourceTracker.jsx
import React, { useState, useMemo } from 'react';

/**
 * ResourceTracker component allows users to track their owned resources.
 * @param {Object[]} items - Array of item objects from item_desc.json
 * @param {Array} inventory - The current inventory [{itemId, have}]
 * @param {function} setInventory - Setter for the inventory
 */
export default function ResourceTracker({ items, inventory, setInventory }) {
  const [selected, setSelected] = useState('');
  const [qty, setQty] = useState(1);
  const [search, setSearch] = useState('');
  const [tier, setTier] = useState('');

  // Filter items by search and tier (like CraftingPlanner)
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

  const addResource = (itemId, quantity = 1) => {
    if (!itemId) return;
    setInventory((prev) => {
      const exists = prev.find((r) => r.itemId === itemId);
      if (exists) {
        return prev.map((r) =>
          r.itemId === itemId ? { ...r, have: r.have + quantity } : r
        );
      }
      return [...prev, { itemId, have: quantity }];
    });
  };

  const updateHave = (itemId, have) => {
    setInventory((prev) => prev.map((r) => (r.itemId === itemId ? { ...r, have } : r)));
  };

  const getItemName = (id) => {
    const idStr = String(id);
    const item = items.find((i) => String(i.id) === idStr);
    return item ? item.name || item.displayName || idStr : idStr;
  };

  return (
    <div className="resource-tracker">
      <h2>Inventory</h2>
      <div className="add-resource" style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        <label htmlFor="inventory-search-input">Search:</label>
        <input
          id="inventory-search-input"
          name="inventory-search"
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search resources..."
          style={{ minWidth: 120 }}
        />
        <label htmlFor="inventory-tier-select">Tier:</label>
        <select
          id="inventory-tier-select"
          name="inventory-tier"
          value={tier}
          onChange={e => setTier(e.target.value)}
        >
          <option value="">All</option>
          {[...Array(10)].map((_, i) => (
            <option key={i + 1} value={i + 1}>Tier {i + 1}</option>
          ))}
        </select>
        <label htmlFor="resource-select" style={{marginRight:4}}>Resource:</label>
        <select id="resource-select" name="resource-select" value={selected} onChange={e => setSelected(e.target.value)}>
          <option value="">Select resource...</option>
          {filteredItems.map((item) => (
            <option key={item.id} value={item.id}>{item.name || item.displayName || item.id}</option>
          ))}
        </select>
        <label htmlFor="resource-qty-input" style={{marginLeft:8,marginRight:4}}>Qty:</label>
        <input id="resource-qty-input" name="resource-qty" type="number" min="1" value={qty} onChange={e => setQty(Number(e.target.value))} />
        <button onClick={() => addResource(selected, qty)}>Add</button>
      </div>
      <ul>
        {inventory.map((entry) => (
          <li key={entry.itemId}>
            {getItemName(entry.itemId)}: Have 
            <label htmlFor={`resource-have-input-${entry.itemId}`} style={{display:'none'}}>Have</label>
            <input
              id={`resource-have-input-${entry.itemId}`}
              name={`resource-have-input-${entry.itemId}`}
              type="number"
              min="0"
              value={entry.have}
              onChange={e => updateHave(entry.itemId, Number(e.target.value))}
              style={{ width: 60, marginLeft: 4 }}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
