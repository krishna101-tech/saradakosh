import crypto from 'node:crypto';
import { getSyncDb, initSyncedTables } from '../../../../lib/classes-data.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function verifyAuth(req) {
  const authHeader = req.headers.get('authorization') || '';
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) return false;
  const token = match[1].trim();
  const expectedSecret = process.env.SARADAKOSH_SYNC_SECRET || process.env.SYNC_BEARER_TOKEN;
  if (!expectedSecret) {
    // Fail closed if sync secret is unconfigured
    return false;
  }
  
  const bufA = Buffer.from(token, 'utf8');
  const bufB = Buffer.from(expectedSecret, 'utf8');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export async function POST(req) {
  if (!verifyAuth(req)) {
    return Response.json({ error: 'Unauthorized: valid Bearer token required.' }, { status: 401 });
  }

  if (process.env.VERCEL === '1') {
    return Response.json({
      error: 'NEEDS OWNER AUTH: Cloud persistent database credentials (TURSO_DATABASE_URL & TURSO_AUTH_TOKEN) and remote storage adapter are not configured in Vercel environment. Ephemeral serverless filesystem cannot persist sync writes across instances.'
    }, { status: 503 });
  }

  let payload;
  try {
    payload = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON payload.' }, { status: 400 });
  }

  const {
    version,
    classId,
    sessionId,
    revision = 1,
    action,
    date,
    subject,
    chapter = '',
    title = '',
    videoId = null,
    topics = [],
    transcript = null
  } = payload || {};

  // Strict allowlist validation
  if (version !== 1) {
    return Response.json({ error: 'Unsupported payload version. Must be 1.' }, { status: 400 });
  }
  if (!classId || typeof classId !== 'string') {
    return Response.json({ error: 'classId is required.' }, { status: 400 });
  }
  if (!['publish', 'withdraw'].includes(action)) {
    return Response.json({ error: 'action must be publish or withdraw.' }, { status: 400 });
  }
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return Response.json({ error: 'date must be in YYYY-MM-DD format.' }, { status: 400 });
  }
  if (!subject || typeof subject !== 'string') {
    return Response.json({ error: 'subject is required.' }, { status: 400 });
  }
  if (videoId && !/^[A-Za-z0-9_-]{11}$/.test(videoId)) {
    return Response.json({ error: 'videoId must be an 11-character string.' }, { status: 400 });
  }

  const incomingRevision = Number.isInteger(Number(revision)) ? Number(revision) : null;
  if (incomingRevision === null || incomingRevision < 1) {
    return Response.json({ error: 'revision must be a positive integer.' }, { status: 400 });
  }

  // Publish eligibility gate
  let cleanMarkdown = '';
  let computedHash = '';
  if (action === 'publish') {
    if (!videoId || !/^[A-Za-z0-9_-]{11}$/.test(videoId)) {
      return Response.json({ error: 'Public classes require a valid 11-character videoId.' }, { status: 400 });
    }
    if (!transcript || typeof transcript.markdown !== 'string' || !transcript.markdown.trim()) {
      return Response.json({ error: 'Public classes require a verified transcript with non-empty markdown.' }, { status: 400 });
    }
    cleanMarkdown = transcript.markdown.trim();
    if (cleanMarkdown.length < 20) {
      return Response.json({ error: 'Public classes transcript markdown is too short to be valid.' }, { status: 400 });
    }
    computedHash = crypto.createHash('sha256').update(cleanMarkdown, 'utf8').digest('hex');
    if (transcript.hash && transcript.hash !== computedHash) {
      return Response.json({ error: 'Transcript SHA-256 hash verification failed: hash does not match content.' }, { status: 400 });
    }
    if (!transcript.driveFileId || typeof transcript.driveFileId !== 'string' || !/^([a-zA-Z0-9_-]{20,}|local-[a-f0-9]+)$/.test(transcript.driveFileId)) {
      return Response.json({ error: 'Public classes require verified cloud Drive provenance (driveFileId).' }, { status: 400 });
    }
  }

  let db;
  try {
    db = getSyncDb(false);
    initSyncedTables(db);

    const now = new Date().toISOString();

    const cleanTopics = Array.isArray(topics) ? topics.map(t => ({
      startTime: String(t.startTime || t.start_time || '00:00:00'),
      endTime: String(t.endTime || t.end_time || ''),
      text: String(t.text || t.topic || '').trim()
    })).filter(t => t.text) : [];
    const topicsJson = JSON.stringify(cleanTopics);

    // Atomic transaction for monotonic check + write
    const tx = db.transaction(() => {
      const existing = db.prepare('SELECT revision, is_withdrawn, video_id FROM synced_classes WHERE class_id = ?').get(classId);
      if (existing) {
        if (incomingRevision < existing.revision) {
          const err = new Error(`Stale revision ${incomingRevision}; current is ${existing.revision}.`);
          err.statusCode = 409;
          err.currentRevision = existing.revision;
          throw err;
        }

        if (incomingRevision === existing.revision) {
          if (existing.is_withdrawn === 1 && action === 'publish') {
            const err = new Error(`Cannot publish with revision ${incomingRevision}; class was already withdrawn at revision ${existing.revision}.`);
            err.statusCode = 409;
            err.currentRevision = existing.revision;
            throw err;
          }
          if (existing.is_withdrawn === 0 && action === 'withdraw') {
            const err = new Error(`Cannot withdraw with revision ${incomingRevision}; class was already published at revision ${existing.revision}. Newer revision required.`);
            err.statusCode = 409;
            err.currentRevision = existing.revision;
            throw err;
          }
          if (existing.video_id !== (videoId || null)) {
            const err = new Error(`Revision conflict: differing payload for same revision ${incomingRevision}.`);
            err.statusCode = 409;
            err.currentRevision = existing.revision;
            throw err;
          }
          return { status: 'idempotent_duplicate', revision: incomingRevision };
        }
      }

      if (action === 'withdraw') {
        db.prepare(`
          INSERT INTO synced_classes (
            class_id, session_id, revision, date, subject, chapter, title, video_id, is_withdrawn, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
          ON CONFLICT(class_id) DO UPDATE SET
            revision = excluded.revision,
            is_withdrawn = 1,
            updated_at = excluded.updated_at
        `).run(classId, sessionId || null, incomingRevision, date, subject, chapter, title, videoId, now);

        return { status: 'withdrawn', revision: incomingRevision };
      }

      // action === 'publish'
      db.prepare(`
        INSERT INTO synced_classes (
          class_id, session_id, revision, date, subject, chapter, title, video_id, topics_json, transcript_available, is_withdrawn, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0, ?)
        ON CONFLICT(class_id) DO UPDATE SET
          session_id = excluded.session_id,
          revision = excluded.revision,
          date = excluded.date,
          subject = excluded.subject,
          chapter = excluded.chapter,
          title = excluded.title,
          video_id = excluded.video_id,
          topics_json = excluded.topics_json,
          transcript_available = 1,
          is_withdrawn = 0,
          updated_at = excluded.updated_at
      `).run(
        classId,
        sessionId || null,
        incomingRevision,
        date,
        subject,
        chapter,
        title,
        videoId,
        topicsJson,
        now
      );

      db.prepare(`
        INSERT INTO synced_transcripts (
          video_id, markdown, hash, language, drive_file_id, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(video_id) DO UPDATE SET
          markdown = excluded.markdown,
          hash = excluded.hash,
          language = excluded.language,
          drive_file_id = excluded.drive_file_id,
          updated_at = excluded.updated_at
      `).run(
        videoId,
        cleanMarkdown,
        computedHash,
        transcript.language || 'hi',
        transcript.driveFileId || null,
        now
      );

      return { status: 'published', revision: incomingRevision };
    });

    const txResult = tx();

    if (txResult.status === 'idempotent_duplicate') {
      return Response.json({
        success: true,
        status: 'idempotent_duplicate',
        action,
        classId,
        revision: txResult.revision
      });
    }

    if (txResult.status === 'withdrawn') {
      return Response.json({
        success: true,
        action: 'withdraw',
        classId,
        revision: txResult.revision
      });
    }

    return Response.json({
      success: true,
      action: 'publish',
      classId,
      videoId,
      transcriptAvailable: true,
      revision: txResult.revision
    });

  } catch (err) {
    if (err.statusCode === 409) {
      return Response.json({
        error: err.message,
        classId,
        currentRevision: err.currentRevision
      }, { status: 409 });
    }
    console.error('Error processing class sync ingest:', err);
    return Response.json({ error: err.message }, { status: 500 });
  } finally {
    db?.close();
  }
}
