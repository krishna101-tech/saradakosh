'use client';
import { useState } from 'react';
import { ChevronRight } from 'lucide-react';

export default function ViewerAccordion({ events }) {
  const [openIds, setOpenIds] = useState(new Set());
  
  const toggleAccordion = (id) => {
    setOpenIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <div id="content-container" className="space-y-2">
      {events.map((e, index) => {
        let dateParts = [];
        if (e.dt && String(e.dt).trim() !== "" && parseFloat(e.dt) !== 0) dateParts.push(parseInt(e.dt));
        if (e.mn && String(e.mn).trim() !== "" && parseFloat(e.mn) !== 0) {
            let m = parseInt(e.mn);
            if (m >= 1 && m <= 12) dateParts.push(monthNames[m - 1]);
        }
        if (e.yr && String(e.yr).trim() !== "" && parseFloat(e.yr) !== 0) dateParts.push(parseInt(e.yr));
        let yrStr = dateParts.join(" ");
        
        let typeStr = e.type || "";
        let duText = e.du || "";
        if (e.ref) duText += ` (${e.ref})`;

        const hasChildren = e.children && e.children.length > 0;
        const isOpen = openIds.has(e.id);
        
        const btnBaseClass = "w-full p-4.5 bg-glass-bg border border-glass-border text-text-theme rounded-lg shadow-sm transition-all duration-300 focus:outline-none touch-manipulation";
        const btnHoverClass = hasChildren ? "hover:bg-glass-hover cursor-pointer" : "cursor-default";

        return (
          <div key={e.id} className="w-full">
            <button 
              className={`${btnBaseClass} ${btnHoverClass}`}
              onClick={hasChildren ? () => toggleAccordion(e.id) : undefined}
            >
              <div className="flex gap-4 items-baseline w-full text-left font-sans flex-wrap">
                {hasChildren ? (
                  <span className={`inline-block mr-2 text-primary-theme transition-transform duration-300 ${isOpen ? 'transform rotate-90' : ''}`}><ChevronRight className="size-4 inline" /></span>
                ) : (
                  <span className="w-4 mr-2 flex-shrink-0 inline-block"></span>
                )}
                <span className="text-secondary-theme font-bold w-24 flex-shrink-0 whitespace-nowrap text-right">{yrStr}</span>
                <span className="text-primary-theme font-bold w-15 flex-shrink-0">{typeStr}</span>
                <span className="flex-1 font-medium">{duText}</span>
              </div>
            </button>
            {hasChildren && (
              <div className={`pl-14 pr-6 py-4 border-l-3 border-primary-theme space-y-3 mb-4 ${isOpen ? 'block animate-[slideDown_0.3s_ease-out]' : 'hidden'}`}>
                {e.children.map(c => (
                  <div key={c.id} className="mb-2.5 leading-relaxed text-gray-700 dark:text-gray-300 border-b border-dashed border-glass-border pb-2.5 last:border-b-0">
                    {c.du}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
