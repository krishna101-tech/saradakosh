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
      <header className="relative py-12 px-6 sm:px-8 border-b border-glass-border max-w-5xl mx-auto bg-bg-theme">
        <ThemeSelector />
        <div className="grid grid-cols-1 md:grid-cols-[1fr_260px] gap-8 items-center max-w-4xl mx-auto pt-8">
          <div className="text-left space-y-4">
            <h1 className="font-serif text-5xl sm:text-6xl text-primary-theme font-extrabold mb-0 tracking-tight leading-none">
              Saradakosh
            </h1>
            <h2 className="font-light text-base sm:text-lg text-text-theme/90 flex flex-col gap-2.5 leading-relaxed pt-2">
              <span className="font-serif italic text-lg text-secondary-theme font-semibold">The Lives, Teachings, and Legacy of Sri Ramakrishna, Sri Sarada Devi, and Swami Vivekananda</span>
              <span>A Historical and Spiritual Journey Through the First Century of the Ramakrishna Movement</span>
              <span className="text-sm font-bold tracking-widest text-primary-theme/75">1836–1936</span>
            </h2>
            
            <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <a 
                href="https://notebooklm.google.com/notebook/e341fff6-3ed6-483c-a6e7-733e9bdbacd4" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center justify-center font-sans font-bold rounded-md text-base py-3 px-5 bg-primary-theme text-bg-theme hover:opacity-95 transition-all duration-300 touch-manipulation"
              >
                <Sparkles className="size-4 mr-2" /> Ask AI
              </a>
              <p className="text-xs text-text-theme/80 max-w-[400px] leading-normal font-medium">
                Click to chat with an interactive AI trained on the core literature of Sri Ramakrishna, Ma Sarada, and Swami Vivekananda.
              </p>
            </div>
          </div>
          
          <div className="flex justify-center md:justify-end">
            <div className="border border-primary-theme p-1 bg-white dark:bg-transparent max-w-[240px] md:max-w-none">
              <img 
                src="/images/woodblock_hero_illustration.png" 
                alt="Woodblock illustration of Saradakosh Archive" 
                className="w-full h-auto object-cover opacity-90 mix-blend-multiply dark:mix-blend-normal"
              />
            </div>
          </div>
        </div>
        
        <div className="w-full max-w-[600px] mt-10 text-left">
          <div className="mb-2 pl-1 font-bold text-primary-theme text-[0.8rem] uppercase tracking-[1.5px] opacity-80">
            Browse Local Archive
          </div>
          <SearchBar />
        </div>
      </header>

      <main className="max-w-[1000px] mx-auto p-5 md:p-8">
        {/* Reports */}
        <h2 className="font-serif border-b border-glass-border pb-2.5 mt-12 text-center text-2xl sm:text-3xl text-primary-theme">
          Reports & Directories
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <Link href="/reports/refs" className="relative block overflow-hidden rounded-md border border-glass-border bg-glass-bg hover:border-primary-theme/60 transition-colors duration-200">
            <img src="/images/book_refs.webp" alt="Sri Ramakrishna Vivekananda Literature" className="w-full aspect-[16/9] object-cover rounded-t-md opacity-95" />
          </Link>
          <Link href="/reports/vivekananda" className="relative block overflow-hidden rounded-md border border-glass-border bg-glass-bg hover:border-primary-theme/60 transition-colors duration-200">
            <img src="/images/vivekananda.webp" alt="Explore the Complete Life & Teachings of Swami Vivekananda 1863-1902" className="w-full aspect-[16/9] object-cover rounded-t-md opacity-95" />
          </Link>
          <Link href="/quotes" className="relative block overflow-hidden rounded-md border border-glass-border bg-glass-bg hover:border-primary-theme/60 transition-colors duration-200">
            <img src="/images/vivekananda_quotes.webp" alt="Vivekananda Quotes" className="w-full aspect-[16/9] object-cover rounded-t-md opacity-95" />
          </Link>
          <Link href="/reports/mega-period" className="relative block overflow-hidden rounded-md border border-glass-border bg-glass-bg hover:border-primary-theme/60 transition-colors duration-200">
            <img src="/images/mega_period.webp" alt="Main Periods in Ramakrishna Mission History" className="w-full aspect-[16/9] object-cover rounded-t-md opacity-95" />
          </Link>
          <Link href="/schedule" target="_blank" rel="noopener noreferrer" className="relative block overflow-hidden rounded-md border border-glass-border bg-glass-bg hover:border-primary-theme/60 transition-colors duration-200 md:col-span-2 md:justify-self-center md:w-[calc(50%-12.5px)]">
            <img src="/images/click_to_reg.webp" alt="Click to Register" className="w-full aspect-[16/9] object-cover rounded-t-md opacity-95" />
          </Link>
        </div>

        {/* Today in History */}
        <div className="mt-12">
          <TodayInHistory />
        </div>

        <footer className="mt-16 p-8 bg-card border border-border rounded-md shadow-none text-center">
          <div className="mb-8 flex justify-center gap-6 text-sm font-sans font-semibold text-text-theme/75 border-b border-border pb-6">
            <Link href="/" className="hover:text-primary-theme transition-colors no-underline">Home</Link>
            <Link href="/about" className="hover:text-primary-theme transition-colors no-underline">About & Sources</Link>
            <Link href="/quotes" className="hover:text-primary-theme transition-colors no-underline">Quotes</Link>
            <Link href="/schedule" className="hover:text-primary-theme transition-colors no-underline">Schedule</Link>
          </div>
          <h3 className="font-serif text-3xl text-primary-theme mb-8">Swami Vivekananda Quotes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            <div className="space-y-4">
              <h4 className="text-lg text-secondary-theme font-semibold border-b border-border pb-2.5">On Self-Belief</h4>
              <blockquote className="italic text-base leading-relaxed pl-4 border-l-2 border-primary-theme text-text-theme opacity-90 my-4">"You cannot believe in God until you believe in yourself."</blockquote>
              <blockquote className="italic text-base leading-relaxed pl-4 border-l-2 border-primary-theme text-text-theme opacity-90 my-4">"Stand up, be bold, be strong. Take the whole responsibility on your own shoulders, and know that you are the creator of your own destiny."</blockquote>
              <blockquote className="italic text-base leading-relaxed pl-4 border-l-2 border-primary-theme text-text-theme opacity-90 my-4">"He is an atheist who does not believe in himself."</blockquote>
            </div>
            <div className="space-y-4">
              <h4 className="text-lg text-secondary-theme font-semibold border-b border-border pb-2.5">On Strength and Courage</h4>
              <blockquote className="italic text-base leading-relaxed pl-4 border-l-2 border-primary-theme text-text-theme opacity-90 my-4">"The greatest sin is to think that you are weak."</blockquote>
              <blockquote className="italic text-base leading-relaxed pl-4 border-l-2 border-primary-theme text-text-theme opacity-90 my-4">"Arise, awake, and stop not until the goal is reached."</blockquote>
              <blockquote className="italic text-base leading-relaxed pl-4 border-l-2 border-primary-theme text-text-theme opacity-90 my-4">"Take up one idea. Make that one idea your life..."</blockquote>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
