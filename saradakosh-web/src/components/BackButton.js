'use client';

import { useRouter } from 'next/navigation';

export default function BackButton() {
  const router = useRouter();

  return (
    <button 
      onClick={() => router.back()} 
      className="back-link mb-8 inline-block font-bold" 
      style={{ background: 'none', border: 'none', padding: 0, borderBottom: '1px solid var(--text-color)', color: 'var(--text-color)', cursor: 'pointer', fontSize: '1rem', fontFamily: 'inherit' }}
    >
      &larr; Go Back
    </button>
  );
}
