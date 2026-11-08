import ClassesLibrary from '@/components/ClassesLibrary';
import { getClassRecords } from '@/lib/classes-data.mjs';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export const metadata = {
  title: 'Classes',
  description: 'Browse the Morning Class subject library, chapters, lecture videos, and recorded topics.',
  alternates: { canonical: '/classes' },
};

export default async function ClassesPage() {
  const records = await getClassRecords();
  return <ClassesLibrary records={records} />;
}
