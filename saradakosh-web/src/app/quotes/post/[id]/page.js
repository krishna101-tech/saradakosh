import React from 'react';
import Link from 'next/link';
import quotesData from '@/data/quotes.json';
import quoteContents from '@/data/quote_contents.json';
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

function extractPostData(quoteId) {
  return quoteContents[quoteId] || { paragraphs: [], title: '' };
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const quoteId = decodeURIComponent(resolvedParams.id);
  const quote = quotesData.find(q => q.id === quoteId);
  if (!quote) return {};

  const { title } = extractPostData(quoteId);
  const imagesObj = quote.images || {};
  const englishImage = imagesObj['eng'] || Object.values(imagesObj)[0];
  const availableLangs = Object.keys(imagesObj);

  const languagesAlternates = {};
  availableLangs.forEach(lang => {
    languagesAlternates[lang] = `https://saradakosh.org/quotes/post/${quoteId}?lang=${lang}`;
  });

  return {
    title: title || 'Swami Vivekananda Quote',
    description: 'Read and share this inspiring quote by Swami Vivekananda.',
    alternates: {
      canonical: `https://saradakosh.org/quotes/post/${quoteId}`,
      languages: languagesAlternates,
    },
    openGraph: {
      title: title || 'Swami Vivekananda Quote',
      description: 'Read and share this inspiring quote by Swami Vivekananda.',
      images: englishImage ? [englishImage] : [],
      url: `https://saradakosh.org/quotes/post/${quoteId}`,
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
      <div className="min-h-screen flex items-center justify-center bg-[#f9f3ed] font-serif">
        <div className="text-center p-15">
          <h2 className="text-2xl font-bold mb-4">Quote not found</h2>
          <Link href="/quotes" className="text-[#8b1a1a] hover:underline">← Back to Quotes</Link>
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

  const langOrder = ['eng', 'guj', 'hin', 'ben', 'tel', 'odi'];

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://saradakosh.org"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Quotes",
        "item": "https://saradakosh.org/quotes"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": title || "Swami Vivekananda Quote",
        "item": `https://saradakosh.org/quotes/post/${quoteId}`
      }
    ]
  };

  return (
    <div className="h-screen overflow-hidden bg-[#f9f3ed] text-[#1a0a00] font-serif max-md:h-auto max-md:min-h-screen max-md:overflow-visible max-md:bg-[#fdfbf7]">
      {/* Structured Data (JSON-LD) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Quotation",
            "text": paragraphs.join('\n'),
            "author": {
              "@type": "Person",
              "name": "Swami Vivekananda",
              "sameAs": "https://en.wikipedia.org/wiki/Swami_Vivekananda"
            }
          })
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Main Grid Layout */}
      <main className="max-w-[1200px] mx-auto mt-10 px-6 grid grid-cols-[140px_minmax(300px,450px)_1fr] gap-10 items-start max-md:grid-cols-1 max-md:mt-0 max-md:gap-6 max-md:px-4 max-md:pb-15">
        
        {/* COLUMN 1: Buttons */}
        <div className="flex flex-col gap-3 max-md:w-full max-md:gap-4 max-md:mt-4">
          
          {/* Language Switcher */}
          {availableLangs.length > 1 && (
            <div className="flex flex-wrap justify-center gap-2.5 w-full max-md:gap-2">
              <div className="hidden md:block w-full text-[0.75rem] font-bold text-[#8b1a1a] uppercase tracking-wider text-center mb-1">
                Languages
              </div>
              {availableLangs.map(lang => (
                <Link 
                  key={lang} 
                  href={`/quotes/post/${quoteId}?lang=${lang}`} 
                  className={`flex-grow md:w-full py-2 px-3 rounded-full text-center text-xs transition-all duration-200 border ${
                    lang === primaryLang 
                      ? 'font-bold bg-[#8b1a1a] text-white border-transparent' 
                      : 'bg-white text-[#8b1a1a] border-[#8b1a1a]/25 hover:bg-[#8b1a1a]/5'
                  }`}
                >
                  {LANG_LABELS[lang] || lang}
                </Link>
              ))}
            </div>
          )}

          <div className="hidden md:block border-b border-dashed border-[#8b1a1a]/30 my-1.5" />

          <div className="flex flex-col gap-2.5 w-full max-md:flex-row max-md:gap-1.5">
            <Link href="/quotes" className="flex-1 flex items-center justify-center gap-1.5 min-h-[44px] rounded-full font-bold text-xs bg-white text-[#8b1a1a] border border-[#8b1a1a] cursor-pointer hover:bg-[#8b1a1a]/5 transition-all duration-150 active:scale-95 max-md:min-h-[40px] max-md:text-[0.78rem]">
              <span>&larr;</span> All Quotes
            </Link>

            <PostActions imageUrl={images[primaryLang]} />
          </div>
        </div>

        {/* COLUMN 2: Image */}
        <div className="flex justify-center max-md:order-1 max-md:mt-2.5">
          {primaryLang && images[primaryLang] && (
            <div className="flex justify-center">
              <img 
                src={getOptimizedUrl(images[primaryLang], 1200)} 
                alt={`Swami Vivekananda Quote - ${title || 'Post'}`} 
                className="max-w-full max-h-[calc(100vh-80px)] object-contain block rounded-lg shadow-xl max-md:rounded-2xl max-md:shadow-2xl max-md:border-4 max-md:border-white" 
              />
            </div>
          )}
        </div>

        {/* COLUMN 3: Text */}
        <div className="flex flex-col gap-7 h-[calc(100vh-80px)] overflow-y-auto pr-5 pb-15 max-md:order-3 max-md:h-auto max-md:overflow-y-visible max-md:p-7 max-md:bg-white max-md:rounded-3xl max-md:shadow-sm max-md:mt-2.5 scrollbar-thin">
          {paragraphs.length > 0 ? (
            paragraphs.map((text, i) => {
              const lang = langOrder[i];
              return (
                <div key={i}>
                  <p className={`m-0 leading-relaxed text-justify text-[#1a0a00] ${
                    lang === 'eng' ? 'text-[1.08rem] font-serif' : 'text-base font-sans'
                  }`}>{text}</p>
                  {i < paragraphs.length - 1 && (
                    <div className="mt-5 border-b border-dashed border-[#8b1a1a]/20" />
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-gray-500 italic py-10">
              Text not available for this quote.
            </div>
          )}

          {/* Source / categories */}
          {quote.categories.length > 0 && (
            <div className="mt-2 pt-5 border-t border-[#8b1a1a]/20">
              <div className="text-[0.78rem] text-[#8b4513] mb-2.5 uppercase tracking-wider font-sans font-semibold">Categories</div>
              <div className="flex flex-wrap gap-2">
                {quote.categories.map((cat, i) => (
                  <Link 
                    key={i} 
                    href={`/quotes?cat=${encodeURIComponent(cat)}`} 
                    className="bg-[#8b1a1a]/8 border border-[#8b1a1a]/20 text-[#8b1a1a] py-1 px-3.5 rounded-full text-xs hover:bg-[#8b1a1a]/15 transition-colors font-medium font-sans no-underline"
                  >
                    {cat}
                  </Link>
                ))}
              </div>
              <div className="mt-8 pt-4 border-t border-dashed border-[#8b1a1a]/10 text-right">
                <Link 
                  href={`/about?ref=${encodeURIComponent(`/quotes/post/${quoteId}`)}&type=correction`}
                  className="text-xs text-[#8b1a1a]/60 hover:text-[#8b1a1a] hover:underline transition-colors font-sans"
                >
                  ✏️ Suggest a correction
                </Link>
              </div>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
