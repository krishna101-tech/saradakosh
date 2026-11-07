import { notFound } from 'next/navigation';
import ClassesLibrary from '@/components/ClassesLibrary';
import { getClassRecords } from '@/lib/classes-data.mjs';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

function resolveSubject(value) {
  try { return decodeURIComponent(value); } catch { notFound(); }
}

export async function generateMetadata({ params }) {
  await getClassRecords();
  const subject = resolveSubject((await params).subject);
  return { title: `${subject} · Classes`, alternates: { canonical: `/classes/${encodeURIComponent(subject)}` } };
}

export default async function SubjectPage({ params }) {
  const records = await getClassRecords();
  const subject = resolveSubject((await params).subject);
  const selected = records.filter(record => record.subject === subject);
  if (!selected.length) notFound();
  return <ClassesLibrary records={selected} subject={subject} />;
}
