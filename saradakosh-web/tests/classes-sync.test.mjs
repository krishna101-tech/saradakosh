import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import http from 'node:http';
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
const { toTursoValue, fromTursoValue } = await import('../src/lib/turso.js');

test.after(() => {
  try {
    fs.rmSync(testDbDir, { recursive: true, force: true });
  } catch {}
  delete process.env.SARADAKOSH_DB_PATH;
  delete process.env.SARADAKOSH_SYNC_SECRET;
});

test('getPublishedClasses returns baseline catalog when no synced classes exist', async () => {
  const records = await getPublishedClasses();
  assert.equal(records.length, 845);
  assert.equal(records[0].date <= records[1].date, true);
});

test('getPublishedTranscript returns baseline transcript for known video', async () => {
  const t = await getPublishedTranscript('2UutWVzZlW4');
  assert.ok(t);
  assert.ok(t.markdown.length > 1000);

  const unknown = await getPublishedTranscript('unknown1234');
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

  // Publish with hash mismatch is rejected
  const req5 = new Request('http://localhost:3000/api/sync/classes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${secret}` },
    body: JSON.stringify({
      version: 1,
      action: 'publish',
      classId: 'c1',
      date: '2026-10-21',
      subject: 'Gita',
      videoId: 'K8GlawawxVg',
      transcript: {
        markdown: '# Verified Gita Class Markdown Content At Least 20 Chars',
        hash: '0000000000000000000000000000000000000000000000000000000000000000',
        driveFileId: '1hpUro0wTeUvAgQks_Yifw8iH3rAWsvXl'
      }
    })
  });
  assert.equal((await POST(req5)).status, 400);

  // Publish without driveFileId is rejected
  const req6 = new Request('http://localhost:3000/api/sync/classes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${secret}` },
    body: JSON.stringify({
      version: 1,
      action: 'publish',
      classId: 'c1',
      date: '2026-10-21',
      subject: 'Gita',
      videoId: 'K8GlawawxVg',
      transcript: {
        markdown: '# Verified Gita Class Markdown Content At Least 20 Chars',
        hash: crypto.createHash('sha256').update('# Verified Gita Class Markdown Content At Least 20 Chars', 'utf8').digest('hex')
      }
    })
  });
  assert.equal((await POST(req6)).status, 400);

  // Publish with local fake driveFileId (local-...) is strictly rejected
  const req7 = new Request('http://localhost:3000/api/sync/classes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${secret}` },
    body: JSON.stringify({
      version: 1,
      action: 'publish',
      classId: 'c1',
      date: '2026-10-21',
      subject: 'Gita',
      videoId: 'K8GlawawxVg',
      transcript: {
        markdown: '# Verified Gita Class Markdown Content At Least 20 Chars',
        hash: crypto.createHash('sha256').update('# Verified Gita Class Markdown Content At Least 20 Chars', 'utf8').digest('hex'),
        driveFileId: 'local-3a81283921830193'
      }
    })
  });
  assert.equal((await POST(req7)).status, 400);
  const body7 = await req7.json().catch(() => ({}));
});

