import React from 'react';
import Link from 'next/link';
import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';
import quotesData from '@/data/quotes.json';
import PostActions from './PostActions';

const LANG_LABELS = {
  eng: 'English', guj: 'Gujarati', hin: 'Hindi',
  ben: 'Bengali', tel: 'Telugu', odi: 'Odia',
};

function getOptimizedUrl(url, width) {
  if (!url || !url.includes('/upload/')) return url;
  const transform = width ? `c_scale,w_${width},f_auto,q_auto` : `f_auto,q_auto`;
  return url.replace('/upload/', `/upload/${transform}/`);
}

const LOCAL_SITE_ROOT = path.join(
  process.cwd(), '..', '..', 'viv live website',
  'vivekananda_live_website', 'vivekananda.live'
);

function extractPostData(quoteId) {
  const htmlPath = path.join(LOCAL_SITE_ROOT, quoteId, 'index.html');
  if (!fs.existsSync(htmlPath)) return { paragraphs: [], title: '' };

  // Read directly as utf-8 (fixes mangled punctuation and & symbols)
  const html = fs.readFileSync(htmlPath, 'utf8');
  const $ = cheerio.load(html);

  // Title from <title> or h1
  const title = $('h1.post-title, h1.entry-title, .post-title').first().text().trim()
    || $('title').text().replace(/–.*Vivekananda.*$/i, '').replace(/–.*$/,'').trim();

  // Extract all paragraphs from post-content
  const paragraphs = [];
  $('.post-content p').each((_, el) => {
    const txt = $(el).text().trim();
    if (txt && txt.length > 20) paragraphs.push(txt);
  });

  return { paragraphs, title };
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const quoteId = decodeURIComponent(resolvedParams.id);
  const quote = quotesData.find(q => q.id === quoteId);
  if (!quote) return {};

  const { title } = extractPostData(quoteId);
  const imagesObj = quote.images || {};
  const englishImage = imagesObj['eng'] || Object.values(imagesObj)[0];

  return {
    title: title || 'Swami Vivekananda Quote',
    description: 'Read and share this inspiring quote by Swami Vivekananda.',
    openGraph: {
      title: title || 'Swami Vivekananda Quote',
      description: 'Read and share this inspiring quote by Swami Vivekananda.',
      images: englishImage ? [englishImage] : [],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      images: englishImage ? [englishImage] : [],
    }
  };
}

