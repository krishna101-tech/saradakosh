import 'server-only';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { cache } from 'react';
import { notFound } from 'next/navigation';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { gunzipSync } from 'node:zlib';
import { dbPath } from './db-path.mjs';

// React deduplicates only within a server render, never across requests. A
// still-valid JWT alone cannot establish that its Clerk session remains active.
const requireActiveClassSession = cache(async () => {
  const identity = await auth.protect({ token: 'session_token' });
  if (!identity.userId || !identity.sessionId) notFound();
  try {
    const client = await clerkClient();
    const session = await client.sessions.getSession(identity.sessionId);
    if (session.status === 'active' && session.id === identity.sessionId &&
      session.userId === identity.userId) return;
  } catch {
    // Backend outages and missing sessions deny before any private file read.
  }
  notFound();
});

// Server-only filesystem access after a current session check. No catalog or index may
// be imported by a client component or cached across authenticated requests.
export async function getClassRecords() {
  await requireActiveClassSession();
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
