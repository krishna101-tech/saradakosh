import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import ThemeSelector from '@/components/ThemeSelector';
import TodayInHistory from '@/components/TodayInHistory';
import SearchBar from '@/components/SearchBar';
import { StaggerContainer, StaggerItem } from '@/components/MotionWrapper';
import QuoteCarousel from '@/components/QuoteCarousel';
import SectionHeading from '@/components/SectionHeading';

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
      <header className="relative py-16 px-6 sm:px-8 border-b border-glass-border max-w-3xl mx-auto bg-bg-theme text-center">
        <ThemeSelector />
        <StaggerContainer className="space-y-6 pt-8" delay={0.1}>
          <StaggerItem className="flex justify-center mb-2">
            <img 
              src="/images/cosmetics.png" 
              alt="Saradakosh Emblem" 
              className="h-16 w-auto object-contain opacity-90 dark:brightness-125 dark:opacity-95"
            />
          </StaggerItem>
          
          <StaggerItem>
            <h1 className="h1-title mb-0 leading-none">
              Saradakosh
            </h1>
          </StaggerItem>
          
          <StaggerItem>
            <h2 className="font-light text-base sm:text-lg text-text-theme/90 flex flex-col gap-2.5 leading-relaxed max-w-2xl mx-auto">
              <span className="font-serif italic text-lg text-secondary-theme font-semibold">The Lives, Teachings, and Legacy of Sri Ramakrishna, Sri Sarada Devi, and Swami Vivekananda</span>
              <span>A Historical and Spiritual Journey Through the First Century of the Ramakrishna Movement</span>
              <span className="text-sm font-bold tracking-widest text-primary-theme/75">1836–1936</span>
            </h2>
          </StaggerItem>
          
          <StaggerItem className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a 
              href="https://notebooklm.google.com/notebook/e341fff6-3ed6-483c-a6e7-733e9bdbacd4" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn-primary py-3 px-5 text-base"
            >
              <Sparkles className="size-4 mr-2" /> Ask AI
            </a>
            <p className="text-xs text-text-theme/80 max-w-[320px] leading-normal font-medium text-left">
              Click to chat with an interactive AI trained on the core literature of Sri Ramakrishna, Ma Sarada, and Swami Vivekananda.
            </p>
          </StaggerItem>
        </StaggerContainer>
        
        <div className="w-full max-w-[600px] mt-12 mx-auto text-left">
          <div className="mb-2 pl-1 font-bold text-primary-theme text-[0.8rem] uppercase tracking-[1.5px] opacity-80">
            Browse Local Archive
          </div>
          <SearchBar />
        </div>
      </header>

      <main className="max-w-[1000px] mx-auto p-5 md:p-8">
        {/* Reports */}
        <div className="mt-12">
          <SectionHeading>Reports & Directories</SectionHeading>
        </div>
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6" delay={0.06}>
          <StaggerItem>
            <Link href="/reports/refs" className="block relative w-full aspect-[16/9] card-interactive rounded-xl">
              <img src="/images/book_refs.webp" alt="Sri Ramakrishna Vivekananda Literature" className="w-full h-full object-cover opacity-95" />
            </Link>
          </StaggerItem>
          <StaggerItem>
            <Link href="/reports/vivekananda" className="block relative w-full aspect-[16/9] card-interactive rounded-xl">
              <img src="/images/vivekananda.webp" alt="Explore the Complete Life & Teachings of Swami Vivekananda 1863-1902" className="w-full h-full object-cover opacity-95" />
            </Link>
          </StaggerItem>
          <StaggerItem>
            <Link href="/quotes" className="block relative w-full aspect-[16/9] card-interactive rounded-xl">
              <img src="/images/vivekananda_quotes.webp" alt="Vivekananda Quotes" className="w-full h-full object-cover opacity-95" />
            </Link>
          </StaggerItem>
          <StaggerItem>
            <Link href="/reports/mega-period" className="block relative w-full aspect-[16/9] card-interactive rounded-xl">
              <img src="/images/mega_period.webp" alt="Main Periods in Ramakrishna Mission History" className="w-full h-full object-cover opacity-95" />
            </Link>
          </StaggerItem>
          <StaggerItem className="md:col-span-2 md:justify-self-center md:w-[calc(50%-12.5px)]">
            <Link href="/schedule" target="_blank" rel="noopener noreferrer" className="block relative w-full aspect-[16/9] card-interactive rounded-xl">
              <img src="/images/click_to_reg.webp" alt="Click to Register" className="w-full h-full object-cover opacity-95" />
            </Link>
          </StaggerItem>
        </StaggerContainer>

        <QuoteCarousel />

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
          <h3 className="h3-title text-3xl mb-8">Swami Vivekananda Quotes</h3>
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
