import { notFound } from 'next/navigation';
import ClassesLibrary from '@/components/ClassesLibrary';
import { getPublishedClasses } from '@/lib/classes-data';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function resolveSubject(value) {
  try { return decodeURIComponent(value); } catch { notFound(); }
}

export async function generateMetadata({ params }) {
  const subject = resolveSubject((await params).subject);
  return { 
    title: `${subject} · Classes`, 
    alternates: { canonical: `/classes/${encodeURIComponent(subject)}` },
    robots: { index: false, follow: false, noarchive: true }
  };
}

export default async function SubjectPage({ params }) {
  const subject = resolveSubject((await params).subject);
  const records = await getPublishedClasses();
  const subjects = [...new Set(records.map(record => record.subject))];
  if (!subjects.includes(subject)) notFound();
  return <ClassesLibrary records={records.filter(record => record.subject === subject)} subject={subject} />;
}
