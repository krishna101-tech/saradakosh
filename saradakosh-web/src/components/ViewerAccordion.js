'use client';

import { useState } from 'react';

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
    <div id="content-container">
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
        
        const accClass = hasChildren ? 'accordion' : 'accordion-static';

        return (
          <div key={e.id}>
            <button 
                className={accClass + (isOpen ? ' active' : '')} 
                onClick={hasChildren ? () => toggleAccordion(e.id) : undefined}
                style={{ cursor: hasChildren ? 'pointer' : 'default' }}
            >
                <div className="acc-row" style={{ display: 'flex', gap: '15px', alignItems: 'baseline', width: '100%', textAlign: 'left', fontFamily: 'var(--font-sans)', flexWrap: 'wrap' }}>
                    {hasChildren ? <span className="acc-arrow" style={{ marginRight: '8px' }}>&#9654;</span> : <span className="acc-arrow-empty" style={{ marginRight: '8px', width: '14px', display: 'inline-block' }}></span>}
                    <span className="acc-seq" style={{ fontWeight: 'bold', width: '30px', flexShrink: 0, color: '#555' }}>{index + 1}</span>
                    <span className="acc-yr" style={{ color: 'var(--secondary-color)', fontWeight: 'bold', width: '100px', flexShrink: 0, whiteSpace: 'nowrap', textAlign: 'right' }}>{yrStr}</span>
                    <span className="acc-type" style={{ color: 'var(--primary-color)', fontWeight: 'bold', width: '60px', flexShrink: 0 }}>{typeStr}</span>
                    <span className="acc-du" style={{ flex: 1, fontWeight: 500 }}>{duText}</span>
                </div>
            </button>
            {hasChildren && (
                <div className="panel" style={{ display: isOpen ? 'block' : 'none', padding: '10px 18px 20px 115px' }}>
                    {e.children.map(c => (
                        <div key={c.id} className="child-text" style={{ marginBottom: '10px', lineHeight: 1.6, color: '#444', borderBottom: '1px dashed #eee', paddingBottom: '10px' }}>
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
