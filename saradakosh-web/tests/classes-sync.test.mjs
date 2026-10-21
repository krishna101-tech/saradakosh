import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import Database from 'better-sqlite3';

// Set up isolated temporary test database BEFORE importing classes-data
const testDbDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sk-classes-sync-test-'));
const testDbPath = path.join(testDbDir, 'test-saradakosh-sync.db');
process.env.SARADAKOSH_DB_PATH = testDbPath;
process.env.SARADAKOSH_SYNC_SECRET = 'test-saradakosh-secret-12345';

const { getPublishedClasses, getPublishedTranscript, initSyncedTables } = await import('../src/lib/classes-data.js');
const { POST } = await import('../src/app/api/sync/classes/route.js');

test.after(() => {
  try {
    fs.rmSync(testDbDir, { recursive: true, force: true });
  } catch {}
  delete process.env.SARADAKOSH_DB_PATH;
  delete process.env.SARADAKOSH_SYNC_SECRET;
});

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

test('API POST /api/sync/classes fails closed when unconfigured or unauthorized', async () => {
  // 1. Missing auth header
  const req1 = new Request('http://localhost:3000/api/sync/classes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ version: 1, action: 'publish' })
  });
  const res1 = await POST(req1);
  assert.equal(res1.status, 401);

  // 2. Wrong token
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

  // 3. Unconfigured server secret fails closed
  const originalSecret = process.env.SARADAKOSH_SYNC_SECRET;
  delete process.env.SARADAKOSH_SYNC_SECRET;
  delete process.env.SYNC_BEARER_TOKEN;
  try {
    const req3 = new Request('http://localhost:3000/api/sync/classes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer any-token'
      },
      body: JSON.stringify({ version: 1, action: 'publish' })
    });
    const res3 = await POST(req3);
    assert.equal(res3.status, 401);
  } finally {
    process.env.SARADAKOSH_SYNC_SECRET = originalSecret;
  }
});

test('API POST /api/sync/classes enforces strict allowlist and publish eligibility gates', async () => {
  const secret = process.env.SARADAKOSH_SYNC_SECRET;

  // Bad version
  const req1 = new Request('http://localhost:3000/api/sync/classes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${secret}` },
    body: JSON.stringify({ version: 2, action: 'publish', classId: 'c1' })
  });
  assert.equal((await POST(req1)).status, 400);

  // Missing date
  const req2 = new Request('http://localhost:3000/api/sync/classes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${secret}` },
    body: JSON.stringify({ version: 1, action: 'publish', classId: 'c1', subject: 'Gita' })
  });
  assert.equal((await POST(req2)).status, 400);

  // Invalid revision (0 or negative) is rejected with 400
  const reqRev0 = new Request('http://localhost:3000/api/sync/classes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${secret}` },
    body: JSON.stringify({ version: 1, action: 'publish', classId: 'c1', date: '2026-10-21', subject: 'Gita', revision: 0 })
  });
  assert.equal((await POST(reqRev0)).status, 400);

  // Publish without videoId is rejected
  const req3 = new Request('http://localhost:3000/api/sync/classes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${secret}` },
    body: JSON.stringify({
      version: 1,
      action: 'publish',
      classId: 'c1',
      date: '2026-10-21',
      subject: 'Gita',
      videoId: null,
      transcript: { markdown: 'some text' }
    })
  });
  assert.equal((await POST(req3)).status, 400);

  // Publish without verified non-empty transcript markdown is rejected
  const req4 = new Request('http://localhost:3000/api/sync/classes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${secret}` },
    body: JSON.stringify({
      version: 1,
      action: 'publish',
      classId: 'c1',
      date: '2026-10-21',
      subject: 'Gita',
      videoId: 'K8GlawawxVg',
      transcript: { markdown: '   ' }
    })
  });
  assert.equal((await POST(req4)).status, 400);
});

