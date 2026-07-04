import { getPersons } from '@/lib/db';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Persons Directory',
  description: 'Explore historical persons associated with the Ramakrishna Movement.',
  alternates: {
    canonical: 'https://www.saradakosh.org/reports/persons'
  },
  openGraph: {
    title: 'Persons Directory | Saradakosh',
    description: 'Explore historical persons associated with the Ramakrishna Movement.',
    url: 'https://www.saradakosh.org/reports/persons',
  },
  twitter: {
    title: 'Persons Directory | Saradakosh',
    description: 'Explore historical persons associated with the Ramakrishna Movement.',
  }
};

export default function PersonsReport() {
  const persons = getPersons();

  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto">
      <nav className="mb-8">
        <Link href="/" className="text-warm-link hover:underline font-medium inline-flex items-center gap-1.5">
          <ArrowLeft className="size-4" /> Back to Dashboard
        </Link>
      </nav>

      <header className="mb-12">
        <h1 className="text-4xl font-bold mb-2 font-serif text-warm-text">Persons Directory</h1>
        <p className="text-warm-heading">Alphabetical list of all historical persons</p>
      </header>

      <main className="bg-white dark:bg-transparent p-8 rounded-lg shadow-sm border border-warm-border">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {persons.map((person) => (
            <Link 
              key={person.id} 
              href={`/reports/viewer/${person.id}`}
              className="p-3 border rounded-md hover:bg-warm-bg transition-all border-warm-border block hover:-translate-y-0.5 hover:shadow-sm"
            >
              <span className="text-lg font-serif text-warm-text hover:text-warm-link">{person.para1}</span>
            </Link>
          ))}
        </div>
        {persons.length === 0 && (
          <p className="text-gray-500 italic">No persons found.</p>
        )}
      </main>
    </div>
  );
}
