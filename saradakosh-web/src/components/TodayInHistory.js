'use client';
import { useState, useEffect } from 'react';
import { fetchTodayEvents, fetchEventChildrenAction } from '@/app/actions';
import { ChevronRight } from 'lucide-react';
import SectionHeading from '@/components/SectionHeading';

const ShimmerSkeleton = () => (
  <div className="space-y-4 animate-pulse mt-8">
    <div className="h-6 w-48 bg-gray-300 dark:bg-slate-700 rounded"></div>
    <div className="h-14 w-full bg-glass-bg border border-glass-border rounded-lg"></div>
    <div className="h-14 w-full bg-glass-bg border border-glass-border rounded-lg"></div>
    <div className="h-6 w-32 bg-gray-300 dark:bg-slate-700 rounded mt-8"></div>
    <div className="h-14 w-full bg-glass-bg border border-glass-border rounded-lg"></div>
  </div>
);

export default function TodayInHistory() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('Today in History');
  const [openIds, setOpenIds] = useState(new Set());
  const [childrenData, setChildrenData] = useState({});
  const [loadingChildren, setLoadingChildren] = useState({});

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
    return (
      <div className="mt-8">
        <SectionHeading>{title}</SectionHeading>
        <ShimmerSkeleton />
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="mt-8">
        <SectionHeading>{title}</SectionHeading>
        <p className="text-gray-500 text-center mt-6">No records found for today.</p>
      </div>
    );
  }

  // Group by year
  const grouped = {};
  events.forEach(e => {
    let yr = e.yr || 0;
    if (!grouped[yr]) grouped[yr] = [];
    grouped[yr].push(e);
  });

  const toggleAccordion = async (id) => {
    setOpenIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });

    if (!childrenData[id] && !loadingChildren[id]) {
      setLoadingChildren(prev => ({ ...prev, [id]: true }));
      try {
        const children = await fetchEventChildrenAction(id);
        setChildrenData(prev => ({ ...prev, [id]: children }));
      } catch (err) {
        console.error("Failed to fetch children", err);
      } finally {
        setLoadingChildren(prev => ({ ...prev, [id]: false }));
      }
    }
  };

  return (
    <div>
      <SectionHeading>{title}</SectionHeading>
      <div id="today-history" className="mt-8 relative border-l-2 border-secondary-theme/30 ml-4 pl-6 space-y-8">
        {Object.keys(grouped).sort((a,b) => a - b).map(yr => (
          <div key={yr} className="relative space-y-3">
            {/* Timeline Tick Mark */}
            <div className="absolute -left-[31px] top-1.5 size-4 rounded-full border-2 border-secondary-theme bg-bg-theme flex items-center justify-center">
              <div className="size-1.5 rounded-full bg-secondary-theme"></div>
            </div>
            
            <div className="text-xl font-bold text-primary-theme font-serif tracking-tight">{yr == 0 ? "Unknown Year" : yr}</div>
            
            <div className="space-y-3">
              {grouped[yr].map(e => {
                const hasChildren = e.hasChildren;
                const isOpen = openIds.has(e.id);
                
                if (hasChildren) {
                  const children = childrenData[e.id] || [];
                  const isLoading = loadingChildren[e.id];

                  return (
                    <div key={e.id} className="w-full">
                      <button 
                        className="w-full flex items-center text-left text-base font-medium p-4 bg-card border border-border hover:bg-glass-hover text-text-theme rounded-md shadow-none transition-all duration-300 focus:outline-none cursor-pointer touch-manipulation"
                        onClick={() => toggleAccordion(e.id)}
                      >
                        <ChevronRight className={`size-4 mr-2 text-primary-theme transition-transform duration-300 ${isOpen ? 'transform rotate-90' : ''}`} />
                        <span className="flex-1">{e.du || "No description"}</span>
                      </button>
                      <div className={`pl-6 pr-4 py-2 border-l-2 border-primary-theme space-y-2 mt-2 mb-4 ${isOpen ? 'block animate-[slideDown_0.3s_ease-out]' : 'hidden'}`}>
                        {isLoading ? (
                          <div className="py-2.5 text-sm text-gray-500 animate-pulse">Loading details...</div>
                        ) : children.length > 0 ? (
                          children.map(c => (
                            <div key={c.id} className="py-2.5 border-b border-dashed border-border text-sm text-text-theme/90 last:border-b-0">{c.du}</div>
                          ))
                        ) : (
                          <div className="py-2.5 text-sm text-gray-500">No additional details found.</div>
                        )}
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div key={e.id} className="w-full flex items-center text-left text-base p-4 bg-card border border-border text-text-theme rounded-md shadow-none">
                      <span className="w-4 mr-2 flex-shrink-0 inline-block"></span> 
                      <span className="flex-1">{e.du || "No description"}</span>
                    </div>
                  );
                }
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
