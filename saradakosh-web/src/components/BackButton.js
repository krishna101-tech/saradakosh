'use client';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function BackButton() {
  const router = useRouter();

  return (
    <button 
      onClick={() => router.back()} 
      className="mb-8 inline-flex items-center gap-1.5 font-sans font-semibold text-text-theme opacity-80 hover:opacity-100 hover:text-primary-theme transition-all duration-300 hover:-translate-x-1 cursor-pointer bg-transparent border-none py-2 pr-2 pl-0 touch-manipulation"
    >
      <ArrowLeft className="size-4" /> Go Back
    </button>
  );
}
