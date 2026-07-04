'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronRight, ArrowLeft } from 'lucide-react';
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
          className="inline-flex items-center gap-1.5 font-sans font-semibold text-text-theme opacity-80 hover:opacity-100 hover:text-primary-theme transition-all duration-300 hover:-translate-x-1 cursor-pointer bg-none border-none p-0 no-underline"
        >
          <ArrowLeft className="size-4" /> Back to Dashboard
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
                className="text-primary-theme font-bold text-xl mt-6 mb-2.5 border-b border-glass-border pb-1 cursor-pointer select-none transition-colors duration-200 hover:text-primary-theme/80 flex items-center gap-2"
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
                {isP2Expanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                {i2 + 1} {p2.para1.replace(/^\d+\s*/, '')}
              </div>
              
              {isP2Expanded && (
                <div role="group" className="space-y-2">
                  {p2.children.map((p3, i3) => {
                    const isP3Expanded = expanded.has(p3.id);
                    return (
                      <div key={p3.id} role="none">
                        <div 
                          className="text-secondary-theme font-semibold text-lg ml-5 mt-2.5 mb-1.5 border-l-2 border-secondary-theme pl-3 cursor-pointer select-none transition-colors duration-200 hover:brightness-110 flex items-center gap-2"
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
                          {isP3Expanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                          {i3 + 1} {p3.para1.replace(/^\d+\s*/, '')}
                        </div>
                        
                        {isP3Expanded && (
                          <div role="group" className="space-y-1">
                            {p3.children.map((p4, i4) => {
                              const text = p4.para1.replace(/^\d+\s*/, '');
                              return (
                                <div key={p4.id} className="ml-12 border-b border-dashed border-glass-border transition-colors duration-200 rounded hover:bg-primary-theme/10 mb-0.5" role="treeitem">
                                  <div className="flex" role="none">
                                    <div className="p-2 text-base w-full" role="none">
                                      <Link 
                                        href={`/reports/viewer/${p4.id}`} 
                                        className="no-underline text-inherit block w-full"
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
