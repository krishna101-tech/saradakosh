import test from 'node:test';
import assert from 'node:assert/strict';
import Database from 'better-sqlite3';
import { dbPath } from '../src/lib/db-path.mjs';
import { getPublishedClasses, getPublishedTranscript, initSyncedTables } from '../src/lib/classes-data.js';
import { POST } from '../src/app/api/sync/classes/route.js';

test('getPublishedClasses returns baseline catalog when no synced classes exist', () => {
  const records = getPublishedClasses();
  assert.equal(records.length, 845);
  assert.equal(records[0].date <= records[1].date, true);
});

test('getPublishedTranscript returns baseline transcript for known video', () => {
  const t = getPublishedTranscript('2UutWVzZlW4');
  assert.ok(t);
  assert.ok(t.markdown.length > 1000);

  const unknown = getPublishedTranscript('unknown1234');
  assert.equal(unknown, null);
});

test('API POST /api/sync/classes rejects unauthorized requests', async () => {
  // Missing auth header
  const req1 = new Request('http://localhost:3000/api/sync/classes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ version: 1, action: 'publish' })
  });
  const res1 = await POST(req1);
  assert.equal(res1.status, 401);

  // Wrong token
  const req2 = new Request('http://localhost:3000/api/sync/classes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer wrong-secret'
    },
    body: JSON.stringify({ version: 1, action: 'publish' })
  });
  const res2 = await POST(req2);
  assert.equal(res2.status, 401);
});

test('API POST /api/sync/classes validates allowlist schema and rejects invalid payload', async () => {
  const secret = process.env.SARADAKOSH_SYNC_SECRET || 'saradakosh-sync-secret-2026';

  // Bad version
  const req1 = new Request('http://localhost:3000/api/sync/classes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${secret}`
    },
    body: JSON.stringify({ version: 2, action: 'publish', classId: 'c1' })
  });
  const res1 = await POST(req1);
  assert.equal(res1.status, 400);

  // Missing date
  const req2 = new Request('http://localhost:3000/api/sync/classes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${secret}`
    },
    body: JSON.stringify({ version: 1, action: 'publish', classId: 'c1', subject: 'Gita' })
  });
  const res2 = await POST(req2);
  assert.equal(res2.status, 400);
});

test('API POST /api/sync/classes publishes, updates and withdraws classes dynamically', async () => {
  const secret = process.env.SARADAKOSH_SYNC_SECRET || 'saradakosh-sync-secret-2026';
  const testClassId = 'catalog:test-sync-class-999';
  const testVideoId = 'K8GlawawxVg';

  // 1. Publish new class
  const publishPayload = {
    version: 1,
    classId: testClassId,
    sessionId: 'test-session-uuid-999',
    revision: 1,
    action: 'publish',
    date: '2026-10-21',
    subject: 'Katha Upanishad Sync Test',
    chapter: 'Valli 1',
    title: 'Katha Upanishad Sync Video',
    videoId: testVideoId,
    topics: [
      { startTime: '00:00:00', endTime: '00:05:00', text: 'Shanti Mantra Sync' }
    ],
    transcript: {
      markdown: '# Katha Upanishad Sync\n\n## Shanti Mantra\n\nशान्ति पाठ।',
      hash: 'testhash123',
      language: 'hi'
    }
  };

  const req1 = new Request('http://localhost:3000/api/sync/classes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${secret}`
    },
    body: JSON.stringify(publishPayload)
  });
  const res1 = await POST(req1);
  assert.equal(res1.status, 200);
  const body1 = await res1.json();
  assert.equal(body1.success, true);
  assert.equal(body1.action, 'publish');

  // Verify class appears in getPublishedClasses
  let records = getPublishedClasses();
  let found = records.find(r => r.id === testClassId);
  assert.ok(found);
  assert.equal(found.subject, 'Katha Upanishad Sync Test');
  assert.equal(found.transcriptAvailable, true);

  // Verify transcript is readable via getPublishedTranscript
  let t = getPublishedTranscript(testVideoId);
  assert.ok(t);
  assert.ok(t.markdown.includes('शान्ति पाठ।'));

  // 2. Withdraw class (tombstone)
  const withdrawPayload = {
    version: 1,
    classId: testClassId,
    revision: 2,
    action: 'withdraw',
    date: '2026-10-21',
    subject: 'Katha Upanishad Sync Test',
    videoId: testVideoId
  };

  const req2 = new Request('http://localhost:3000/api/sync/classes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${secret}`
    },
    body: JSON.stringify(withdrawPayload)
  });
  const res2 = await POST(req2);
  assert.equal(res2.status, 200);
  const body2 = await res2.json();
  assert.equal(body2.action, 'withdraw');

  // Verify class is removed from getPublishedClasses
  records = getPublishedClasses();
  found = records.find(r => r.id === testClassId);
  assert.equal(found, undefined);

  // Verify transcript is inaccessible (returns null)
  t = getPublishedTranscript(testVideoId);
  assert.equal(t, null);

  // Clean up test rows from saradakosh.db
  const db = new Database(dbPath);
  try {
    db.prepare('DELETE FROM synced_classes WHERE class_id = ?').run(testClassId);
    db.prepare('DELETE FROM synced_transcripts WHERE video_id = ?').run(testVideoId);
  } finally {
    db.close();
  }
});