test('API POST /api/sync/classes enforces monotonic revisions and handles publish/withdraw lifecycle (local SQLite)', async () => {
  const secret = process.env.SARADAKOSH_SYNC_SECRET;
  const testClassId = 'catalog:test-sync-class-888';
  const testVideoId = 'K8GlawawxVg';

  // 1. Initial Publish with revision 2
  const sampleMarkdown = '# Katha Upanishad\n\n## Peace Invocation\n\nOriginal transcript body.';
  const sampleHash = crypto.createHash('sha256').update(sampleMarkdown, 'utf8').digest('hex');
  const sampleDriveId = '1hpUro0wTeUvAgQks_Yifw8iH3rAWsvXl';

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
      markdown: sampleMarkdown,
      hash: sampleHash,
      language: 'hi',
      driveFileId: sampleDriveId
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
  let records = await getPublishedClasses();
  let found = records.find(r => r.id === testClassId);
  assert.ok(found);
  assert.equal(found.subject, 'Katha Upanishad Monotonic Test');
  assert.equal(found.transcriptAvailable, true);

  // Verify transcript readable
  let t = await getPublishedTranscript(testVideoId);
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

  // 2b. Replay of same revision with differing videoId is rejected with 409
  const resDiffPayload = await POST(new Request('http://localhost:3000/api/sync/classes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${secret}` },
    body: JSON.stringify({ ...publishRev2, videoId: 'Different11' })
  }));
  assert.equal(resDiffPayload.status, 409);

  // 2c. Withdraw at same revision as publish is rejected with 409
  const resConflictWithdraw = await POST(new Request('http://localhost:3000/api/sync/classes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${secret}` },
    body: JSON.stringify({
      version: 1,
      classId: testClassId,
      revision: 2,
      action: 'withdraw',
      date: '2026-10-21',
      subject: 'Katha Upanishad Monotonic Test',
      videoId: testVideoId
    })
  }));
  assert.equal(resConflictWithdraw.status, 409);

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
  records = await getPublishedClasses();
  found = records.find(r => r.id === testClassId);
  assert.equal(found, undefined);

  // Verify transcript is inaccessible
  t = await getPublishedTranscript(testVideoId);
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
  records = await getPublishedClasses();
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