export default async function QuotePostPage({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;
  const quoteId = decodeURIComponent(resolvedParams.id);
  const quote = quotesData.find(q => q.id === quoteId);

  if (!quote) {
    return (
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f9f3ed', fontFamily:'Georgia,serif' }}>
        <div style={{ textAlign:'center', padding:'60px' }}>
          <h2>Quote not found</h2>
          <Link href="/quotes" style={{ color:'#8b1a1a' }}>← Back to Quotes</Link>
        </div>
      </div>
    );
  }

  const images = quote.images || {};
  const requestedLang = resolvedSearch?.lang || 'eng';
  const primaryLang = images[requestedLang] ? requestedLang
    : images['eng'] ? 'eng'
    : Object.keys(images)[0] || null;
  const availableLangs = Object.keys(images);

  const { paragraphs, title } = extractPostData(quoteId);

  // Map paragraphs to languages in order: eng, guj, hin, ben, tel, odi
  const langOrder = ['eng', 'guj', 'hin', 'ben', 'tel', 'odi'];
  const langTexts = {};
  paragraphs.forEach((p, i) => {
    if (i < langOrder.length) langTexts[langOrder[i]] = p;
  });

  return (
    <div className="post-page-container" style={{ fontFamily:'Georgia, serif', color:'#1a0a00' }}>
      <style>{`
        .post-page-container {
          height: 100vh; 
          overflow: hidden; 
          background: #f9f3ed;
        }
        .post-layout {
          max-width: 1200px; margin: 40px auto 0; padding: 0 24px;
          display: grid;
          grid-template-columns: 140px minmax(300px, 450px) 1fr;
          gap: 40px;
          align-items: start;
        }
        .post-buttons { display: flex; flex-direction: column; gap: 12px; }
        .post-image { display: flex; justify-content: center; }
        .post-text { 
          display: flex; flex-direction: column; gap: 28px; 
          height: calc(100vh - 80px); 
          overflow-y: auto; 
          padding-right: 20px; 
          padding-bottom: 60px;
        }
        
        /* Scrollbar styling for text area */
        .post-text::-webkit-scrollbar {
          width: 6px;
        }
        .post-text::-webkit-scrollbar-track {
          background: rgba(139,26,26,0.05);
          border-radius: 10px;
        }
        .post-text::-webkit-scrollbar-thumb {
          background: rgba(139,26,26,0.3);
          border-radius: 10px;
        }
        .post-text::-webkit-scrollbar-thumb:hover {
          background: rgba(139,26,26,0.5);
        }

        /* Shared Action Button Styles */
        .action-buttons-container { display: flex; flex-direction: column; gap: 10px; width: 100%; }
        .action-btn {
          flex: 1; display: flex; align-items: center; justify-content: center; gap: 4px;
          min-height: 44px; border-radius: 22px; font-weight: bold; font-size: 0.85rem;
          text-decoration: none; cursor: pointer; box-sizing: border-box; white-space: nowrap;
          padding: 0 10px; transition: transform 0.1s ease, box-shadow 0.2s ease;
          border: 1.5px solid transparent; outline: none;
        }
        .action-btn:active { transform: scale(0.96); }
        .action-btn.btn-outline { background: #fff; color: #8b1a1a; border-color: #8b1a1a; }
        .action-btn.btn-primary { background: #8b1a1a; color: #fff; box-shadow: 0 4px 12px rgba(139,26,26,0.15); }
        .action-btn.btn-accent { background: #f5c518; color: #6a1010; box-shadow: 0 4px 12px rgba(245,197,24,0.2); }

        /* Shared Language Button Styles */
        .lang-wrapper { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; width: 100%; }
        .lang-btn {
          flex: 1 1 auto; min-width: 60px; padding: 10px 14px; border-radius: 22px;
          text-decoration: none; text-align: center; font-size: 0.85rem;
          transition: all 0.2s ease; border: 1px solid transparent; box-sizing: border-box;
        }

        @media (max-width: 900px) {
          .post-page-container { height: auto; min-height: 100vh; overflow: visible; background: #fdfbf7; }
          .desktop-only { display: none !important; }
          .post-layout {
            grid-template-columns: 1fr;
            margin: 0;
            gap: 24px;
            padding: 0 16px 60px;
          }
          
          /* Floating Image */
          .post-image { order: 1; margin-top: 10px; }
          .post-image img {
            border-radius: 16px !important;
            box-shadow: 0 16px 40px rgba(0,0,0,0.12) !important;
            border: 4px solid #fff;
          }

          /* Actions Row */
          .post-buttons { flex-direction: column; order: 2; width: 100%; gap: 16px; }
          .action-buttons-container { flex-direction: row !important; gap: 6px; }
          .action-btn { padding: 0 4px; font-size: 0.78rem; min-height: 40px; border-width: 1.5px; }
          
          /* Languages Wrapping */
          .lang-wrapper { gap: 8px; }
          .lang-btn { padding: 8px 10px; font-size: 0.8rem; }

          /* Elegant Text Card */
          .post-text { 
            order: 3; height: auto; overflow-y: visible; 
            padding: 30px 24px;
            background: #fff;
            border-radius: 24px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.05);
            margin-top: 10px;
          }
        }
      `}</style>

      {/* Main Grid Layout */}
      <div className="post-layout">
        
        {/* COLUMN 1: Buttons */}
        <div className="post-buttons">
          
          {/* Language Switcher */}
          {availableLangs.length > 1 && (
            <div className="lang-wrapper">
              <div className="desktop-only" style={{ width:'100%', fontSize:'0.75rem', fontWeight:'bold', color:'#8b1a1a', textTransform:'uppercase', letterSpacing:'1px', textAlign:'center', marginBottom:'4px' }}>Languages</div>
              {availableLangs.map(lang => (
                <Link key={lang} href={`/quotes/post/${quoteId}?lang=${lang}`} className="lang-btn" style={{
                  fontWeight: lang === primaryLang ? 'bold' : 'normal',
                  background: lang === primaryLang ? '#8b1a1a' : '#fff',
                  color: lang === primaryLang ? '#fff' : '#8b1a1a',
                  border: lang === primaryLang ? '1px solid transparent' : '1px solid rgba(139,26,26,0.25)',
                }}>{LANG_LABELS[lang] || lang}</Link>
              ))}
            </div>
          )}

          <div className="desktop-only" style={{ borderBottom:'1px dashed rgba(139,26,26,0.3)', margin:'6px 0' }} />

          <div className="action-buttons-container">
            <Link href="/quotes" className="action-btn btn-outline">
              <span style={{ fontSize:'1.1rem', lineHeight:0 }}>←</span> All Quotes
            </Link>

            <PostActions imageUrl={images[primaryLang]} />
          </div>
        </div>

        {/* COLUMN 2: Image */}
        <div className="post-image">
          {primaryLang && images[primaryLang] && (
            <div style={{ display:'flex', justifyContent:'center' }}>
              <img src={getOptimizedUrl(images[primaryLang], 1200)} alt="Quote" style={{ maxWidth:'100%', maxHeight:'calc(100vh - 80px)', objectFit:'contain', display:'block', borderRadius:'8px', boxShadow:'0 8px 32px rgba(0,0,0,0.18)' }} priority="true" />
            </div>
          )}
        </div>

        {/* COLUMN 3: Text */}
        <div className="post-text">
          {paragraphs.length > 0 ? (
            paragraphs.map((text, i) => {
              const lang = langOrder[i];
              return (
                <div key={i}>
                  <p style={{
                    margin:0,
                    fontSize: lang === 'eng' ? '1.08rem' : '1rem',
                    lineHeight: '1.9',
                    color: '#1a0a00',
                    textAlign: 'justify',
                    fontFamily: lang === 'eng' ? 'Georgia, serif' : 'inherit',
                  }}>{text}</p>
                  {i < paragraphs.length - 1 && (
                    <div style={{ marginTop:'20px', borderBottom:'1px dashed rgba(139,26,26,0.2)' }} />
                  )}
                </div>
              );
            })
          ) : (
            <div style={{ color:'#888', fontStyle:'italic', padding:'40px 0' }}>
              Text not available for this quote.
            </div>
          )}

          {/* Source / categories */}
          {quote.categories.length > 0 && (
            <div style={{ marginTop:'8px', paddingTop:'20px', borderTop:'1px solid rgba(139,26,26,0.2)' }}>
              <div style={{ fontSize:'0.78rem', color:'#8b4513', marginBottom:'10px', textTransform:'uppercase', letterSpacing:'1.5px' }}>Categories</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
                {quote.categories.map((cat, i) => (
                  <Link key={i} href={`/quotes?cat=${encodeURIComponent(cat)}`} style={{
                    background:'rgba(139,26,26,0.08)', border:'1px solid rgba(139,26,26,0.2)',
                    color:'#8b1a1a', padding:'4px 14px', borderRadius:'20px',
                    fontSize:'0.8rem', textDecoration:'none', fontWeight:'500',
                  }}>{cat}</Link>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
