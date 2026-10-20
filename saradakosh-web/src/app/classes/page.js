import ClassesLibrary from '@/components/ClassesLibrary';
import catalog from '@/data/classes.json';

export const metadata = {
  title: 'Classes',
  description: 'Browse the Morning Class subject library, chapters, lecture videos, and recorded topics.',
  alternates: { canonical: '/classes' },
};

export default function ClassesPage() {
  return <ClassesLibrary records={catalog.records} />;
}
