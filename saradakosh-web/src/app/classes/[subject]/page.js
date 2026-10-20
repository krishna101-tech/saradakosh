import { notFound } from 'next/navigation';
import ClassesLibrary from '@/components/ClassesLibrary';
import catalog from '@/data/classes.json';

const subjects = [...new Set(catalog.records.map(record => record.subject))];
function resolveSubject(value) {
  try { return decodeURIComponent(value); } catch { notFound(); }
}

export function generateStaticParams() {
  return subjects.map(subject => ({ subject }));
}

export async function generateMetadata({ params }) {
  const subject = resolveSubject((await params).subject);
  return { title: `${subject} · Classes`, alternates: { canonical: `/classes/${encodeURIComponent(subject)}` } };
}

export default async function SubjectPage({ params }) {
  const subject = resolveSubject((await params).subject);
  if (!subjects.includes(subject)) notFound();
  return <ClassesLibrary records={catalog.records.filter(record => record.subject === subject)} subject={subject} />;
}
