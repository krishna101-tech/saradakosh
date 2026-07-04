import { getPlacesHierarchy } from '@/lib/db';
import Link from 'next/link';
import { ArrowLeft, CornerDownRight } from 'lucide-react';

export const metadata = {
  title: 'Places Directory',
  description: 'Explore places associated with the life of Swami Vivekananda and the Ramakrishna Movement.',
  alternates: {
    canonical: 'https://www.saradakosh.org/reports/places'
  },
  openGraph: {
    title: 'Places Directory | Saradakosh',
    description: 'Explore places associated with the life of Swami Vivekananda and the Ramakrishna Movement.',
    url: 'https://www.saradakosh.org/reports/places',
  },
  twitter: {
    title: 'Places Directory | Saradakosh',
    description: 'Explore places associated with the life of Swami Vivekananda and the Ramakrishna Movement.',
  }
};

function PlaceNode({ node, level = 1 }) {
  if (!node) return null;
  
  return (
    <div style={{ marginLeft: `${(level - 1) * 1.5}rem` }} className="mb-2">
      <div className={`text-lg font-serif ${level === 1 ? 'font-bold text-warm-link text-2xl border-b pb-1 mb-2 mt-6' : 'text-warm-text'}`}>
        {level > 1 && <span className="text-warm-border mr-2 inline-block"><CornerDownRight className="size-4 inline" /></span>}
        <Link href={`/reports/viewer/${node.id}`} className="hover:text-warm-link hover:underline">
          {node.name}
        </Link>
      </div>
      {node.children && node.children.length > 0 && (
        <div className="pl-4 border-l border-warm-border">
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
        <Link href="/" className="text-warm-link hover:underline font-medium inline-flex items-center gap-1.5">
          <ArrowLeft className="size-4" /> Back to Dashboard
        </Link>
      </nav>

      <header className="mb-12">
        <h1 className="text-4xl font-bold mb-2 font-serif text-warm-text">Places Directory</h1>
        <p className="text-warm-heading">Hierarchical view of all places under India</p>
      </header>

      <main className="bg-white dark:bg-transparent p-8 rounded-lg shadow-sm border border-warm-border">
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
