/* eslint-disable */
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Home, Search, ChevronRight, X, Menu } from 'lucide-react';

import categoriesData from '@/data/categories.json';
import quotesData from '@/data/quotes.json';
import quoteContents from '@/data/quote_contents.json';
import { StaggerContainer, StaggerItem } from '@/components/MotionWrapper';

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
    <div className="text-bg-theme/80">
      <div
        className={`flex justify-between items-center py-2 px-3.5 cursor-pointer text-[0.88rem] leading-[1.35] transition-all duration-200 ${
          level === 0
            ? `text-[0.9rem] font-bold text-bg-theme border-b border-bg-theme/7 hover:bg-bg-theme/8 ${isActive ? 'bg-bg-theme/15' : ''}`
            : `text-bg-theme/80 border-b border-bg-theme/3 hover:bg-bg-theme/10 hover:text-bg-theme hover:[&_.cat-count]:opacity-100 ${
                isActive ? 'bg-quotes-accent !text-quotes-primary [&_.cat-count]:opacity-90 [&_.cat-count]:text-quotes-primary' : ''
              }`
        }`}
        onClick={handleClick}
        style={{ paddingLeft: `${16 + (level * 16)}px`, paddingRight: '16px' }}
      >
        <span className="grow">
          {node.name} <span className="opacity-70 text-[0.8em] ml-1 font-normal cat-count">({count})</span>
        </span>
        {hasChildren && (
          <span className={`transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}>
            <ChevronRight className="size-4" />
          </span>
        )}
      </div>
      {hasChildren && (
        <div className={`grid transition-[grid-template-rows] duration-300 ease-out bg-bg-theme/10 ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
          <div className="overflow-hidden">
            {node.children.map((child, i) => (
              <CategoryNode 
                key={i} 
                node={child} 
                activeCategory={activeCategory} 
                setActiveCategory={setActiveCategory} 
                closeSidebar={closeSidebar} 
                level={level + 1} 
                categoryCounts={categoryCounts} 
              />
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
    
    const savedLang = localStorage.getItem('sk_quote_lang');
    if (savedLang && LANG_LABELS[savedLang]) {
      setSelectedLanguage(savedLang);
    }
  }, [searchParams]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('sk_quote_lang', selectedLanguage);
  }, [selectedLanguage]);

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
        const displayLang = imgs[selectedLanguage] ? selectedLanguage : imgs['eng'] ? 'eng' : imgs['hin'] ? 'hin' : imgs['ben'] ? 'ben' : imgs['guj'] ? 'guj' : Object.keys(imgs)[0];
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
    
    // Search filter
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      const content = quoteContents[q.id];
      if (!content) return false;
      
      const textToSearch = (content.title + " " + content.paragraphs.join(" ")).toLowerCase();
      if (!textToSearch.includes(term)) {
        return false;
      }
    }
    // Must have at least one image
    const imgs = q.images || {};
    if (Object.keys(imgs).length === 0) return false;
    // Determine display image
    const displayLang = imgs[selectedLanguage] ? selectedLanguage
      : imgs['eng'] ? 'eng'
      : imgs['hin'] ? 'hin'
      : imgs['ben'] ? 'ben'
      : imgs['guj'] ? 'guj'
      : Object.keys(imgs)[0];
    const imgSrc = imgs[displayLang];
    if (!imgSrc) return false;
    // Skip if this exact image was already used (dedup)
    if (seenImages.has(imgSrc)) return false;
    seenImages.add(imgSrc);
    return true;
  });

  return (
    <div className="flex h-screen overflow-hidden bg-background text-text-theme font-sans">
      {/* Left Sidebar */}
      <aside className={`bg-quotes-primary text-bg-theme shrink-0 min-h-screen p-0 transition-[width] duration-300 ease-out overflow-hidden max-sm:fixed max-sm:top-0 max-sm:left-0 max-sm:w-screen max-sm:h-screen max-sm:z-[1000] max-sm:flex max-sm:flex-col ${
        isSidebarOpen 
          ? 'w-[320px] max-sm:translate-x-0' 
          : 'w-0 max-sm:-translate-x-full'
      }`}>
        <div className="flex justify-between items-center px-2.5 py-2 border-b border-bg-theme/15">
          <h2 className="text-[0.85rem] m-0 font-bold">Categories</h2>
          <button 
            className="hidden max-sm:block bg-transparent border-none text-bg-theme cursor-pointer px-3" 
            onClick={() => handleSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X className="size-5" />
          </button>
        </div>
        <StaggerContainer className="overflow-y-auto max-h-[calc(100vh-40px)] pb-10 scrollbar-thin scrollbar-thumb-white-20 scrollbar-track-transparent" delay={0.08}>
          {categoriesData.map((topNode, i) => (
            <StaggerItem key={i} className="mb-6">
              <div className="font-bold text-[0.9rem] text-bg-theme/80 px-3.5 pt-4 pb-2 uppercase tracking-[0.5px] border-b border-bg-theme/10 mb-1">
                {topNode.name}
              </div>
              {topNode.children && topNode.children.map((child, j) => (
                <CategoryNode 
                  key={j} 
                  node={child} 
                  activeCategory={activeCategory} 
                  setActiveCategory={setActiveCategory} 
                  categoryCounts={categoryCounts} 
                  level={0} 
                  closeSidebar={() => {
                    if (typeof window !== 'undefined' && window.innerWidth <= 600) {
                      handleSidebarOpen(false);
                    }
                  }} 
                />
              ))}
            </StaggerItem>
          ))}
        </StaggerContainer>
      </aside>

      {/* Main Content Area */}
      <main className="grow flex flex-col min-w-0 h-screen overflow-y-auto scrollbar-thin scrollbar-thumb-primary-35 scrollbar-track-transparent">
        {/* Top Header */}
        <header className="bg-quotes-accent px-3.5 py-1.5 flex justify-between items-center gap-2.5 max-sm:flex-wrap">
          <button 
            className="bg-transparent border-none cursor-pointer text-quotes-primary px-1 flex items-center order-1" 
            onClick={() => handleSidebarOpen(!isSidebarOpen)}
            aria-label="Toggle menu"
          >
            {isSidebarOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
          
          <Link href="/" className="inline-flex items-center gap-1 px-3.5 py-1 bg-quotes-primary text-bg-theme no-underline rounded font-bold text-[0.82rem] order-2 hover:opacity-90 transition-colors">
            <Home className="size-4" /><span className="max-sm:hidden"> Home</span>
          </Link>
          
          <div className="grow flex justify-center order-3">
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="py-1 px-3 rounded-[20px] border border-quotes-primary/40 bg-card font-semibold text-[0.9rem] text-text-theme cursor-pointer outline-none transition-all duration-200 hover:border-quotes-primary focus:border-quotes-primary"
            >
              {Object.entries(LANG_LABELS).map(([code, label]) => (
                <option key={code} value={code}>{label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 order-4 max-sm:w-full max-sm:mt-2.5 max-sm:justify-center">
            <input
              type="text"
              placeholder="Search quotes..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="py-1 px-2 border border-border rounded-l w-[180px] max-sm:w-full max-sm:max-w-[300px] outline-none text-[0.82rem] bg-card text-text-theme"
            />
            <button aria-label="Search" className="py-1 px-3 bg-quotes-primary text-bg-theme border-none rounded-r cursor-pointer flex items-center justify-center"><Search className="size-4" /></button>
          </div>
        </header>

        {/* Category Title Area */}
        <div className="pt-3.5 px-2.5 pb-2 text-center">
          <h1 className="text-[1.7rem] text-quotes-primary m-0 mb-1 font-serif max-sm:text-[1.3rem]">{activeCategory}</h1>
          <p className="text-text-theme/75 text-[0.9rem] m-0">(Total Quotes — {displayedQuotes.length})</p>
        </div>

        {/* Quotes Grid */}
        <StaggerContainer 
          className={`grid gap-0 p-0 w-full transition-[grid-template-columns] duration-300 ease-out ${
            isSidebarOpen 
              ? 'grid-cols-4 max-lg:grid-cols-3 max-sm:grid-cols-2' 
              : 'grid-cols-5 max-lg:grid-cols-4 max-sm:grid-cols-2'
          }`}
          delay={0.04}
        >
          {displayedQuotes.map((quote, index) => {
            const imgs = quote.images || {};
            const displayLang = imgs[selectedLanguage] ? selectedLanguage
              : imgs['eng'] ? 'eng'
              : imgs['hin'] ? 'hin'
              : imgs['ben'] ? 'ben'
              : imgs['guj'] ? 'guj'
              : Object.keys(imgs)[0];
            const imgSrc = imgs[displayLang];
            if (!imgSrc) return null;

            const isAnimated = index < 12; // Stagger first 12 cards (approx. one viewport page)
            const cardEl = (
              <Link
                href={`/quotes/post/${quote.id}?lang=${displayLang}`}
                className="block overflow-hidden hover:[&_img]:opacity-92"
                title={`Swami Vivekananda Quote on ${quote.categories.join(', ')}`}
              >
                <div className="w-full block">
                  <img 
                    src={getOptimizedUrl(imgSrc, 400)} 
                    alt={`Swami Vivekananda Quote on ${quote.categories[0] || 'Spirituality'}`} 
                    loading="lazy" 
                    className="w-full h-auto block transition-all duration-200 hover:scale-[1.02] hover:opacity-90"
                  />
                </div>
                <span className="sr-only">Read Swami Vivekananda Quote on {quote.categories.join(', ')}</span>
              </Link>
            );

            return isAnimated ? (
              <StaggerItem key={quote.id}>{cardEl}</StaggerItem>
            ) : (
              <div key={quote.id}>{cardEl}</div>
            );
          })}
          {displayedQuotes.length === 0 && (
            <div className="col-span-full text-center py-15 px-5 text-text-theme/60 text-sm">
              <p>No quotes found for this category.</p>
            </div>
          )}
        </StaggerContainer>
      </main>
    </div>
  );
}

