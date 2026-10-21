import ClassesLibrary from '@/components/ClassesLibrary';
import { getPublishedClasses } from '@/lib/classes-data';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Classes',
  description: 'Browse the Morning Class subject library, chapters, lecture videos, and recorded topics.',
  alternates: { canonical: '/classes' },
  robots: { index: false, follow: false, noarchive: true },
};

export default function ClassesPage() {
  const records = getPublishedClasses();
  return <ClassesLibrary records={records} />;
}
