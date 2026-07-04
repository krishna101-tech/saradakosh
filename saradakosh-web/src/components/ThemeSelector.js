'use client';
import { useEffect, useState } from 'react';
import { Sunrise, MoonStar } from 'lucide-react';

export default function ThemeSelector() {
  const [theme, setTheme] = useState('system');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('saradakosh-theme') || 'system';
    setTheme(savedTheme);
  }, []);

  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('saradakosh-theme', newTheme);
    
    let isDark = false;
    if (newTheme === 'system') {
      isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    } else {
      isDark = (newTheme === 'dark');
    }
    
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  };

  const btnClass = "relative z-10 bg-transparent border-none cursor-pointer flex items-center justify-center size-7 rounded-full transition-all duration-200 touch-manipulation outline-none";

  if (!mounted) {
    return (
      <div className="absolute top-3 right-3 sm:top-5 sm:right-5 bg-glass-bg backdrop-blur-md border border-glass-border rounded-full p-1 h-9 w-[68px] z-50 invisible">
        <div className="size-7 rounded-full bg-primary-theme/15 absolute top-1 left-1" />
      </div>
    );
  }

  const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isLightActive = theme === 'light' || (theme === 'system' && !isSystemDark);
  const isDarkActive = theme === 'dark' || (theme === 'system' && isSystemDark);

  return (
    <div className="absolute top-3 right-3 sm:top-5 sm:right-5 bg-glass-bg backdrop-blur-md border border-glass-border rounded-full p-1 h-9 w-[68px] flex items-center justify-start z-50 select-none relative">
      {/* Sliding Highlight Indicator */}
      <div 
        className="size-7 rounded-full bg-primary-theme/15 absolute top-1 left-1 transition-transform duration-300 ease-out pointer-events-none"
        style={{ 
          transform: isDarkActive ? 'translateX(32px)' : 'translateX(0px)',
          background: isDarkActive ? 'var(--primary-color)' : 'rgba(92, 26, 27, 0.15)'
        }}
      />

      <button 
        className={`${btnClass} ${isLightActive ? 'text-primary-theme opacity-100 scale-105' : 'text-text-theme opacity-40 hover:opacity-75'}`}
        onClick={() => changeTheme('light')}
        aria-label="Switch to Dawn Theme (Light Mode)"
        title="Dawn (Light Theme)"
      >
        <Sunrise className="size-4.5" />
      </button>
      
      <button 
        className={`${btnClass} ${isDarkActive ? 'text-bg-theme opacity-100 scale-105' : 'text-text-theme opacity-40 hover:opacity-75'}`}
        onClick={() => changeTheme('dark')}
        aria-label="Switch to Midnight Theme (Dark Mode)"
        title="Midnight (Dark Theme)"
      >
        <MoonStar className="size-4.5" />
      </button>
    </div>
  );
}
