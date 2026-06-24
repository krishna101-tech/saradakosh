import React from 'react';
import Link from 'next/link';
import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';
import quotesData from '@/data/quotes.json';

const LANG_LABELS = {
  eng: 'English', guj: 'Gujarati', hin: 'Hindi',
  ben: 'Bengali', tel: 'Telugu', odi: 'Odia',
};

const LOCAL_SITE_ROOT = path.join(
  process.cwd(), '..', '..', 'viv live website',
  'vivekananda_live_website', 'vivekananda.live'
);

function extractPostData(quoteId) {
  const htmlPath = path.join(LOCAL_SITE_ROOT, quoteId, 'index.html');
  if (!fs.existsSync(htmlPath)) return { paragraphs: [], title: '' };

  // Read as latin1 bytes then convert to utf-8
  const raw = fs.readFileSync(htmlPath, 'latin1');
  const html = Buffer.from(raw, 'latin1').toString('utf8');
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
    <div style={{ minHeight:'100vh', background:'#f9f3ed', fontFamily:'Georgia, serif', color:'#1a0a00' }}>

      {/* Slim top bar */}
      <div style={{
        background:'linear-gradient(90deg,#8b1a1a,#c0392b)',
        padding:'10px 24px', display:'flex', alignItems:'center', gap:'16px',
        boxShadow:'0 2px 12px rgba(0,0,0,0.2)',
      }}>
        <Link href="/quotes" style={{ color:'#fff', textDecoration:'none', fontWeight:'bold', background:'rgba(255,255,255,0.2)', padding:'7px 18px', borderRadius:'30px', fontSize:'0.9rem', whiteSpace:'nowrap' }}>
          ← All Quotes
        </Link>
        <span style={{ color:'rgba(255,255,255,0.8)', fontSize:'0.82rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
          {quote.categories.filter(c => !c.match(/[^\x00-\x7F]/)).slice(0,3).join(' · ')}
        </span>
      </div>

      {/* Page title */}
      {title && (
        <div style={{ textAlign:'center', padding:'28px 20px 0', fontSize:'1rem', color:'#5a2a00', letterSpacing:'0.5px' }}>
          {title}
        </div>
      )}

      {/* Main layout: image left, text right */}
      <div style={{
        maxWidth:'1000px', margin:'24px auto 0', padding:'0 24px 48px',
        display:'grid',
        gridTemplateColumns: primaryLang && images[primaryLang] ? 'repeat(auto-fit, minmax(320px, 1fr))' : '1fr',
        gap:'40px', alignItems:'start',
      }}>

        {/* LEFT: Quote image */}
        {primaryLang && images[primaryLang] && (
          <div>
            <div style={{ borderRadius:'8px', overflow:'hidden', boxShadow:'0 8px 32px rgba(0,0,0,0.18)', marginBottom:'16px' }}>
              <img src={images[primaryLang]} alt="Quote" style={{ width:'100%', height:'auto', display:'block' }} />
            </div>

            {/* Language image switcher */}
            {availableLangs.length > 1 && (
              <div style={{ display:'flex', flexWrap:'wrap', gap:'8px', justifyContent:'center' }}>
                {availableLangs.map(lang => (
                  <Link key={lang} href={`/quotes/post/${quoteId}?lang=${lang}`} style={{
                    padding:'5px 14px', borderRadius:'20px', textDecoration:'none',
                    fontSize:'0.78rem', fontWeight: lang === primaryLang ? 'bold' : 'normal',
                    background: lang === primaryLang ? '#8b1a1a' : 'rgba(139,26,26,0.1)',
                    color: lang === primaryLang ? '#fff' : '#8b1a1a',
                    border:'1px solid', borderColor: lang === primaryLang ? 'transparent' : 'rgba(139,26,26,0.3)',
                  }}>{LANG_LABELS[lang] || lang}</Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* RIGHT: All translations stacked */}
        <div style={{ display:'flex', flexDirection:'column', gap:'28px' }}>
          {paragraphs.length > 0 ? (
            paragraphs.map((text, i) => {
              const lang = langOrder[i];
              const langLabel = LANG_LABELS[lang] || `Translation ${i+1}`;
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
