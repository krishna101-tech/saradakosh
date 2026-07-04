'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronRight, ArrowLeft } from 'lucide-react';
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

      <h1 className="text-4xl font-bold mb-8 font-serif text-primary-theme">Major Periods of our History</h1>

      <div className="flex items-center gap-4 mb-8">
        <span className="font-bold text-text-theme text-sm uppercase tracking-wider opacity-85">Levels:</span>
        <div className="flex gap-2">
          {[1, 2].map((lvl) => (
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

      <div role="tree" aria-label="Major Periods Timeline Tree" className="space-y-4">
        {Object.keys(data).map(cat => {
          const isCatExpanded = expanded.has(cat);
          return (
            <div key={cat} role="none">
              <div 
                className="font-serif text-2xl font-semibold text-primary-theme mt-6 mb-2.5 border-b-2 border-glass-border pb-1 cursor-pointer select-none flex items-center gap-2 transition-colors hover:text-primary-theme/80"
                onClick={() => toggleNode(cat)} 
                role="treeitem"
                aria-expanded={isCatExpanded}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    toggleNode(cat);
                  }
                }}
              >
                {isCatExpanded ? <ChevronDown className="size-5" /> : <ChevronRight className="size-5" />}
                {cat}
              </div>
              
              {isCatExpanded && (
                <div role="group" className="space-y-2">
                  {data[cat].map(item => {
                    return (
                      <div key={item.id} className="bg-glass-bg border border-glass-border rounded-lg mb-1.5 p-2 px-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5" role="treeitem">
                        <Link 
                          href={`/reports/viewer/${item.id}`} 
                          className="block text-text-theme no-underline text-base font-medium leading-relaxed w-full h-full"
                          title="Click to view events"
                        >
                          {item.name}
                        </Link>
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
