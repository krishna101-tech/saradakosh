import { getClassRecord, getClassTranscript } from '@/lib/classes-data.mjs';
import ClassTranscript from '@/components/ClassTranscript';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function generateMetadata({ params }) {
  const { videoId } = await params;
  const record = await getClassRecord(videoId);
  return { title: `${record.title} · Transcript`, alternates: { canonical: `/classes/transcripts/${videoId}` } };
}

export default async function TranscriptPage({ params }) {
  const { videoId } = await params;
  const { record, markdown } = await getClassTranscript(videoId);
  return <ClassTranscript record={record} markdown={markdown} />;
}
