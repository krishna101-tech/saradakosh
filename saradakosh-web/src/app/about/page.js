import { Suspense } from 'react';
import Link from 'next/link';
import ThemeSelector from '@/components/ThemeSelector';
import FeedbackForm from './FeedbackForm';

export const metadata = {
  title: 'About & Source References',
  description: 'About Saradakosh, project maintainership, bibliography abbreviations key, and content correction channel.',
  alternates: {
    canonical: 'https://www.saradakosh.org/about'
  },
  openGraph: {
    title: 'About & Source References | Saradakosh',
    description: 'About Saradakosh, project maintainership, bibliography abbreviations key, and content correction channel.',
    url: 'https://www.saradakosh.org/about',
  },
  twitter: {
    title: 'About & Source References | Saradakosh',
    description: 'About Saradakosh, project maintainership, bibliography abbreviations key, and content correction channel.',
  }
};

export default function AboutPage() {
  const referenceKeys = [
    { abbreviation: 'LSV', source: 'Life of Swami Vivekananda', volumes: 'Vols. 1 & 2', language: 'English' },
    { abbreviation: 'CW', source: 'Complete Works of Swami Vivekananda', volumes: 'Vols. 1 to 9', language: 'English' },
    { abbreviation: 'GP', source: 'Gospel of Sri Ramakrishna (Kathamrita)', volumes: 'Vols. 1 to 5', language: 'English / Bengali' },
    { abbreviation: 'KTM', source: 'Sri Sri Ramakrishna Kathamrita', volumes: 'Original Bengali Text', language: 'Bengali' },
    { abbreviation: 'MSR', source: 'Holy Mother Sri Sarada Devi Teachings & Letters', volumes: 'Collection', language: 'English / Bengali' },
    { abbreviation: 'RKM', source: 'Ramakrishna Math & Mission Historical Records', volumes: 'Archives', language: 'Bilingual' },
  ];

  return (
    <main className="max-w-[1000px] mx-auto p-5 md:p-8 min-h-screen text-text-theme bg-bg-theme">
      {/* Header Area */}
      <div className="flex justify-between items-center mb-6">
        <Link 
          href="/" 
          className="inline-flex items-center gap-1.5 font-sans font-semibold text-text-theme opacity-80 hover:opacity-100 hover:text-primary-theme transition-all duration-300 -translate-x-0 hover:-translate-x-1 cursor-pointer bg-none border-none p-0 no-underline"
        >
          &larr; Back to Dashboard
        </Link>
        <ThemeSelector />
      </div>

      <header className="mb-12">
        <h1 className="font-serif text-4xl font-extrabold text-primary-theme mb-3">About Saradakosh</h1>
        <p className="text-sm opacity-80 max-w-[700px] leading-relaxed">
          Saradakosh is a comprehensive digital archive and spiritual platform dedicated to preserving the authentic, source-cited life stories and teachings of Sri Ramakrishna, Sri Sarada Devi (Holy Mother), and Swami Vivekananda.
        </p>
      </header>

      {/* Sourcing Section */}
      <section className="mb-12 space-y-4">
        <h2 className="font-serif text-2xl text-secondary-theme border-b border-glass-border pb-2.5">
          Sourcing & Project Methodology
        </h2>
        <p className="text-base leading-relaxed opacity-90">
          Unlike generic quote archives, every passage, entry, and milestone in the timeline on Saradakosh is tied to verified primary literature. Sourced citation abbreviations are used to map every record directly back to the physical volumes.
        </p>
        
        {/* Table/Legend for Abbreviations [9.2] */}
        <div className="overflow-x-auto mt-6 bg-glass-bg border border-glass-border rounded-xl shadow-sm">
          <table className="w-full text-left font-sans text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100/50 dark:bg-slate-800/40 border-b border-glass-border">
                <th className="p-4 font-bold text-primary-theme">Abbreviation</th>
                <th className="p-4 font-bold text-text-theme">Source Publication</th>
                <th className="p-4 font-bold text-text-theme">Volumes Covered</th>
                <th className="p-4 font-bold text-text-theme">Language</th>
              </tr>
            </thead>
            <tbody>
              {referenceKeys.map((item, index) => (
                <tr key={index} className="border-b border-glass-border last:border-b-0 hover:bg-primary-theme/5 transition-colors">
                  <td className="p-4 font-bold text-primary-theme">{item.abbreviation}</td>
                  <td className="p-4 font-medium">{item.source}</td>
                  <td className="p-4 opacity-85">{item.volumes}</td>
                  <td className="p-4 opacity-85">{item.language}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Suggestion Form Section */}
      <section className="mb-12">
        <Suspense fallback={<div className="animate-pulse h-64 bg-glass-bg border border-glass-border rounded-2xl"></div>}>
          <FeedbackForm />
        </Suspense>
      </section>
    </main>
  );
}
