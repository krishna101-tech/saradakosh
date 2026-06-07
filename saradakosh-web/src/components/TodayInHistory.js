'use client';
import { useState, useEffect } from 'react';
import { fetchTodayEvents } from '@/app/actions';

export default function TodayInHistory() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('Today in History');
  const [openIds, setOpenIds] = useState(new Set());

  useEffect(() => {
    async function loadData() {
      const d = new Date();
      const dt = d.getDate();
      const mn = d.getMonth() + 1;
      
      const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      setTitle(`Today in History (${monthNames[d.getMonth()]} ${dt})`);

      const data = await fetchTodayEvents(mn, dt);
      setEvents(data || []);
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) {
    return <p style={{ color: '#888' }}>Loading historical records...</p>;
  }

  if (events.length === 0) {
    return <p style={{ color: '#888' }}>No records found for today.</p>;
  }

  // Group by year
  const grouped = {};
  events.forEach(e => {
    let yr = e.yr || 0;
    if (!grouped[yr]) grouped[yr] = [];
    grouped[yr].push(e);
  });

  const toggleAccordion = (id) => {
    setOpenIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  return (
    <div>
      <h2 className="section-title" style={{ marginTop: 0 }}>{title}</h2>
      <div id="today-history">
        {Object.keys(grouped).sort((a,b) => a - b).map(yr => (
          <div key={yr}>
            <div className="year-group">{yr == 0 ? "Unknown Year" : yr}</div>
            {grouped[yr].map(e => {
              const hasChildren = e.children && e.children.length > 0;
              const isOpen = openIds.has(e.id);
              
              if (hasChildren) {
                return (
                  <div key={e.id}>
                    <button 
                      className={`accordion ${isOpen ? 'active' : ''}`}
                      onClick={() => toggleAccordion(e.id)}
                    >
                      <span className="acc-arrow" style={{ marginRight: '8px' }}>&#9654;</span> 
                      {e.du || "No description"}
                    </button>
                    <div className="panel" style={{ display: isOpen ? 'block' : 'none' }}>
                      {e.children.map(c => (
                        <div key={c.id} className="child-event">{c.du}</div>
                      ))}
                    </div>
                  </div>
                );
              } else {
                return (
                  <div key={e.id} className="accordion-static">
                    <span className="acc-arrow-empty" style={{ marginRight: '8px' }}></span> 
                    {e.du || "No description"}
                  </div>
                );
              }
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
