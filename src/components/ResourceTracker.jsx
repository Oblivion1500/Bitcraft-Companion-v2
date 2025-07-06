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
    <div className="card">
      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold mb-2 text-bitcraft-primary">Inventory Tracker</h2>
        <p className="text-bitcraft-text-muted">Track your resources and materials</p>
      </div>
      
      <div className="form-section">
        <h3 className="text-lg font-semibold mb-4 text-bitcraft-primary">➕ Add Resources</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div className="flex flex-col space-y-2">
            <label htmlFor="inventory-search-input" className="text-bitcraft-text font-medium text-sm">
              🔍 Search Resources
            </label>
            <input
              id="inventory-search-input"
              name="inventory-search"
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search resources..."
              className="input-field"
            />
          </div>
          
          <div className="flex flex-col space-y-2">
            <label htmlFor="inventory-tier-select" className="text-bitcraft-text font-medium text-sm">
              🎯 Filter by Tier
            </label>
            <select
              id="inventory-tier-select"
              name="inventory-tier"
              value={tier}
              onChange={e => setTier(e.target.value)}
              className="input-field"
            >
              <option value="">All Tiers</option>
              {[...Array(10)].map((_, i) => (
                <option key={i + 1} value={i + 1}>Tier {i + 1}</option>
              ))}
            </select>
          </div>
          
          <div className="flex flex-col space-y-2">
            <label htmlFor="resource-select" className="text-bitcraft-text font-medium text-sm">
              📦 Select Resource
            </label>
            <select 
              id="resource-select" 
              name="resource-select" 
              value={selected} 
              onChange={e => setSelected(e.target.value)} 
              className="input-field"
            >
              <option value="">Choose a resource...</option>
              {filteredItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name || item.displayName || item.id}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex flex-col space-y-2">
            <label htmlFor="resource-qty-input" className="text-bitcraft-text font-medium text-sm">
              📊 Quantity
            </label>
            <input 
              id="resource-qty-input" 
              name="resource-qty" 
              type="number" 
              min="1" 
              value={qty} 
              onChange={e => setQty(Number(e.target.value))} 
              className="input-field w-24"
            />
          </div>
          <button 
            onClick={() => addResource(selected, qty)} 
            className="btn-primary"
            disabled={!selected}
          >
            ➕ Add Resource
          </button>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4 text-bitcraft-primary">
          🎒 Current Inventory ({inventory.length} items)
        </h3>
        
        {inventory.length === 0 ? (
          <div className="text-center py-8 text-bitcraft-text-muted">
            <p className="text-lg">No resources tracked yet</p>
            <p className="text-sm">Add resources above to start tracking your inventory</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {inventory.map((entry) => (
              <div key={entry.itemId} className="item-row">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-bitcraft-text font-medium text-lg">
                      {getItemName(entry.itemId)}
                    </h4>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <label htmlFor={`resource-have-input-${entry.itemId}`} className="text-bitcraft-text text-sm font-medium">
                        📦 Quantity:
                      </label>
                      <input
                        id={`resource-have-input-${entry.itemId}`}
                        name={`resource-have-input-${entry.itemId}`}
                        type="number"
                        min="0"
                        value={entry.have}
                        onChange={e => updateHave(entry.itemId, Number(e.target.value))}
                        className="input-field w-20 text-center"
                      />
                    </div>
                    
                    <button
                      onClick={() => setInventory(prev => prev.filter(r => r.itemId !== entry.itemId))}
                      className="text-red-400 hover:text-red-300 transition-colors p-1"
                      title="Remove from inventory"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
