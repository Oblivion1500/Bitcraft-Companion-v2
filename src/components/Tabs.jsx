// src/components/Tabs.jsx
import React, { useState } from 'react';

/**
 * Tabs component for switching between different app views.
 * @param {Array<{label: string, content: React.ReactNode}>} tabs
 */
export default function Tabs({ tabs }) {
  const [active, setActive] = useState(0);
  return (
    <div className="tabs-container">
      <div className="tab-headers">
        {tabs.map((tab, idx) => (
          <button
            key={tab.label}
            className={active === idx ? 'active' : ''}
            onClick={() => setActive(idx)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="tab-content">{tabs[active].content}</div>
    </div>
  );
}
