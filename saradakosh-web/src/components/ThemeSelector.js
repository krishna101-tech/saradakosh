'use client';
import { useEffect, useState } from 'react';

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

  const btnBaseClass = "bg-transparent border-none cursor-pointer text-text-theme text-sm opacity-60 hover:opacity-100 transition-all duration-200 px-2 py-1 rounded-lg";
  const btnActiveClass = "opacity-100 font-bold bg-primary-theme/15 text-primary-theme";

  if (!mounted) {
    return (
      <div className="absolute top-3 right-3 sm:top-5 sm:right-5 bg-glass-bg backdrop-blur-md border border-glass-border rounded-full px-2.5 py-1 flex gap-2.5 z-50 invisible">
        <button className={btnBaseClass}>Dawn</button>
        <button className={btnBaseClass}>Midnight</button>
      </div>
    );
  }

  const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isLightActive = theme === 'light' || (theme === 'system' && !isSystemDark);
  const isDarkActive = theme === 'dark' || (theme === 'system' && isSystemDark);

  return (
    <div className="absolute top-3 right-3 sm:top-5 sm:right-5 bg-glass-bg backdrop-blur-md border border-glass-border rounded-full px-2.5 py-1 flex gap-2.5 z-50">
      <button 
        className={`${btnBaseClass} ${isLightActive ? btnActiveClass : ''}`}
        onClick={() => changeTheme('light')}
      >
        Dawn
      </button>
      <button 
        className={`${btnBaseClass} ${isDarkActive ? btnActiveClass : ''}`}
        onClick={() => changeTheme('dark')}
      >
        Midnight
      </button>
    </div>
  );
}
