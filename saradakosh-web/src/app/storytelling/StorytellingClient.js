'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';
import { ReactLenis } from '@studio-freight/react-lenis';
import { ArrowDown, Home, Quote, Sparkles, Languages } from 'lucide-react';
import quotesData from '@/data/story_quotes.json';

// Simple mapping for UI localization
const uiTexts = {
  english: {
    title: "Make the Heart like an Ocean",
    subtitle: "A scroll-driven journey through the teachings of Swami Vivekananda",
    scrollHint: "Scroll to begin the journey",
    footerText: "May your heart grow as vast as the ocean, embracing all life with love and strength.",
    backHome: "Back to Home",
    readMore: "View Original Page",
    categoriesLabel: "Categories",
    outroTitle: "Embrace the Ocean",
    outroSub: "Let these teachings ring in your mind day and night..."
  },
  gujarati: {
    title: "હૃદયને સાગર જેવું બનાવો",
    subtitle: "સ્વામી વિવેકાનંદના ઉપદેશો દ્વારા એક ભવ્ય યાત્રા",
    scrollHint: "યાત્રા શરૂ કરવા માટે સ્ક્રોલ કરો",
    footerText: "આપનું હૃદય સાગર જેવું વિશાળ બને, અને પ્રેમ તથા શક્તિ સાથે સમગ્ર સૃષ્ટિને અપનાવે.",
    backHome: "મુખ્ય પૃષ્ઠ પર પાછા જાઓ",
    readMore: "મૂળ પૃષ્ઠ જુઓ",
    categoriesLabel: "શ્રેણીઓ",
    outroTitle: "સાગર જેવા બનો",
    outroSub: "આ ઉપદેશો તમારા મનમાં દિવસ-રાત ગુંજતા રહે..."
  },
  hindi: {
    title: "हृदय को समुद्र के समान बना लो",
    subtitle: "स्वामी विवेकानंद के उपदेशों के माध्यम से एक यात्रा",
    scrollHint: "यात्रा शुरू करने के लिए स्क्रॉल करें",
    footerText: "आपका हृदय समुद्र के समान विशाल बने, और प्रेम व शक्ति के साथ संपूर्ण जीवन को गले लगाए।",
    backHome: "मुख्य पृष्ठ पर वापस जाएं",
    readMore: "मूल पृष्ठ देखें",
    categoriesLabel: "श्रेणियाँ",
    outroTitle: "समुद्र को अपनाएं",
    outroSub: "ये उपदेश आपके मन में दिन-रात संगीत की भांति झंकृत होते रहें..."
  }
};

