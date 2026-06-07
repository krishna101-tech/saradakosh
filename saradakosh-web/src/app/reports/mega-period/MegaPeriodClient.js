'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import ThemeSelector from '@/components/ThemeSelector';

export default function MegaPeriodClient({ data }) {
  const allCatIds = useMemo(() => Object.keys(data), [data]);
  
  const [expanded, setExpanded] = useState(() => new Set([...allCatIds]));
  const [activeLevelBtn, setActiveLevelBtn] = useState(2);

  const setGlobalLevel = (lvl) => {
    setActiveLevelBtn(lvl);
    if (lvl === 1) setExpanded(new Set());
    if (lvl === 2) setExpanded(new Set(allCatIds));
  };

  const toggleNode = (id) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setActiveLevelBtn(0);
  };

  return (
    <div className="container min-h-screen p-8">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <Link href="/" className="back-link font-bold block" style={{ color: 'var(--text-color)', borderBottom: '1px solid var(--text-color)' }}>
          &larr; Back to Dashboard
        </Link>
        <ThemeSelector />
      </div>

      <h1 className="text-4xl font-bold mb-8 font-serif text-[#d35400]">Major Periods of our History</h1>

      <div className="level-toggles" style={{ marginBottom: '30px' }}>
        <span style={{ fontWeight: 'bold', marginRight: '15px', color: 'var(--text-color)', fontSize: '15px' }}>Levels:</span>
        <button 
          className={`toggle-btn ${activeLevelBtn === 1 ? 'active' : ''}`} 
          onClick={() => setGlobalLevel(1)}
        >
          1
        </button>
        <button 
          className={`toggle-btn ${activeLevelBtn === 2 ? 'active' : ''}`} 
          onClick={() => setGlobalLevel(2)}
        >
          2
        </button>
      </div>

      <div>
        {Object.keys(data).map(cat => {
          const isCatExpanded = expanded.has(cat);
          return (
            <div key={cat}>
              <div className={`level1 cat-title ${!isCatExpanded ? 'collapsed' : ''}`} onClick={() => toggleNode(cat)} style={{ cursor: 'pointer', userSelect: 'none' }}>
                {cat}
              </div>
              
              {isCatExpanded && data[cat].map(item => {
                // Remove leading numbers, e.g., "1 Ancestry" -> "Ancestry"
                const text = item.name.replace(/^\d+\s*/, '');
                return (
                    <div key={item.id} className="level2 item-container">
                      <Link href={`/reports/viewer/${item.id}`} className="item-text" style={{ color: 'var(--text-color)', textDecoration: 'none' }} title="Click to view events">
                        {item.name}
                      </Link>
                    </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
