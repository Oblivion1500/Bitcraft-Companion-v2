// src/components/ItemList.tsx
import React, { useState } from 'react';
import type { ItemDesc, ItemListDesc } from '../types/bitcraft';

interface ItemListProps {
  items: ItemDesc[];
  itemListDesc: ItemListDesc[];
  onAddToPlanner: (itemId: string, qty?: number) => void;
  onAddToInventory: (itemId: string, qty?: number) => void;
}

/**
 * ItemList component displays a list of items filtered by tier (1-10) and excludes developer tool items.
 */
export default function ItemList({ items, itemListDesc, onAddToPlanner, onAddToInventory }: ItemListProps) {
  const [search, setSearch] = useState('');
  const [tier, setTier] = useState('');

  // Per-item quantity state
  const [quantities, setQuantities] = useState<Record<string, number>>({});

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
    <div className="card">
      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold mb-2 text-bitcraft-primary">Items Database</h2>
        <p className="text-bitcraft-text-muted">Browse and add items to your crafting plan (Tiers 1-10)</p>
      </div>

      <div className="form-section">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col space-y-2">
            <label htmlFor="item-search-input" className="text-bitcraft-text font-medium text-sm">
              🔍 Search Items
            </label>
            <input
              id="item-search-input"
              name="item-search"
              type="text"
              placeholder="Search items by name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field"
            />
          </div>
          <div className="flex flex-col space-y-2">
            <label htmlFor="item-tier-select" className="text-bitcraft-text font-medium text-sm">
              🎯 Filter by Tier
            </label>
            <select id="item-tier-select" name="item-tier" value={tier} onChange={e => setTier(e.target.value)} className="input-field">
              <option value="">All Tiers</option>
              {[...Array(10)].map((_, i) => (
                <option key={i + 1} value={i + 1}>Tier {i + 1}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-bitcraft-text-muted text-sm">
          Found {filtered.length} items
        </p>
      </div>

      <div className="grid gap-3">
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-bitcraft-text-muted">
            <p className="text-lg">No items found</p>
            <p className="text-sm">Try adjusting your search or tier filter</p>
          </div>
        ) : (
          filtered.map((item) => {
            const qty = quantities[item.id] || 1;
            return (
              <div key={item.id || item.name} className="item-row">
                <div className="flex flex-col md:flex-row md:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-bitcraft-text font-medium text-lg">
                      {item.name || item.displayName || item.id}
                    </h3>
                    {item.tier && (
                      <span className="inline-block px-2 py-1 bg-bitcraft-primary text-bitcraft-text-dark text-xs rounded-full font-medium">
                        Tier {item.tier}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <label htmlFor={`itemlist-qty-${item.id}`} className="text-bitcraft-text text-sm font-medium">
                        Qty:
                      </label>
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
                        className="input-field w-16 text-center"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => onAddToPlanner?.(item.id, qty)}
                        className="btn-primary text-sm"
                        title="Add to Crafting Planner"
                      >
                        🔨 Plan
                      </button>
                      <button
                        onClick={() => onAddToInventory?.(item.id, qty)}
                        className="btn-primary text-sm"
                        title="Add to Inventory"
                      >
                        🎒 Inventory
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
