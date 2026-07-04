'use client';

import { useState, useEffect } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { fetchSearchResults } from '@/app/actions';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.length >= 3) {
        setIsSearching(true);
        const data = await fetchSearchResults(query);
        setResults(data);
        setIsSearching(false);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const shortMonthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <div className="relative w-full max-w-[600px] mx-auto">
      <div className="relative w-full mb-0">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-text-theme opacity-60 size-5" />
        <input 
          type="text" 
          id="search-input" 
          placeholder="Type a keyword, name, or date..." 
          aria-label="Search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full py-4.5 pl-14 pr-6 text-lg bg-[var(--input-bg)] text-text-theme border-2 border-[var(--input-border)] rounded-full transition-all duration-300 shadow-md focus:outline-none focus:border-primary-theme focus:shadow-[0_0_15px_rgba(211,84,0,0.15)] focus:-translate-y-0.5"
        />
      </div>

      {(query.length >= 3) && (
        <div 
          id="search-results" 
          className="block absolute top-full left-0 right-0 z-50 mt-2.5 p-2.5 bg-glass-bg backdrop-blur-md border border-glass-border rounded-xl shadow-lg"
        >
          {isSearching ? (
            <p className="p-2.5 m-0 opacity-70">Searching server...</p>
          ) : results.length > 0 ? (
            results.map((m) => {
              let dateParts = [];
              if (m.dt && String(m.dt).trim() !== "" && parseFloat(m.dt) !== 0) dateParts.push(parseInt(m.dt));
              if (m.mn && String(m.mn).trim() !== "" && parseFloat(m.mn) !== 0) {
                  let mon = parseInt(m.mn);
                  if (mon >= 1 && mon <= 12) dateParts.push(shortMonthNames[mon - 1]);
              }
              if (m.yr && String(m.yr).trim() !== "" && parseFloat(m.yr) !== 0) dateParts.push(parseInt(m.yr));
              let displayDt = dateParts.length > 0 ? dateParts.join(" ") : "?";

              return (
                <div key={m.id} className="py-3 border-b border-dashed border-glass-border text-sm text-text-theme last:border-b-0 flex flex-col gap-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <strong className="text-[var(--primary-theme)]">{displayDt}</strong>
                    {m.isVectorMatch && m.isTextMatch && (
                      <span className="text-[10px] bg-[rgba(211,84,0,0.1)] text-[#D35400] px-2 py-0.5 rounded-full font-medium border border-[rgba(211,84,0,0.2)] flex items-center gap-1"><Sparkles className="size-3" /> AI & Keyword Match</span>
                    )}
                    {m.isVectorMatch && !m.isTextMatch && (
                      <span className="text-[10px] bg-purple-500/10 text-purple-700 dark:text-purple-400 px-2 py-0.5 rounded-full font-medium border border-purple-500/20 flex items-center gap-1"><Sparkles className="size-3" /> AI Semantic Match</span>
                    )}
                    {!m.isVectorMatch && m.isTextMatch && (
                      <span className="text-[10px] bg-blue-500/10 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full font-medium border border-blue-500/20 flex items-center gap-1"><Search className="size-3" /> Keyword Match</span>
                    )}
                    {m.similarityScore !== undefined && (
                      <span className="text-[10px] opacity-60 font-mono">({Math.round(m.similarityScore * 100)}% match)</span>
                    )}
                  </div>
                  <div className="leading-relaxed opacity-95">{m.du}</div>
                </div>
              );
            })
          ) : (
            <p className="p-2.5 m-0 opacity-70">No results found.</p>
          )}
        </div>
      )}
    </div>
  );
}
