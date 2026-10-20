import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { gunzipSync } from 'node:zlib';
import { notFound } from 'next/navigation';
import catalog from '@/data/classes.json';
import available from '@/data/transcripts.json';
import ClassTranscript from '@/components/ClassTranscript';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { videoId } = await params;
  const record = catalog.records.find(row => row.videoId === videoId);
  return { title: record ? `${record.title} · Transcript` : 'Transcript', alternates: { canonical: `/classes/transcripts/${videoId}` } };
}

export default async function TranscriptPage({ params }) {
  const { videoId } = await params;
  if (!/^[A-Za-z0-9_-]{11}$/.test(videoId) || !available.includes(videoId)) notFound();
  const record = catalog.records.find(row => row.videoId === videoId);
  if (!record) notFound();
  let source;
  try {
    const bytes = await readFile(path.join(process.cwd(), 'data', 'class-transcripts', `${videoId}.json.gz`));
    source = JSON.parse(gunzipSync(bytes, { maxOutputLength: 4 * 1024 * 1024 }).toString('utf8'));
  } catch { notFound(); }
  if (typeof source.markdown !== 'string' || !source.markdown.trim()) notFound();
  return <ClassTranscript record={record} markdown={source.markdown} />;
}
