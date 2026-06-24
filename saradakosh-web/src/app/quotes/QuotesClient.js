'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import './quotes.css';

import categoriesData from '@/data/categories.json';
import quotesData from '@/data/quotes.json';

const LANG_LABELS = { eng: 'English', ben: 'Bengali', hin: 'Hindi', guj: 'Gujarati', tel: 'Telugu', odi: 'Odia' };

// Recursive Category Component
const CategoryNode = ({ node, activeCategory, setActiveCategory, level = 0 }) => {
  const hasChildren = node.children && node.children.length > 0;
  const isActive = activeCategory === node.name;
  
  // Auto-expand if contains active child
  const containsActive = (n) => {
    if (!n.children) return false;
    return n.children.some(c => c.name === activeCategory || containsActive(c));
  };
  const [isOpen, setIsOpen] = useState(false);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem(`sk_node_${node.name}`);
      if (saved === 'true') setIsOpen(true);
    }
    if (activeCategory && containsActive(node)) {
      setIsOpen(true);
      if (typeof window !== 'undefined') sessionStorage.setItem(`sk_node_${node.name}`, 'true');
    }
  }, [activeCategory, node.name]);

  const handleClick = (e) => {
    e.stopPropagation();
    if (hasChildren) {
      setIsOpen(o => {
        const next = !o;
        if (typeof window !== 'undefined') {
          if (next) sessionStorage.setItem(`sk_node_${node.name}`, 'true');
          else sessionStorage.removeItem(`sk_node_${node.name}`);
        }
        return next;
      });
    } else {
      setActiveCategory(node.name);
    }
  };

  return (
    <div className={`category-node level-${level}`}>
      <div
        className={`category-label ${isActive ? 'active-cat' : ''} ${hasChildren ? 'has-children' : ''}`}
        onClick={handleClick}
        style={{ paddingLeft: `${level * 14}px` }}
      >
        <span className="cat-name">{node.name}</span>
        {hasChildren && <span className="cat-toggle">{isOpen ? '−' : '+'}</span>}
      </div>
      {hasChildren && (
        <div className={`category-children ${isOpen ? 'open' : ''}`}>
          {node.children.map((child, i) => (
            <CategoryNode key={i} node={child} activeCategory={activeCategory} setActiveCategory={setActiveCategory} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export default function QuotesClient() {
  const searchParams = useSearchParams();
  const [activeCategory, setActiveCategory] = useState('Best of Vivekananda');
  const [selectedLanguage, setSelectedLanguage] = useState('eng');
  const [searchTerm, setSearchTerm] = useState('');

  // Read ?cat= from URL or restore from sessionStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const cat = searchParams.get('cat');
    if (cat) {
      setActiveCategory(cat);
      sessionStorage.setItem('sk_active_cat', cat);
    } else {
      const saved = sessionStorage.getItem('sk_active_cat');
      if (saved) setActiveCategory(saved);
    }
  }, [searchParams]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (activeCategory) sessionStorage.setItem('sk_active_cat', activeCategory);
    else sessionStorage.removeItem('sk_active_cat');
  }, [activeCategory]);

  // Deduplicate by image path to avoid showing same image twice
  const seenImages = new Set();

  const displayedQuotes = quotesData.filter(q => {
    // Category filter
    if (activeCategory && !q.categories.includes(activeCategory)) return false;
    // Must have at least one image
    const imgs = q.images || {};
    if (Object.keys(imgs).length === 0) return false;
    // Determine display image
    const displayLang = imgs[selectedLanguage] ? selectedLanguage
      : imgs['eng'] ? 'eng'
      : Object.keys(imgs)[0];
    const imgSrc = imgs[displayLang];
    if (!imgSrc) return false;
    // Skip if this exact image was already used (dedup)
    if (seenImages.has(imgSrc)) return false;
    seenImages.add(imgSrc);
    return true;
  });

  return (
    <div className="quotes-container">
      {/* Left Sidebar */}
      <aside className="quotes-sidebar">
        <div className="sidebar-header">
          <h2 className="sidebar-title">Categories</h2>
          {activeCategory && (
            <button className="clear-filter" onClick={() => setActiveCategory(null)}>✕ Clear</button>
          )}
        </div>
        <div className="categories-tree">
          {categoriesData.map((topNode, i) => (
            <CategoryNode key={i} node={topNode} activeCategory={activeCategory} setActiveCategory={setActiveCategory} />
          ))}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="quotes-main">
        {/* Top Header */}
        <header className="quotes-header">
          <Link href="/" className="btn-home">Home</Link>
          <div className="search-bar">
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              style={{ padding: '8px 15px', borderRadius: '20px', border: '1px solid #ccc', background: '#fff', fontFamily: 'inherit', fontSize: '0.9rem' }}
            >
              {Object.entries(LANG_LABELS).map(([code, label]) => (
                <option key={code} value={code}>{label}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Search quotes..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <button aria-label="Search">🔍</button>
          </div>
        </header>

        {/* Category Title Area */}
        <div className="category-title-area">
          <h1>{activeCategory || 'All Quotes'}</h1>
          <p className="subtitle">(Total Quotes — {displayedQuotes.length})</p>
        </div>

        {/* Quotes Grid */}
        <div className="quotes-grid">
          {displayedQuotes.map((quote) => {
            const imgs = quote.images || {};
            const displayLang = imgs[selectedLanguage] ? selectedLanguage
              : imgs['eng'] ? 'eng'
              : Object.keys(imgs)[0];
            const imgSrc = imgs[displayLang];
            if (!imgSrc) return null;
            return (
              <Link
                href={`/quotes/post/${quote.id}?lang=${displayLang}`}
                key={quote.id}
                className="quote-card-wrapper"
              >
                <div className="quote-card-placeholder">
                  <img src={imgSrc} alt="Quote" />
                </div>
              </Link>
            );
          })}
          {displayedQuotes.length === 0 && (
            <div className="no-results">
              <p>No quotes found for this category.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
