'use client';
import { useState } from 'react';
import { useHydrated } from '@/lib/useHydrated';
import { Sunrise, MoonStar } from 'lucide-react';

export default function ThemeSelector({ floating = false }) {
  const hydrated = useHydrated();
  const positionClass = floating ? 'absolute top-3 right-3 sm:top-5 sm:right-5' : 'relative shrink-0';
  if (!hydrated) {
    return (
      <div className={`${positionClass} bg-glass-bg backdrop-blur-md border border-glass-border rounded-full p-1 h-[52px] w-[100px] z-50 invisible`}>
        <div className="size-11 rounded-full bg-primary-theme/15 absolute top-1 left-1" />
      </div>
    );
  }
  return <ClientThemeSelector positionClass={positionClass} />;
}

function ClientThemeSelector({ positionClass }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('saradakosh-theme') || 'system');

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

  const btnClass = "relative z-10 bg-transparent border-none cursor-pointer flex items-center justify-center size-11 shrink-0 rounded-full transition-all duration-200 touch-manipulation focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-theme";

  const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isLightActive = theme === 'light' || (theme === 'system' && !isSystemDark);
  const isDarkActive = theme === 'dark' || (theme === 'system' && isSystemDark);

  return (
    <div className={`${positionClass} bg-glass-bg backdrop-blur-md border border-glass-border rounded-full p-1 h-[52px] w-[100px] flex items-center justify-start z-50 select-none`}>
      {/* Sliding Highlight Indicator */}
      <div 
        className="size-11 rounded-full bg-primary-theme/15 absolute top-1 left-1 transition-transform duration-300 ease-out pointer-events-none"
        style={{ 
          transform: isDarkActive ? 'translateX(44px)' : 'translateX(0px)',
          background: isDarkActive ? 'var(--primary-color)' : 'rgba(92, 26, 27, 0.15)'
        }}
      />

      <button 
        className={`${btnClass} ${isLightActive ? 'text-primary-theme opacity-100 scale-105' : 'text-text-theme opacity-70 hover:opacity-100'}`}
        onClick={() => changeTheme('light')}
        aria-label="Switch to Dawn Theme (Light Mode)"
        title="Dawn (Light Theme)"
      >
        <Sunrise className="size-4.5" />
      </button>
      
      <button 
        className={`${btnClass} ${isDarkActive ? 'text-bg-theme opacity-100 scale-105' : 'text-text-theme opacity-70 hover:opacity-100'}`}
        onClick={() => changeTheme('dark')}
        aria-label="Switch to Midnight Theme (Dark Mode)"
        title="Midnight (Dark Theme)"
      >
        <MoonStar className="size-4.5" />
      </button>
    </div>
  );
}
