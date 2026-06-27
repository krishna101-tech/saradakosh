'use client';
import { useRouter } from 'next/navigation';

export default function BackButton() {
  const router = useRouter();

  return (
    <button 
      onClick={() => router.back()} 
      className="mb-8 inline-flex items-center gap-1.5 font-sans font-semibold text-text-theme opacity-80 hover:opacity-100 hover:text-primary-theme transition-all duration-300 -translate-x-0 hover:-translate-x-1 cursor-pointer bg-none border-none p-0"
    >
      &larr; Go Back
    </button>
  );
}
