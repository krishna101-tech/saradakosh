'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import quotesData from '@/data/quotes.json';
import SectionHeading from '@/components/SectionHeading';

const AUTOPLAY_INTERVAL = 4000;

function getOptimizedUrl(url, width) {
  if (!url || !url.includes('/upload/')) return url;
  const transform = width ? `c_scale,w_${width},f_auto,q_auto` : `f_auto,q_auto`;
  return url.replace('/upload/', `/upload/${transform}/`);
}

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function QuoteCarousel() {
  const [quotes, setQuotes] = useState([]);
  const [language, setLanguage] = useState('eng');
  const scrollRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedLang = localStorage.getItem('sk_quote_lang') || 'eng';
    setLanguage(savedLang);

    const validQuotes = quotesData.filter(q => {
      const imgs = q.images || {};
      return !!imgs[savedLang];
    });

    const shuffled = shuffleArray(validQuotes);
    setQuotes(shuffled.slice(0, 10)); // up to 10 quotes
  }, []);

  useEffect(() => {
    if (quotes.length <= 1) return;
    
    if (isHovered) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        // If reached the end, scroll back to start, else scroll right by one card's width approx
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          // scroll by approximately 1 card width (client width on mobile, 1/4 on desktop)
          const scrollAmount = window.innerWidth < 768 ? clientWidth * 0.85 : clientWidth * 0.25;
          scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
      }
    }, AUTOPLAY_INTERVAL);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isHovered, quotes.length]);

  const scrollLeft = () => {
    if (scrollRef.current) {
      const scrollAmount = window.innerWidth < 768 ? scrollRef.current.clientWidth * 0.85 : scrollRef.current.clientWidth * 0.25;
      scrollRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      const scrollAmount = window.innerWidth < 768 ? scrollRef.current.clientWidth * 0.85 : scrollRef.current.clientWidth * 0.25;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (quotes.length === 0) return null;

  return (
    <section className="w-full max-w-[1400px] mx-auto my-12 px-4 sm:px-6 relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <SectionHeading>Vivekananda for You</SectionHeading>

      <div className="relative">
        {/* Navigation Arrows */}
        {quotes.length > 4 && (
          <>
            <button
              onClick={scrollLeft}
              className="absolute -left-4 sm:left-[-1rem] top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-bg-theme/80 text-primary-theme shadow-md backdrop-blur-sm border border-glass-border transition-colors duration-300 hover:bg-bg-theme z-10"
              aria-label="Scroll Left"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={scrollRight}
              className="absolute -right-4 sm:right-[-1rem] top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-bg-theme/80 text-primary-theme shadow-md backdrop-blur-sm border border-glass-border transition-colors duration-300 hover:bg-bg-theme z-10"
              aria-label="Scroll Right"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        <div 
          ref={scrollRef}
          className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-6 scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] items-start"
        >
          {quotes.map(quote => (
            <Link 
              key={quote.id}
              href={`/quotes/post/${quote.id}?lang=${language}`}
              className="snap-start shrink-0 w-[85%] md:w-[calc(25%-0.75rem)] relative block group/card card-interactive"
            >
              <img
                src={getOptimizedUrl(quote.images[language], 600)}
                alt={`Quote card in ${language}`}
                className="w-full h-auto object-cover"
                draggable={false}
              />
              <div className="absolute inset-0 bg-black/0 group-hover/card:bg-black/5 transition-colors duration-300" />
            </Link>
          ))}
        </div>
      </div>
      
      <div className="mt-2 text-center">
        <Link href="/quotes" className="btn-secondary">
          Explore All Quotes
        </Link>
      </div>
    </section>
  );
}
