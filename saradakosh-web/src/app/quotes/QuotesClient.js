'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import './quotes.css';

import categoriesData from '@/data/categories.json';
import quotesData from '@/data/quotes.json';

const LANG_LABELS = { eng: 'English', ben: 'Bengali', hin: 'Hindi', guj: 'Gujarati', tel: 'Telugu', odi: 'Odia' };

function getOptimizedUrl(url, width) {
  if (!url || !url.includes('/upload/')) return url;
  const transform = width ? `c_scale,w_${width},f_auto,q_auto` : `f_auto,q_auto`;
  return url.replace('/upload/', `/upload/${transform}/`);
}

// Recursive Category Component
const CategoryNode = ({ node, activeCategory, setActiveCategory, closeSidebar, level = 0, categoryCounts }) => {
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
      if (closeSidebar) closeSidebar();
    }
  };

  const count = categoryCounts[node.name] || 0;

  return (
    <div className={`category-node level-${level}`}>
      <div
        className={`category-label ${isActive ? 'active-cat' : ''} ${hasChildren ? 'has-children' : ''}`}
        onClick={handleClick}
        style={{ paddingLeft: `${16 + (level * 16)}px`, paddingRight: '16px' }}
      >
        <span className="cat-name">{node.name} <span className="cat-count">({count})</span></span>
        {hasChildren && <span className={`cat-toggle ${isOpen ? 'open' : ''}`}>›</span>}
      </div>
      {hasChildren && (
        <div className={`category-children ${isOpen ? 'open' : ''}`}>
          <div className="category-children-inner">
            {node.children.map((child, i) => (
              <CategoryNode key={i} node={child} activeCategory={activeCategory} setActiveCategory={setActiveCategory} closeSidebar={closeSidebar} level={level + 1} categoryCounts={categoryCounts} />
            ))}
          </div>
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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

    const savedSidebar = sessionStorage.getItem('sk_sidebar_open');
    if (savedSidebar !== null) {
      setIsSidebarOpen(savedSidebar === 'true');
    } else {
      if (window.innerWidth <= 900) setIsSidebarOpen(false);
    }
  }, [searchParams]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (activeCategory) sessionStorage.setItem('sk_active_cat', activeCategory);
    else sessionStorage.removeItem('sk_active_cat');
  }, [activeCategory]);

  const handleSidebarOpen = (newState) => {
    setIsSidebarOpen(newState);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('sk_sidebar_open', newState.toString());
    }
  };

  // Precompute category descendants
  const categoryDescendants = React.useMemo(() => {
    const map = {};
    const traverse = (node) => {
      const descendants = new Set([node.name]);
      if (node.children) {
        node.children.forEach(child => {
          const childDesc = traverse(child);
          childDesc.forEach(d => descendants.add(d));
        });
      }
      map[node.name] = descendants;
      return descendants;
    };
    categoriesData.forEach(topNode => traverse(topNode));
    return map;
  }, []);

  // Compute exact quote counts per category
  const categoryCounts = React.useMemo(() => {
    const counts = {};
    Object.keys(categoryDescendants).forEach(cat => {
      const descendants = categoryDescendants[cat];
      const seen = new Set();
      let count = 0;
      quotesData.forEach(q => {
        const imgs = q.images || {};
        if (Object.keys(imgs).length === 0) return;
        const displayLang = imgs[selectedLanguage] ? selectedLanguage : imgs['eng'] ? 'eng' : Object.keys(imgs)[0];
        const imgSrc = imgs[displayLang];
        if (!imgSrc) return;
        
        if (q.categories.some(c => descendants.has(c))) {
          if (!seen.has(imgSrc)) {
            seen.add(imgSrc);
            count++;
          }
        }
      });
      counts[cat] = count;
    });
    return counts;
  }, [categoryDescendants, selectedLanguage]);

  // Deduplicate by image path to avoid showing same image twice
  const seenImages = new Set();

  const displayedQuotes = quotesData.filter(q => {
    // Category filter using descendants map
    if (activeCategory && categoryDescendants[activeCategory]) {
      if (!q.categories.some(c => categoryDescendants[activeCategory].has(c))) return false;
    }
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
    <div className={`quotes-container ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      {/* Left Sidebar */}
      <aside className="quotes-sidebar">
        <div className="sidebar-header">
          <h2 className="sidebar-title">Categories</h2>
          <button 
            className="mobile-close-sidebar" 
            onClick={() => handleSidebarOpen(false)}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>
        <div className="categories-tree">
          {categoriesData.map((topNode, i) => (
            <div key={i} className="sidebar-section">
              <div className="sidebar-section-title">{topNode.name}</div>
              {topNode.children && topNode.children.map((child, j) => (
                <CategoryNode key={j} node={child} activeCategory={activeCategory} setActiveCategory={setActiveCategory} categoryCounts={categoryCounts} level={0} closeSidebar={() => {
                  if (typeof window !== 'undefined' && window.innerWidth <= 600) {
                    handleSidebarOpen(false);
                  }
                }} />
              ))}
            </div>
          ))}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="quotes-main">
        {/* Top Header */}
        <header className="quotes-header">
          <button className="burger-toggle" onClick={() => handleSidebarOpen(!isSidebarOpen)}>
            {isSidebarOpen ? '✕' : '☰'}
          </button>
          
          <Link href="/" className="btn-home">
            <span className="home-icon">🏠</span><span className="home-text"> Home</span>
          </Link>
          
          <div className="header-center">
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="lang-select"
            >
              {Object.entries(LANG_LABELS).map(([code, label]) => (
                <option key={code} value={code}>{label}</option>
              ))}
            </select>
          </div>

          <div className="search-bar">
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
          <h1>{activeCategory}</h1>
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
                title={`Swami Vivekananda Quote on ${quote.categories.join(', ')}`}
              >
                <div className="quote-card-placeholder">
                  <img src={getOptimizedUrl(imgSrc, 400)} alt={`Swami Vivekananda Quote on ${quote.categories[0] || 'Spirituality'}`} loading="lazy" />
                </div>
                <span className="sr-only">Read Swami Vivekananda Quote on {quote.categories.join(', ')}</span>
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
