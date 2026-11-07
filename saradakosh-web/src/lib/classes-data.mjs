import 'server-only';
import { auth } from '@clerk/nextjs/server';
import { notFound } from 'next/navigation';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { gunzipSync } from 'node:zlib';
import { dbPath } from './db-path.mjs';

// Server-only filesystem access after a session check. No catalog or index may
// be imported by a client component or cached across authenticated requests.
export async function getClassRecords() {
  await auth.protect({ token: 'session_token' });
  const raw = await readFile(path.join(path.dirname(dbPath), 'src', 'data', 'classes.json'), 'utf8');
  return JSON.parse(raw).records;
}

export async function getClassRecord(videoId) {
  const records = await getClassRecords();
  if (!/^[A-Za-z0-9_-]{11}$/.test(videoId)) notFound();
  const record = records.find(row => row.videoId === videoId);
  if (!record) notFound();
  return record;
}

export async function getClassTranscript(videoId) {
  const record = await getClassRecord(videoId);
  const appRoot = path.dirname(dbPath);
  const available = JSON.parse(await readFile(path.join(appRoot, 'src', 'data', 'transcripts.json'), 'utf8'));
  if (!available.includes(videoId)) notFound();
  let source;
  try {
    const bytes = await readFile(path.join(appRoot, 'data', 'class-transcripts', `${videoId}.json.gz`));
    source = JSON.parse(gunzipSync(bytes, { maxOutputLength: 4 * 1024 * 1024 }).toString('utf8'));
  } catch {
    notFound();
  }
  if (typeof source.markdown !== 'string' || !source.markdown.trim()) notFound();
  return { record, markdown: source.markdown };
}
