import crypto from 'node:crypto';
import { getSyncDb, initSyncedTables } from '../../../../lib/classes-data.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function verifyAuth(req) {
  const authHeader = req.headers.get('authorization') || '';
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) return false;
  const token = match[1].trim();
  const expectedSecret = process.env.SARADAKOSH_SYNC_SECRET || process.env.SYNC_BEARER_TOKEN || 'saradakosh-sync-secret-2026';
  
  const bufA = Buffer.from(token, 'utf8');
  const bufB = Buffer.from(expectedSecret, 'utf8');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export async function POST(req) {
  if (!verifyAuth(req)) {
    return Response.json({ error: 'Unauthorized: valid Bearer token required.' }, { status: 401 });
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

  let db;
  try {
    db = getSyncDb(false);
    initSyncedTables(db);

    const now = new Date().toISOString();

    if (action === 'withdraw') {
      db.prepare(`
        INSERT INTO synced_classes (
          class_id, session_id, revision, date, subject, chapter, title, video_id, is_withdrawn, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
        ON CONFLICT(class_id) DO UPDATE SET
          revision = excluded.revision,
          is_withdrawn = 1,
          updated_at = excluded.updated_at
      `).run(classId, sessionId || null, Number(revision) || 1, date, subject, chapter, title, videoId, now);

      return Response.json({
        success: true,
        action: 'withdraw',
        classId,
        revision: Number(revision) || 1
      });
    }

    // action === 'publish'
    const hasTranscript = Boolean(transcript && typeof transcript.markdown === 'string' && transcript.markdown.trim());
    const cleanTopics = Array.isArray(topics) ? topics.map(t => ({
      startTime: String(t.startTime || t.start_time || '00:00:00'),
      endTime: String(t.endTime || t.end_time || ''),
      text: String(t.text || t.topic || '').trim()
    })).filter(t => t.text) : [];
    const topicsJson = JSON.stringify(cleanTopics);

    db.transaction(() => {
      // 1. Upsert synced_classes
      db.prepare(`
        INSERT INTO synced_classes (
          class_id, session_id, revision, date, subject, chapter, title, video_id, topics_json, transcript_available, is_withdrawn, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
        ON CONFLICT(class_id) DO UPDATE SET
          session_id = excluded.session_id,
          revision = excluded.revision,
          date = excluded.date,
          subject = excluded.subject,
          chapter = excluded.chapter,
          title = excluded.title,
          video_id = excluded.video_id,
          topics_json = excluded.topics_json,
          transcript_available = excluded.transcript_available,
          is_withdrawn = 0,
          updated_at = excluded.updated_at
      `).run(
        classId,
        sessionId || null,
        Number(revision) || 1,
        date,
        subject,
        chapter,
        title,
        videoId,
        topicsJson,
        hasTranscript ? 1 : 0,
        now
      );

      // 2. If transcript provided, upsert synced_transcripts
      if (hasTranscript && videoId) {
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
          transcript.markdown.trim(),
          transcript.hash || '',
          transcript.language || 'hi',
          transcript.driveFileId || null,
          now
        );
      }
    })();

    return Response.json({
      success: true,
      action: 'publish',
      classId,
      videoId,
      transcriptAvailable: hasTranscript,
      revision: Number(revision) || 1
    });

  } catch (err) {
    console.error('Error processing class sync ingest:', err);
    return Response.json({ error: err.message }, { status: 500 });
  } finally {
    db?.close();
  }
}
