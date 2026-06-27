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
    <main className="max-w-[1000px] mx-auto p-5 md:p-8 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <Link 
          href="/" 
          className="inline-flex items-center gap-1.5 font-sans font-semibold text-text-theme opacity-80 hover:opacity-100 hover:text-primary-theme transition-all duration-300 -translate-x-0 hover:-translate-x-1 cursor-pointer bg-none border-none p-0 no-underline"
        >
          &larr; Back to Dashboard
        </Link>
        <ThemeSelector />
      </div>

      <h1 className="text-4xl font-bold mb-8 font-serif text-primary-theme">Swami Vivekananda</h1>

      <div className="flex items-center gap-4 mb-8">
        <span className="font-bold text-text-theme text-sm uppercase tracking-wider opacity-85">Levels:</span>
        <div className="flex gap-2">
          {[1, 2, 3].map((lvl) => (
            <button 
              key={lvl}
              className={`border-2 border-primary-theme py-1 px-4 cursor-pointer rounded-full bg-transparent text-primary-theme font-bold text-sm transition-all duration-200 hover:bg-primary-theme/10 ${
                activeLevelBtn === lvl ? '!bg-primary-theme !text-white shadow-sm shadow-primary-theme/25' : ''
              }`} 
              onClick={() => setGlobalLevel(lvl)}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      <div role="tree" aria-label="Swami Vivekananda Timeline Tree" className="space-y-4">
        {data.map((p2, i2) => {
          const isP2Expanded = expanded.has(p2.id);
          return (
            <div key={p2.id} role="none">
              <div 
                className={`level1 ${!isP2Expanded ? 'collapsed' : ''}`} 
                onClick={() => toggleNode(p2.id)}
                role="treeitem"
                aria-expanded={isP2Expanded}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    toggleNode(p2.id);
                  }
                }}
              >
                {i2 + 1} {p2.para1.replace(/^\d+\s*/, '')}
              </div>
              
              {isP2Expanded && (
                <div role="group" className="space-y-2">
                  {p2.children.map((p3, i3) => {
                    const isP3Expanded = expanded.has(p3.id);
                    return (
                      <div key={p3.id} role="none">
                        <div 
                          className={`level2 ${!isP3Expanded ? 'collapsed' : ''}`} 
                          onClick={() => toggleNode(p3.id)}
                          role="treeitem"
                          aria-expanded={isP3Expanded}
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === ' ' || e.key === 'Enter') {
                              e.preventDefault();
                              toggleNode(p3.id);
                            }
                          }}
                        >
                          {i3 + 1} {p3.para1.replace(/^\d+\s*/, '')}
                        </div>
                        
                        {isP3Expanded && (
                          <div role="group" className="space-y-1">
                            {p3.children.map((p4, i4) => {
                              const text = p4.para1.replace(/^\d+\s*/, '');
                              return (
                                <div key={p4.id} className="level3-container" role="treeitem">
                                  <div className="level3-row" role="none">
                                    <div className="level3-text" role="none">
                                      <Link 
                                        href={`/reports/viewer/${p4.id}`} 
                                        className="no-underline text-inherit block"
                                        title="Click to view events"
                                      >
                                        {i4 + 1} {text}
                                      </Link>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
