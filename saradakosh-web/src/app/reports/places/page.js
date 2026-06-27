import { getPlacesHierarchy } from '@/lib/db';
import Link from 'next/link';

export const metadata = {
  title: 'Places Directory',
  description: 'Explore places associated with the life of Swami Vivekananda and the Ramakrishna Movement.',
  alternates: {
    canonical: 'https://saradakosh.org/reports/places'
  },
  openGraph: {
    title: 'Places Directory | Saradakosh',
    description: 'Explore places associated with the life of Swami Vivekananda and the Ramakrishna Movement.',
    url: 'https://saradakosh.org/reports/places',
  },
  twitter: {
    title: 'Places Directory | Saradakosh',
    description: 'Explore places associated with the life of Swami Vivekananda and the Ramakrishna Movement.',
  }
};

function PlaceNode({ node, level = 1 }) {
  if (!node) return null;
  
  return (
    <div className={`ml-${(level - 1) * 6} mb-2`}>
      <div className={`text-lg font-serif ${level === 1 ? 'font-bold text-[#d4a017] text-2xl border-b pb-1 mb-2 mt-6' : 'text-[#2c2a29]'}`}>
        {level > 1 && <span className="text-[#eaddd3] mr-2">↳</span>}
        <Link href={`/reports/viewer/${node.id}`} className="hover:text-[#d4a017] hover:underline">
          {node.name}
        </Link>
      </div>
      {node.children && node.children.length > 0 && (
        <div className="pl-4 border-l border-[#eaddd3]">
          {node.children.map((child) => (
            <PlaceNode key={child.id} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function PlacesReport() {
  const places = getPlacesHierarchy();

  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto">
      <nav className="mb-8">
        <Link href="/" className="text-[#d4a017] hover:underline font-medium">
          &larr; Back to Dashboard
        </Link>
      </nav>

      <header className="mb-12">
        <h1 className="text-4xl font-bold mb-2 font-serif text-[#2c2a29]">Places Directory</h1>
        <p className="text-[#4a4846]">Hierarchical view of all places under India</p>
      </header>

      <main className="bg-white p-8 rounded-lg shadow-sm border border-[#eaddd3]">
        {places.map((place, idx) => (
          <div key={place.id}>
            <PlaceNode node={place} level={1} />
          </div>
        ))}
        {places.length === 0 && (
          <p className="text-gray-500 italic">No places found.</p>
        )}
      </main>
    </div>
  );
}