test('Turso remote datastore adapter: cross-instance publish, monotonic revisions, idempotent replay, withdrawal, and query overlay', async () => {
  // Create an in-memory SQLite database simulating Turso / LibSQL server
  const mockServerDb = new Database(':memory:');

  const server = http.createServer(async (req, res) => {
    if (req.method === 'POST' && req.url === '/v2/pipeline') {
      let body = '';
      for await (const chunk of req) {
        body += chunk;
      }
      const payload = JSON.parse(body);
      const results = [];

      for (const r of payload.requests || []) {
        if (r.type === 'execute') {
          const sql = r.stmt.sql.trim();
          const args = (r.stmt.args || []).map(a => fromTursoValue(a));

          try {
            if (/^BEGIN/i.test(sql)) {
              mockServerDb.exec('BEGIN');
              results.push({ type: 'ok', response: { type: 'execute', result: { cols: [], rows: [] } } });
            } else if (/^COMMIT/i.test(sql)) {
              mockServerDb.exec('COMMIT');
              results.push({ type: 'ok', response: { type: 'execute', result: { cols: [], rows: [] } } });
            } else if (/^SELECT/i.test(sql)) {
              const stmt = mockServerDb.prepare(sql);
              const rows = stmt.all(...args);
              const cols = stmt.columns().map(c => ({ name: c.name }));
              const formattedRows = rows.map(row => cols.map(c => toTursoValue(row[c.name])));
              results.push({
                type: 'ok',
                response: {
                  type: 'execute',
                  result: {
                    cols,
                    rows: formattedRows,
                    affected_row_count: 0
                  }
                }
              });
            } else {
              // INSERT, UPDATE, DELETE, CREATE
              const stmt = mockServerDb.prepare(sql);
              const info = stmt.run(...args);
              results.push({
                type: 'ok',
                response: {
                  type: 'execute',
                  result: {
                    cols: [],
                    rows: [],
                    affected_row_count: info.changes,
                    last_insert_rowid: info.lastInsertRowid ? String(info.lastInsertRowid) : null
                  }
                }
              });
            }
          } catch (err) {
            results.push({
              type: 'error',
              error: { message: err.message }
            });
          }
        }
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ results }));
      return;
    }

    res.writeHead(404);
    res.end();
  });

  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;

  const origTurso = process.env.TURSO_DATABASE_URL;
  const origToken = process.env.TURSO_AUTH_TOKEN;
  const origVercel = process.env.VERCEL;

  try {
    process.env.TURSO_DATABASE_URL = `http://127.0.0.1:${port}`;
    process.env.TURSO_AUTH_TOKEN = 'test-mock-token';
    process.env.VERCEL = '1'; // Simulate Vercel environment with Turso configured

    // 1. Initialize tables on Turso
    await initSyncedTables();

    // 2. Publish a class to Turso
    const secret = process.env.SARADAKOSH_SYNC_SECRET;
    const testClassId = 'catalog:test-turso-class-999';
    const testVideoId = 'TURSOvideo1';
    const sampleMarkdown = '# Turso Remote Class\n\nVerified remote markdown content for test.';
    const sampleHash = crypto.createHash('sha256').update(sampleMarkdown, 'utf8').digest('hex');
    const sampleDriveId = '1hpUro0wTeUvAgQks_Yifw8iH3rAWsvXl';

    const publishRev1 = {
      version: 1,
      classId: testClassId,
      sessionId: 'session-turso-999',
      revision: 1,
      action: 'publish',
      date: '2026-10-22',
      subject: 'Turso Cloud Subject',
      chapter: 'Turso Chapter 1',
      title: 'Turso Video Title',
      videoId: testVideoId,
      topics: [{ startTime: '00:00:00', text: 'Turso Topic 1' }],
      transcript: {
        markdown: sampleMarkdown,
        hash: sampleHash,
        language: 'hi',
        driveFileId: sampleDriveId
      }
    };

    const resPublish = await POST(new Request('http://localhost:3000/api/sync/classes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${secret}` },
      body: JSON.stringify(publishRev1)
    }));

    // Must return 200 (not 503!) because Turso is configured
    assert.equal(resPublish.status, 200);
    const bodyPublish = await resPublish.json();
    assert.equal(bodyPublish.success, true);
    assert.equal(bodyPublish.action, 'publish');
    assert.equal(bodyPublish.revision, 1);

    // 3. Read back via getPublishedClasses()
    let records = await getPublishedClasses();
    let found = records.find(r => r.id === testClassId);
    assert.ok(found);
    assert.equal(found.subject, 'Turso Cloud Subject');
    assert.equal(found.transcriptAvailable, true);

    // 4. Read back transcript via getPublishedTranscript()
    let t = await getPublishedTranscript(testVideoId);
    assert.ok(t);
    assert.equal(t.markdown, sampleMarkdown);

    // 5. Idempotent replay of same revision returns 200 with idempotent_duplicate
    const resReplay = await POST(new Request('http://localhost:3000/api/sync/classes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${secret}` },
      body: JSON.stringify(publishRev1)
    }));
    assert.equal(resReplay.status, 200);
    const bodyReplay = await resReplay.json();
    assert.equal(bodyReplay.status, 'idempotent_duplicate');

    // 6. Withdraw class with revision 2 (tombstone)
    const withdrawRev2 = {
      version: 1,
      classId: testClassId,
      revision: 2,
      action: 'withdraw',
      date: '2026-10-22',
      subject: 'Turso Cloud Subject',
      videoId: testVideoId
    };
    const resWithdraw = await POST(new Request('http://localhost:3000/api/sync/classes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${secret}` },
      body: JSON.stringify(withdrawRev2)
    }));
    assert.equal(resWithdraw.status, 200);

    // 7. Verify removed from public catalog
    records = await getPublishedClasses();
    found = records.find(r => r.id === testClassId);
    assert.equal(found, undefined);

    // 8. Verify transcript is deleted/inaccessible
    t = await getPublishedTranscript(testVideoId);
    assert.equal(t, null);

  } finally {
    if (origTurso !== undefined) process.env.TURSO_DATABASE_URL = origTurso; else delete process.env.TURSO_DATABASE_URL;
    if (origToken !== undefined) process.env.TURSO_AUTH_TOKEN = origToken; else delete process.env.TURSO_AUTH_TOKEN;
    if (origVercel !== undefined) process.env.VERCEL = origVercel; else delete process.env.VERCEL;

    server.close();
    mockServerDb.close();
  }
});
