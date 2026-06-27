import { getPersons } from '@/lib/db';
import Link from 'next/link';

export const metadata = {
  title: 'Persons Directory | Saradakosh',
  description: 'Explore historical persons associated with the Ramakrishna Movement.',
  alternates: {
    canonical: 'https://saradakosh.org/reports/persons'
  }
};

export default function PersonsReport() {
  const persons = getPersons();

  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto">
      <nav className="mb-8">
        <Link href="/" className="text-[#d4a017] hover:underline font-medium">
          &larr; Back to Dashboard
        </Link>
      </nav>

      <header className="mb-12">
        <h1 className="text-4xl font-bold mb-2 font-serif text-[#2c2a29]">Persons Directory</h1>
        <p className="text-[#4a4846]">Alphabetical list of all historical persons</p>
      </header>

      <main className="bg-white p-8 rounded-lg shadow-sm border border-[#eaddd3]">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {persons.map((person) => (
            <Link 
              key={person.id} 
              href={`/reports/viewer/${person.id}`}
              className="p-3 border rounded-md hover:bg-[#fdfbf7] transition-all border-[#eaddd3] block hover:-translate-y-0.5 hover:shadow-sm"
            >
              <span className="text-lg font-serif text-[#2c2a29] hover:text-[#d4a017]">{person.para1}</span>
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
