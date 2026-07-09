"use client";

import React, { useState, useEffect, useRef } from "react";
import { ReactLenis } from "@studio-freight/react-lenis";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import storyQuotes from "@/data/story_quotes.json";

export default function StorytellingClient() {
  const [lang, setLang] = useState("english");
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  return (
    <ReactLenis root>
      <div ref={containerRef} className="relative w-full bg-black text-white selection:bg-orange-500/30">
        
        {/* Navigation / Language Selector */}
        <nav className="fixed top-0 left-0 w-full z-50 p-4 md:p-6 flex justify-between items-center backdrop-blur-md bg-black/40 border-b border-white/10">
          <div className="font-serif text-xl md:text-2xl tracking-widest uppercase font-semibold text-white/90">
            Saradakosh
          </div>
          <div className="w-32">
            <Select value={lang} onValueChange={setLang}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white backdrop-blur-sm rounded-full">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent className="bg-black/80 backdrop-blur-md border-white/20 text-white">
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="gujarati">ગુજરાતી</SelectItem>
                <SelectItem value="hindi">हिन्दी</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative min-h-screen w-full flex flex-col md:flex-row items-center justify-center overflow-hidden pt-24 md:pt-0">
          {/* Image Container (Full Image, No Crop) */}
          <div className="w-full md:w-1/2 h-[50vh] md:h-screen flex items-center justify-center p-4 md:p-12 order-1 md:order-2">
            <motion.img 
              src="/images/storytelling/intro.webp"
              alt="Make the Heart Like an Ocean"
              className="w-full h-full object-contain"
              style={{
                scale: useTransform(scrollYProgress, [0, 0.2], [1, 1.05])
              }}
            />
          </div>

          {/* Text Container */}
          <div className="w-full md:w-1/2 flex flex-col justify-center items-center md:items-start text-center md:text-left p-6 md:p-16 xl:p-24 order-2 md:order-1 relative z-10">
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="font-serif text-5xl md:text-6xl lg:text-8xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-[#f9d423] to-[#ff4e50] drop-shadow-lg leading-tight"
            >
              Make the Heart<br/>Like an Ocean
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 1 }}
              className="mt-6 text-lg md:text-xl text-white/80 max-w-xl font-light tracking-wide"
            >
              An immersive journey through the inspiring words of Swami Vivekananda
            </motion.p>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 1, repeat: Infinity, repeatType: "reverse" }}
              className="mt-12 flex flex-col items-center md:items-start gap-2"
            >
              <span className="text-sm uppercase tracking-widest text-white/50">Scroll to explore</span>
              <div className="w-[1px] h-12 bg-gradient-to-b from-white/50 to-transparent md:ml-12"></div>
            </motion.div>
          </div>
        </section>

        {/* Quotes Sections */}
        {storyQuotes.map((quote, index) => {
          return (
            <QuoteSection 
              key={quote.id} 
              quote={quote} 
              index={index} 
              lang={lang} 
              total={storyQuotes.length} 
            />
          );
        })}
        
        {/* Footer */}
        <section className="relative py-24 w-full flex items-center justify-center bg-black">
           <div className="text-center">
             <div className="w-16 h-[1px] bg-white/20 mx-auto mb-8"></div>
             <p className="font-serif text-2xl md:text-3xl italic text-white/60">
               "Arise, awake, and stop not till the goal is reached."
             </p>
             <p className="mt-8 text-white/40 text-sm tracking-widest uppercase">© Saradakosh</p>
           </div>
        </section>

      </div>
    </ReactLenis>
  );
}

function QuoteSection({ quote, index, lang, total }) {
  const sectionRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const yBg = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);
  const opacityText = useTransform(scrollYProgress, [0.2, 0.5, 0.8], [0, 1, 0]);
  const yText = useTransform(scrollYProgress, [0.2, 0.5, 0.8], [30, 0, -30]);

  const currentText = quote.languages[lang] || quote.languages["english"];
  const isEven = index % 2 === 0;

  return (
    <section ref={sectionRef} className="relative min-h-screen w-full flex flex-col md:flex-row items-center justify-center overflow-hidden py-12 md:py-0">
      
      {/* Image Container - Full image, no cropping */}
      <div className={`w-full md:w-1/2 h-[45vh] md:h-[80vh] flex items-center justify-center p-4 md:p-12 ${isEven ? 'md:order-1' : 'md:order-2'}`}>
        <motion.img
          src={`/images/storytelling/${quote.bg_image}`}
          className="w-full h-full object-contain"
          style={{ y: yBg }}
          alt="Quote background"
        />
      </div>

      {/* Quote Content Card */}
      <div className={`w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 z-10 relative ${isEven ? 'md:order-2' : 'md:order-1'}`}>
        <motion.div 
          className="w-full max-w-2xl"
          style={{ opacity: opacityText, y: yText }}
        >
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 md:p-12 rounded-3xl shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-32 h-32 bg-[#ff4e50]/10 rounded-br-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#f9d423]/10 rounded-tl-full blur-3xl"></div>
            
            <div className="relative z-20">
              <div className="text-[#f9d423] text-6xl md:text-8xl font-serif leading-none absolute -top-4 -left-4 md:-top-8 md:-left-8 opacity-30">
                "
              </div>
              
              <p className="font-serif text-2xl md:text-3xl lg:text-4xl leading-relaxed md:leading-snug text-white/95 relative z-10">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={lang}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.5 }}
                    className="block"
                  >
                    {currentText}
                  </motion.span>
                </AnimatePresence>
              </p>

              <div className="mt-12 flex items-center justify-between border-t border-white/10 pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-[1px] bg-white/50"></div>
                  <span className="text-white/60 uppercase tracking-widest text-xs md:text-sm font-semibold">
                    Swami Vivekananda
                  </span>
                </div>
                <div className="text-white/30 font-mono text-sm">
                  0{index + 1} / 0{total}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