export default function StorytellingClient() {
  const containerRef = useRef(null);
  const [lang, setLang] = useState('english');
  const [activeSlide, setActiveSlide] = useState(0);

  // Monitor scroll progress of the entire container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Create spring-smoothed progress for indicators
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 25,
    restDelta: 0.001
  });

  // Set up background transforms (scale and opacity) for the 7 stacked images
  // Total slides: 8 (Slide 0: Hero, Slide 1-6: Quotes, Slide 7: Outro)
  
  // Slide 0: Intro (Main Temple)
  const opacity0 = useTransform(scrollYProgress, [0, 0.05, 0.12], [1, 1, 0]);
  const scale0 = useTransform(scrollYProgress, [0, 0.12], [1.03, 1.10]);

  // Slide 1: Quote 1
  const opacity1 = useTransform(scrollYProgress, [0.10, 0.15, 0.23, 0.28], [0, 1, 1, 0]);
  const scale1 = useTransform(scrollYProgress, [0.10, 0.28], [1.03, 1.10]);

  // Slide 2: Quote 2
  const opacity2 = useTransform(scrollYProgress, [0.25, 0.30, 0.38, 0.43], [0, 1, 1, 0]);
  const scale2 = useTransform(scrollYProgress, [0.25, 0.43], [1.03, 1.10]);

  // Slide 3: Quote 3
  const opacity3 = useTransform(scrollYProgress, [0.40, 0.45, 0.53, 0.58], [0, 1, 1, 0]);
  const scale3 = useTransform(scrollYProgress, [0.40, 0.58], [1.03, 1.10]);

  // Slide 4: Quote 4
  const opacity4 = useTransform(scrollYProgress, [0.55, 0.60, 0.68, 0.73], [0, 1, 1, 0]);
  const scale4 = useTransform(scrollYProgress, [0.55, 0.73], [1.03, 1.10]);

  // Slide 5: Quote 5
  const opacity5 = useTransform(scrollYProgress, [0.70, 0.75, 0.83, 0.88], [0, 1, 1, 0]);
  const scale5 = useTransform(scrollYProgress, [0.70, 0.88], [1.03, 1.10]);

  // Slide 6: Quote 6
  const opacity6 = useTransform(scrollYProgress, [0.85, 0.90, 0.95, 0.98], [0, 1, 1, 0]);
  const scale6 = useTransform(scrollYProgress, [0.85, 0.98], [1.03, 1.10]);

  // Slide 7: Outro (Gradually goes to solid color and cards, background 6 fades out)
  const outroBgOpacity = useTransform(scrollYProgress, [0.93, 0.98], [0, 0.9]);

  // Detect which slide is currently active based on scroll progress to update nav dots
  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      // Divide [0, 1] into 8 zones
      const slide = Math.min(Math.floor(latest * 8), 7);
      setActiveSlide(slide);
    });
    return () => unsubscribe();
  }, [scrollYProgress]);

  // Helper to scroll to a specific section index smoothly
  const scrollToSection = (idx) => {
    if (!containerRef.current) return;
    const totalHeight = containerRef.current.scrollHeight;
    const windowHeight = window.innerHeight;
    // Calculate position
    const targetScroll = (totalHeight - windowHeight) * (idx / 7);
    window.scrollTo({
      top: targetScroll,
      behavior: 'smooth'
    });
  };

  return (
    <ReactLenis root>
      <div 
        ref={containerRef}
        className="relative min-h-[800vh] bg-bg-theme text-text-theme font-sans selection:bg-quotes-accent selection:text-bg-theme"
      >
        {/* Sticky background layer */}
        <div className="sticky top-0 left-0 w-full h-screen overflow-hidden z-0 pointer-events-none">
          {/* Stack of background images */}
          <motion.div 
            style={{ opacity: opacity0, scale: scale0 }} 
            className="absolute inset-0 w-full h-full"
          >
            <div className="absolute inset-0 bg-black/60 z-10" />
            <img 
              src="/images/storytelling/intro.webp" 
              alt="Belur Math" 
              className="w-full h-full object-cover" 
            />
          </motion.div>

          <motion.div 
            style={{ opacity: opacity1, scale: scale1 }} 
            className="absolute inset-0 w-full h-full"
          >
            <div className="absolute inset-0 bg-black/55 z-10" />
            <img 
              src="/images/storytelling/quote1.webp" 
              alt="Swami Vivekananda" 
              className="w-full h-full object-cover" 
            />
          </motion.div>

          <motion.div 
            style={{ opacity: opacity2, scale: scale2 }} 
            className="absolute inset-0 w-full h-full"
          >
            <div className="absolute inset-0 bg-black/55 z-10" />
            <img 
              src="/images/storytelling/quote2.webp" 
              alt="Sri Ramakrishna" 
              className="w-full h-full object-cover" 
            />
          </motion.div>

          <motion.div 
            style={{ opacity: opacity3, scale: scale3 }} 
            className="absolute inset-0 w-full h-full"
          >
            <div className="absolute inset-0 bg-black/55 z-10" />
            <img 
              src="/images/storytelling/quote3.webp" 
              alt="Swami Vivekananda Chicago" 
              className="w-full h-full object-cover" 
            />
          </motion.div>

          <motion.div 
            style={{ opacity: opacity4, scale: scale4 }} 
            className="absolute inset-0 w-full h-full"
          >
            <div className="absolute inset-0 bg-black/55 z-10" />
            <img 
              src="/images/storytelling/quote4.webp" 
              alt="Holy Mother Sarada Devi" 
              className="w-full h-full object-cover" 
            />
          </motion.div>

          <motion.div 
            style={{ opacity: opacity5, scale: scale5 }} 
            className="absolute inset-0 w-full h-full"
          >
            <div className="absolute inset-0 bg-black/55 z-10" />
            <img 
              src="/images/storytelling/quote5.webp" 
              alt="Swami Vivekananda Colombo" 
              className="w-full h-full object-cover" 
            />
          </motion.div>

          <motion.div 
            style={{ opacity: opacity6, scale: scale6 }} 
            className="absolute inset-0 w-full h-full"
          >
            <div className="absolute inset-0 bg-black/60 z-10" />
            <img 
              src="/images/storytelling/quote6.webp" 
              alt="Nilambar Garden" 
              className="w-full h-full object-cover" 
            />
          </motion.div>

          {/* Saffron/Gold gradient cover for the final outro slide */}
          <motion.div 
            style={{ opacity: outroBgOpacity }}
            className="absolute inset-0 bg-gradient-to-b from-bg-theme via-bg-theme/95 to-bg-theme w-full h-full z-20"
          />
        </div>

        {/* Floating elements */}
        {/* Top Header */}
        <header className="fixed top-0 left-0 w-full z-40 bg-bg-theme/65 backdrop-blur-xl border-b border-glass-border transition-all duration-200">
          {/* Scroll progress bar */}
          <motion.div 
            style={{ scaleX: smoothProgress }}
            className="h-[1px] bg-quotes-accent origin-left w-full absolute top-0 left-0"
          />
          
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
            {/* Left: Home & Title */}
            <div className="flex items-center gap-3 min-w-0">
              <a 
                href="/" 
                className="flex items-center gap-2 group text-text-theme hover:text-quotes-accent transition-colors shrink-0"
                aria-label="Back to Home"
              >
                <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="font-serif tracking-wider font-semibold text-xs uppercase max-md:hidden">SARADAKOSH</span>
              </a>

              {/* Decorative separator */}
              <div className="h-4 w-[1px] bg-quotes-accent/20 max-md:hidden shrink-0" />

              {/* Page Title with truncation */}
              <div className="font-serif text-quotes-accent font-medium text-sm md:text-base tracking-wide truncate">
                {uiTexts[lang].title}
              </div>
            </div>

            {/* Right: Premium Language Selector */}
            <div className="flex items-center gap-2 bg-bg-theme/90/60 border border-glass-border rounded-full px-3 py-1.5 backdrop-blur-md shrink-0">
              <Languages className="w-4 h-4 text-text-theme/70" />
              <select 
                value={lang} 
                onChange={(e) => setLang(e.target.value)}
                className="bg-transparent text-text-theme text-xs font-semibold focus:outline-none cursor-pointer pr-1"
              >
                <option value="english" className="bg-bg-theme/90 text-text-theme">English</option>
                <option value="gujarati" className="bg-bg-theme/90 text-text-theme">ગુજરાતી</option>
                <option value="hindi" className="bg-bg-theme/90 text-text-theme">हिन्दी</option>
              </select>
            </div>
          </div>
        </header>

        {/* Side progress indicators */}
        <nav className="fixed right-8 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-4 max-sm:right-4">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((idx) => {
            const isActive = activeSlide === idx;
            return (
              <button 
                key={idx}
                onClick={() => scrollToSection(idx)}
                className="group relative flex items-center justify-end focus:outline-none"
                aria-label={`Scroll to section ${idx + 1}`}
              >
                {/* Tooltip labels */}
                <span className="absolute right-7 py-0.5 px-2 bg-bg-theme/90/90 text-text-theme border border-glass-border rounded text-[10px] tracking-wider uppercase font-semibold opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-200 pointer-events-none font-sans whitespace-nowrap">
                  {idx === 0 ? "Intro" : idx === 7 ? "Outro" : `Quote ${idx}`}
                </span>
                
                {/* Dot */}
                <div 
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    isActive 
                      ? "bg-quotes-accent scale-125 shadow-[0_0_8px_rgba(245,158,11,0.6)]" 
                      : "bg-stone-600 group-hover:bg-stone-400 group-hover:scale-110"
                  }`} 
                />
              </button>
            );
          })}
        </nav>

        {/* Main scrollable panel overlays */}
        <div className="relative z-20 w-full">
          {/* Section 0: Hero / Intro */}
          <div className="h-screen w-full flex flex-col items-center justify-center text-center px-6 relative">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="max-w-4xl"
            >
              <span className="text-quotes-accent/80 font-semibold tracking-[0.25em] text-xs uppercase block mb-3 font-sans">
                Swami Vivekananda
              </span>
              <h1 className="font-serif text-5xl md:text-7xl font-bold tracking-tight text-text-theme leading-tight mb-6">
                {uiTexts[lang].title}
              </h1>
              
              <div className="h-[2px] w-24 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto mb-6" />
              
              <p className="text-text-theme/90 font-light tracking-wide text-lg md:text-xl font-sans max-w-2xl mx-auto mb-10 leading-relaxed">
                {uiTexts[lang].subtitle}
              </p>
              
              <button 
                onClick={() => scrollToSection(1)}
                className="inline-flex flex-col items-center gap-3 text-text-theme/70 hover:text-quotes-accent font-semibold text-xs tracking-widest uppercase transition-colors group cursor-pointer"
              >
                <span>{uiTexts[lang].scrollHint}</span>
                <ArrowDown className="w-5 h-5 animate-bounce group-hover:translate-y-1 transition-transform" />
              </button>
            </motion.div>
          </div>

          {/* Section 1-6: Dynamic Quote Panels */}
          {quotesData.map((q, idx) => {
            const isEven = idx % 2 === 0;
            return (
              <div 
                key={q.id}
                className="h-screen w-full flex items-center px-6 md:px-20 relative overflow-hidden"
              >
                {/* Custom layout positioning per quote step */}
                <div 
                  className={`w-full max-w-7xl mx-auto flex ${
                    isEven ? "justify-start" : "justify-end"
                  }`}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.3 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="w-full md:max-w-xl lg:max-w-2xl"
                  >
                    {/* Unique Editorial Style Glass Card */}
                    <div className="bg-bg-theme/70 border border-glass-border p-8 md:p-10 rounded-3xl backdrop-blur-xl shadow-2xl relative group hover:border-amber-500/20 transition-colors duration-300">
                      {/* Saffron/Gold accent top border */}
                      <div className="absolute top-0 left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
                      
                      {/* Large decorative quotes mark */}
                      <div className="absolute top-6 right-8 text-white/5 pointer-events-none">
                        <Quote className="w-20 h-20 rotate-180" />
                      </div>

                      {/* Multi-language quote display with crossfade transition */}
                      <div className="min-h-[140px] flex items-center mb-6">
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={lang}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.25 }}
                            className="font-serif italic text-lg md:text-xl text-text-theme leading-relaxed w-full text-center"
                          >
                            {q.languages[lang]}
                          </motion.div>
                        </AnimatePresence>
                      </div>

                      {/* Citation details */}
                      <div className="flex items-center justify-center pt-5 border-t border-glass-border">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-quotes-accent" />
                          <span className="text-text-theme/70 font-semibold tracking-wider text-xs uppercase font-sans">
                            Swami Vivekananda
                          </span>
                          <div className="w-1.5 h-1.5 rounded-full bg-quotes-accent" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            );
          })}

          {/* Section 7: Outro / Conclusion */}
          <div className="h-screen w-full flex flex-col items-center justify-center text-center px-6 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.8 }}
              className="max-w-3xl bg-bg-theme/45 p-12 border border-glass-border rounded-3xl backdrop-blur-md shadow-2xl relative"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-bg-theme/90 border border-glass-border p-3 rounded-full text-quotes-accent shadow-md">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>

              <h2 className="font-serif text-3xl md:text-4xl font-bold tracking-wide text-text-theme mb-6 mt-2">
                {uiTexts[lang].outroTitle}
              </h2>
              
              <p className="text-text-theme/90 font-light tracking-wide italic text-base md:text-lg font-serif max-w-xl mx-auto mb-8 leading-relaxed">
                "{uiTexts[lang].footerText}"
              </p>

              <div className="signature-divider max-w-xs mx-auto mb-8" />
              
              <p className="text-quotes-accent/80 text-xs tracking-widest uppercase font-semibold mb-8">
                {uiTexts[lang].outroSub}
              </p>

              <div className="flex items-center justify-center gap-4">
                <a 
                  href="/" 
                  className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 text-xs font-bold tracking-widest uppercase py-3 px-6 rounded-full transition-all duration-150 transform hover:-translate-y-0.5 active:translate-y-0 hover:shadow-lg hover:shadow-amber-600/20 shadow-md"
                >
                  {uiTexts[lang].backHome}
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </ReactLenis>
  );
}
