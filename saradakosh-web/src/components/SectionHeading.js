import React from 'react';

const CulturalOrnament = () => (
  <div className="flex items-center justify-center gap-3 mt-3 opacity-90">
    <div className="h-[1px] w-16 sm:w-24 bg-gradient-to-r from-transparent to-primary-theme/80"></div>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary-theme fill-current">
      <path d="M12 2C12 2 9 6 6 9C3 12 2 15 2 18C2 21 4 22 4 22C4 22 4.5 19.5 7 17C9.5 14.5 12 12 12 12C12 12 14.5 14.5 17 17C19.5 19.5 20 22 20 22C20 22 22 21 22 18C22 15 21 12 18 9C15 6 12 2 12 2Z" fillOpacity="0.8"/>
      <path d="M12 22C12 22 10.5 19.5 10 17C9.5 14.5 10 12 12 9C14 12 14.5 14.5 14 17C13.5 19.5 12 22 12 22Z" fillOpacity="0.9"/>
    </svg>
    <div className="h-[1px] w-16 sm:w-24 bg-gradient-to-l from-transparent to-primary-theme/80"></div>
  </div>
);

export default function SectionHeading({ children, className = "" }) {
  return (
    <div className={`text-center mb-8 ${className}`}>
      <h2 className="font-ornament text-3xl sm:text-4xl text-primary-theme font-semibold tracking-wide m-0">
        {children}
      </h2>
      <CulturalOrnament />
    </div>
  );
}