test('API POST /api/sync/classes enforces monotonic revisions and handles publish/withdraw lifecycle', async () => {
  const secret = process.env.SARADAKOSH_SYNC_SECRET;
  const testClassId = 'catalog:test-sync-class-888';
  const testVideoId = 'K8GlawawxVg';

  // 1. Initial Publish with revision 2
  const publishRev2 = {
    version: 1,
    classId: testClassId,
    sessionId: 'session-uuid-888',
    revision: 2,
    action: 'publish',
    date: '2026-10-21',
    subject: 'Katha Upanishad Monotonic Test',
    chapter: 'Valli 1',
    title: 'Katha Upanishad Video Title',
    videoId: testVideoId,
    topics: [{ startTime: '00:00:00', endTime: '00:05:00', text: 'Peace Invocation' }],
    transcript: {
      markdown: '# Katha Upanishad\n\n## Peace Invocation\n\nOriginal transcript body.',
      hash: 'hash-888',
      language: 'hi'
    }
  };

  const res1 = await POST(new Request('http://localhost:3000/api/sync/classes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${secret}` },
    body: JSON.stringify(publishRev2)
  }));
  assert.equal(res1.status, 200);
  const body1 = await res1.json();
  assert.equal(body1.success, true);
  assert.equal(body1.action, 'publish');
  assert.equal(body1.revision, 2);

  // Verify visible in public catalog
  let records = getPublishedClasses();
  let found = records.find(r => r.id === testClassId);
  assert.ok(found);
  assert.equal(found.subject, 'Katha Upanishad Monotonic Test');
  assert.equal(found.transcriptAvailable, true);

  // Verify transcript readable
  let t = getPublishedTranscript(testVideoId);
  assert.ok(t);
  assert.ok(t.markdown.includes('Original transcript body.'));

  // 2. Replay of same revision (idempotent duplicate)
  const res2 = await POST(new Request('http://localhost:3000/api/sync/classes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${secret}` },
    body: JSON.stringify(publishRev2)
  }));
  assert.equal(res2.status, 200);
  const body2 = await res2.json();
  assert.equal(body2.status, 'idempotent_duplicate');

  // 3. Stale revision (revision 1 < existing revision 2) is rejected with 409 Conflict
  const stalePayload = { ...publishRev2, revision: 1 };
  const resStale = await POST(new Request('http://localhost:3000/api/sync/classes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${secret}` },
    body: JSON.stringify(stalePayload)
  }));
  assert.equal(resStale.status, 409);

  // 4. Withdraw with revision 3 (tombstone)
  const withdrawRev3 = {
    version: 1,
    classId: testClassId,
    revision: 3,
    action: 'withdraw',
    date: '2026-10-21',
    subject: 'Katha Upanishad Monotonic Test',
    videoId: testVideoId
  };
  const resWithdraw = await POST(new Request('http://localhost:3000/api/sync/classes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${secret}` },
    body: JSON.stringify(withdrawRev3)
  }));
  assert.equal(resWithdraw.status, 200);
  const bodyWithdraw = await resWithdraw.json();
  assert.equal(bodyWithdraw.action, 'withdraw');
  assert.equal(bodyWithdraw.revision, 3);

  // Verify class is removed from catalog
  records = getPublishedClasses();
  found = records.find(r => r.id === testClassId);
  assert.equal(found, undefined);

  // Verify transcript is inaccessible
  t = getPublishedTranscript(testVideoId);
  assert.equal(t, null);

  // 5. Attempting to publish with older or same revision (revision 3) CANNOT overturn the withdrawal
  const conflictPublish = { ...publishRev2, revision: 3 };
  const resConflict = await POST(new Request('http://localhost:3000/api/sync/classes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${secret}` },
    body: JSON.stringify(conflictPublish)
  }));
  assert.equal(resConflict.status, 409);

  // 6. Genuine newer revision (revision 4) re-publishes successfully
  const republicRev4 = { ...publishRev2, revision: 4, title: 'Updated Title Rev 4' };
  const resRepublic = await POST(new Request('http://localhost:3000/api/sync/classes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${secret}` },
    body: JSON.stringify(republicRev4)
  }));
  assert.equal(resRepublic.status, 200);
  const bodyRepublic = await resRepublic.json();
  assert.equal(bodyRepublic.action, 'publish');
  assert.equal(bodyRepublic.revision, 4);

  // Verify visible again
  records = getPublishedClasses();
  found = records.find(r => r.id === testClassId);
  assert.ok(found);
  assert.equal(found.title, 'Updated Title Rev 4');
});

test('API POST /api/sync/classes fails closed with NEEDS OWNER AUTH when VERCEL=1 without remote persistence', async () => {
  const origVercel = process.env.VERCEL;
  const origTurso = process.env.TURSO_DATABASE_URL;
  try {
    process.env.VERCEL = '1';
    delete process.env.TURSO_DATABASE_URL;
    const req = new Request('http://localhost:3000/api/sync/classes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.SARADAKOSH_SYNC_SECRET}` },
      body: JSON.stringify({ version: 1, action: 'publish', classId: 'c1' })
    });
    const res = await POST(req);
    assert.equal(res.status, 503);
    const body = await res.json();
    assert.match(body.error, /NEEDS OWNER AUTH/);
  } finally {
    if (origVercel !== undefined) process.env.VERCEL = origVercel; else delete process.env.VERCEL;
    if (origTurso !== undefined) process.env.TURSO_DATABASE_URL = origTurso; else delete process.env.TURSO_DATABASE_URL;
  }
});
