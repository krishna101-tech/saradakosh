import LibraryClient from '@/components/library/LibraryClient';
import { getLibraryBooks } from '@/lib/library/repository';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Library',
  description: 'Explore 168 canonical books on Sri Ramakrishna, Holy Mother, Swami Vivekananda, and their disciples in Original, English, and Bengali.',
  alternates: { canonical: 'https://www.saradakosh.org/reports/refs' },
};

export default function LibraryPage() {
  return <LibraryClient books={getLibraryBooks()} />;
}
