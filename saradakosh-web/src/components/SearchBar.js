'use client';

import { useState, useEffect } from 'react';
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
    <div style={{ position: 'relative', width: '100%', maxWidth: '600px', margin: '0 auto' }}>
      <div className="search-wrapper" style={{ marginBottom: 0 }}>
        <span className="search-icon">🔍</span>
        <input 
          type="text" 
          id="search-input" 
          placeholder="Type a keyword, name, or date..." 
          aria-label="Search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {(query.length >= 3) && (
        <div id="search-results" style={{ display: 'block', position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, marginTop: '10px' }}>
          {isSearching ? (
            <p style={{ padding: '10px', margin: 0, opacity: 0.7 }}>Searching server...</p>
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
                <div key={m.id} className="child-event">
                  <strong>{displayDt}</strong>: {m.du}
                </div>
              );
            })
          ) : (
            <p style={{ padding: '10px', margin: 0, opacity: 0.7 }}>No results found.</p>
          )}
        </div>
      )}
    </div>
  );
}
