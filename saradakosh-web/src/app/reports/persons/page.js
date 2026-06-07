import { getPersons } from '@/lib/db';
import Link from 'next/link';

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
            <div key={person.id} className="p-3 border rounded-md hover:bg-[#fdfbf7] transition-colors border-[#eaddd3]">
              <span className="text-lg font-serif text-[#2c2a29]">{person.para1}</span>
            </div>
          ))}
        </div>
        {persons.length === 0 && (
          <p className="text-gray-500 italic">No persons found.</p>
        )}
      </main>
    </div>
  );
}
