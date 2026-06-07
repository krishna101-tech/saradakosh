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

  if (!mounted) {
    return <div className="theme-selector" style={{ visibility: 'hidden' }}><button className="theme-btn">Dawn</button><button className="theme-btn">Midnight</button></div>;
  }

  const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isLightActive = theme === 'light' || (theme === 'system' && !isSystemDark);
  const isDarkActive = theme === 'dark' || (theme === 'system' && isSystemDark);

  return (
    <div className="theme-selector">
      <button 
        className={`theme-btn ${isLightActive ? 'active' : ''}`}
        onClick={() => changeTheme('light')}
      >
        Dawn
      </button>
      <button 
        className={`theme-btn ${isDarkActive ? 'active' : ''}`}
        onClick={() => changeTheme('dark')}
      >
        Midnight
      </button>
    </div>
  );
}
