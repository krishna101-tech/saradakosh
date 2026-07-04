import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import ThemeSelector from '@/components/ThemeSelector';
import TodayInHistory from '@/components/TodayInHistory';
import SearchBar from '@/components/SearchBar';

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Saradakosh",
    "url": "https://www.saradakosh.org",
    "description": "The Lives, Teachings, and Legacy of Sri Ramakrishna, Sri Sarada Devi, and Swami Vivekananda",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://www.saradakosh.org/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <header 
        className="relative text-center pt-16 sm:pt-20 pb-10 sm:pb-15 px-5 border-b border-glass-border bg-cover bg-center [background-image:var(--header-grad),var(--hero-bg-url)]"
      >
        <ThemeSelector />
        <div className="relative z-10">
          <h1 className="font-serif text-5xl sm:text-6xl text-primary-theme font-extrabold mb-0 drop-shadow-[0_2px_10px_rgba(211,84,0,0.15)] animate-[fadeInDown_0.8s_ease-out]">
            Saradakosh
          </h1>
          <h2 className="font-light text-lg sm:text-xl opacity-80 animate-[fadeInUp_1s_ease-out] flex flex-col gap-1.5 line-height-relaxed mt-4 mb-10">
            <span>The Lives, Teachings, and Legacy of Sri Ramakrishna, Sri Sarada Devi, and Swami Vivekananda</span>
            <span className="text-[0.85em] opacity-90">A Historical and Spiritual Journey Through the First Century of the Ramakrishna Movement</span>
            <span className="text-[0.8em] opacity-70 tracking-widest">1836–1936</span>
          </h2>
          
          <div className="mb-10 flex flex-col items-center gap-2">
            <a 
              href="https://notebooklm.google.com/notebook/e341fff6-3ed6-483c-a6e7-733e9bdbacd4" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center justify-center font-sans font-bold rounded-lg text-lg py-3.5 sm:py-3 px-6 bg-gradient-to-br from-indigo-500 to-purple-600 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(99,102,241,0.5)] transition-all duration-300 text-white shadow-[0_4px_15px_rgba(99,102,241,0.4)] touch-manipulation"
            >
              <Sparkles className="size-5" /> Ask AI
            </a>
            <p className="text-sm text-text-theme opacity-90 max-w-[500px] margin-0 leading-normal font-medium">
              Click to chat with an interactive AI trained on the core literature of Sri Ramakrishna, Ma Sarada, and Swami Vivekananda.
            </p>
          </div>
          
          <div className="w-full max-w-[600px] mx-auto mb-5 text-left">
            <div className="mb-2.5 pl-5 font-bold text-primary-theme text-[0.85rem] uppercase tracking-[1.5px] opacity-80">
              Browse Local Archive
            </div>
            <SearchBar />
          </div>
        </div>
      </header>

      <main className="max-w-[1000px] mx-auto p-5 md:p-8">
        {/* Reports */}
        <h2 className="font-serif border-b border-glass-border pb-2.5 mt-12 text-center text-2xl sm:text-3xl text-primary-theme">
          Reports & Directories
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <Link href="/reports/refs" className="group relative block overflow-hidden rounded-xl border border-glass-border bg-glass-bg shadow-sm transition-all duration-400 hover:-translate-y-1.5 hover:border-primary-theme hover:shadow-lg">
            <img src="/images/book_refs.webp" alt="Sri Ramakrishna Vivekananda Literature" className="w-full aspect-[16/9] object-cover rounded-xl transition-transform duration-500 group-hover:scale-103 shadow-md" />
          </Link>
          <Link href="/reports/vivekananda" className="group relative block overflow-hidden rounded-xl border border-glass-border bg-glass-bg shadow-sm transition-all duration-400 hover:-translate-y-1.5 hover:border-primary-theme hover:shadow-lg">
            <img src="/images/vivekananda.webp" alt="Explore the Complete Life & Teachings of Swami Vivekananda 1863-1902" className="w-full aspect-[16/9] object-cover rounded-xl transition-transform duration-500 group-hover:scale-103 shadow-md" />
          </Link>
          <Link href="/quotes" className="group relative block overflow-hidden rounded-xl border border-glass-border bg-glass-bg shadow-sm transition-all duration-400 hover:-translate-y-1.5 hover:border-primary-theme hover:shadow-lg">
            <img src="/images/vivekananda_quotes.webp" alt="Vivekananda Quotes" className="w-full aspect-[16/9] object-cover rounded-xl transition-transform duration-500 group-hover:scale-103 shadow-md" />
          </Link>
          <Link href="/reports/mega-period" className="group relative block overflow-hidden rounded-xl border border-glass-border bg-glass-bg shadow-sm transition-all duration-400 hover:-translate-y-1.5 hover:border-primary-theme hover:shadow-lg">
            <img src="/images/mega_period.webp" alt="Main Periods in Ramakrishna Mission History" className="w-full aspect-[16/9] object-cover rounded-xl transition-transform duration-500 group-hover:scale-103 shadow-md" />
          </Link>
          <Link href="/schedule" target="_blank" rel="noopener noreferrer" className="group relative block overflow-hidden rounded-xl border border-glass-border bg-glass-bg shadow-sm transition-all duration-400 hover:-translate-y-1.5 hover:border-primary-theme hover:shadow-lg md:col-span-2 md:justify-self-center md:w-[calc(50%-12.5px)]">
            <img src="/images/click_to_reg.webp" alt="Click to Register" className="w-full aspect-[16/9] object-cover rounded-xl transition-transform duration-500 group-hover:scale-103 shadow-md" />
          </Link>
        </div>

        {/* Today in History */}
        <div className="mt-12">
          <TodayInHistory />
        </div>

        <footer className="mt-16 p-8 bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl shadow-sm text-center">
          <div className="mb-8 flex justify-center gap-6 text-sm font-sans font-semibold text-text-theme/75 border-b border-glass-border pb-6">
            <Link href="/" className="hover:text-primary-theme transition-colors no-underline">Home</Link>
            <Link href="/about" className="hover:text-primary-theme transition-colors no-underline">About & Sources</Link>
            <Link href="/quotes" className="hover:text-primary-theme transition-colors no-underline">Quotes</Link>
            <Link href="/schedule" className="hover:text-primary-theme transition-colors no-underline">Schedule</Link>
          </div>
          <h3 className="font-serif text-3xl text-primary-theme mb-8">Swami Vivekananda Quotes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            <div className="space-y-4">
              <h4 className="text-lg text-secondary-theme font-semibold border-b border-glass-border pb-2.5">On Self-Belief</h4>
              <blockquote className="italic text-base leading-relaxed pl-4 border-l-3 border-primary-theme text-text-theme opacity-90 my-4">"You cannot believe in God until you believe in yourself."</blockquote>
              <blockquote className="italic text-base leading-relaxed pl-4 border-l-3 border-primary-theme text-text-theme opacity-90 my-4">"Stand up, be bold, be strong. Take the whole responsibility on your own shoulders, and know that you are the creator of your own destiny."</blockquote>
              <blockquote className="italic text-base leading-relaxed pl-4 border-l-3 border-primary-theme text-text-theme opacity-90 my-4">"He is an atheist who does not believe in himself."</blockquote>
            </div>
            <div className="space-y-4">
              <h4 className="text-lg text-secondary-theme font-semibold border-b border-glass-border pb-2.5">On Strength and Courage</h4>
              <blockquote className="italic text-base leading-relaxed pl-4 border-l-3 border-primary-theme text-text-theme opacity-90 my-4">"The greatest sin is to think that you are weak."</blockquote>
              <blockquote className="italic text-base leading-relaxed pl-4 border-l-3 border-primary-theme text-text-theme opacity-90 my-4">"Arise, awake, and stop not until the goal is reached."</blockquote>
              <blockquote className="italic text-base leading-relaxed pl-4 border-l-3 border-primary-theme text-text-theme opacity-90 my-4">"Take up one idea. Make that one idea your life..."</blockquote>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
