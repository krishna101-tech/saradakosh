'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import ThemeSelector from '@/components/ThemeSelector';

export default function VivekanandaClient({ data }) {
  const allP2Ids = useMemo(() => data.map(p2 => p2.id), [data]);
  const allP3Ids = useMemo(() => data.flatMap(p2 => p2.children.map(p3 => p3.id)), [data]);

  const [expanded, setExpanded] = useState(() => new Set([...allP2Ids, ...allP3Ids]));
  const [activeLevelBtn, setActiveLevelBtn] = useState(3);

  const setGlobalLevel = (lvl) => {
    setActiveLevelBtn(lvl);
    if (lvl === 1) setExpanded(new Set());
    if (lvl === 2) setExpanded(new Set(allP2Ids));
    if (lvl === 3) setExpanded(new Set([...allP2Ids, ...allP3Ids]));
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

      <h1 className="text-4xl font-bold mb-8 font-serif text-[#d35400]">Swami Vivekananda</h1>

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
        <button 
          className={`toggle-btn ${activeLevelBtn === 3 ? 'active' : ''}`} 
          onClick={() => setGlobalLevel(3)}
        >
          3
        </button>
      </div>

      <div>
        {data.map((p2, i2) => {
          const isP2Expanded = expanded.has(p2.id);
          return (
            <div key={p2.id}>
              <div className={`level1 ${!isP2Expanded ? 'collapsed' : ''}`} onClick={() => toggleNode(p2.id)}>
                {i2 + 1} {p2.para1.replace(/^\d+\s*/, '')}
              </div>
              
              {isP2Expanded && p2.children.map((p3, i3) => {
                const isP3Expanded = expanded.has(p3.id);
                return (
                  <div key={p3.id}>
                    <div className={`level2 ${!isP3Expanded ? 'collapsed' : ''}`} onClick={() => toggleNode(p3.id)}>
                      {i3 + 1} {p3.para1.replace(/^\d+\s*/, '')}
                    </div>
                    
                    {isP3Expanded && p3.children.map((p4, i4) => {
                      const text = p4.para1.replace(/^\d+\s*/, '');
                      return (
                          <div key={p4.id} className="level3-container">
                            <div className="level3-row">
                              <div className="level3-text">
                                <Link href={`/reports/viewer/${p4.id}`} style={{ color: 'inherit', textDecoration: 'none' }} title="Click to view events">
                                  {i4 + 1} {text}
                                </Link>
                              </div>
                            </div>
                          </div>
                      );
                    })}
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
