import ClassesLibrary from '@/components/ClassesLibrary';
import catalog from '@/data/classes.json';

export const metadata = {
  title: 'Classes',
  description: 'Browse the Morning Class subject library, chapters, lecture videos, and recorded topics.',
  alternates: { canonical: '/classes' },
};

// The index needs subject cards and record-level search text, not video details.
// Keep each record separate so a query cannot match across two classes.
const subjectGroups = [...new Set(catalog.records.map(record => record.subject))].map(subject => {
  const records = catalog.records.filter(record => record.subject === subject);
  return {
    subject,
    count: records.length,
    chapters: new Set(records.map(record => record.chapter)).size,
    searchTexts: records.map(record => [record.subject, record.chapter, record.title, record.date, ...record.topics].join(' ')),
  };
});

export default function ClassesPage() {
  return <ClassesLibrary subjectGroups={subjectGroups} />;
}
