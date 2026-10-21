import { notFound } from 'next/navigation';
import { getPublishedClasses, getPublishedTranscript } from '@/lib/classes-data';
import ClassTranscript from '@/components/ClassTranscript';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { videoId } = await params;
  const records = getPublishedClasses();
  const record = records.find(row => row.videoId === videoId);
  return { 
    title: record ? `${record.title} · Transcript` : 'Transcript', 
    alternates: { canonical: `/classes/transcripts/${videoId}` },
    robots: { index: false, follow: false, noarchive: true }
  };
}

export default async function TranscriptPage({ params }) {
  const { videoId } = await params;
  if (!/^[A-Za-z0-9_-]{11}$/.test(videoId)) notFound();

  const records = getPublishedClasses();
  const record = records.find(row => row.videoId === videoId);
  if (!record) notFound();

  const source = getPublishedTranscript(videoId);
  if (!source || typeof source.markdown !== 'string' || !source.markdown.trim()) notFound();

  return <ClassTranscript record={record} markdown={source.markdown} />;
}
