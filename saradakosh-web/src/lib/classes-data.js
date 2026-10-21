import fs from 'node:fs';
import path from 'node:path';
import { gunzipSync } from 'node:zlib';
import Database from 'better-sqlite3';
import { dbPath } from './db-path.mjs';
import catalog from '../data/classes.json' with { type: 'json' };
import availableTranscripts from '../data/transcripts.json' with { type: 'json' };

export function getSyncDb(readonly = false) {
  const db = new Database(dbPath, { readonly });
  try {
    db.pragma('journal_mode = WAL');
  } catch {}
  return db;
}

export function initSyncedTables(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS synced_classes (
      class_id TEXT PRIMARY KEY,
      session_id TEXT,
      revision INTEGER NOT NULL DEFAULT 1,
      date TEXT NOT NULL,
      subject TEXT NOT NULL,
      chapter TEXT,
      title TEXT,
      video_id TEXT,
      topics_json TEXT NOT NULL DEFAULT '[]',
      transcript_available INTEGER NOT NULL DEFAULT 0,
      is_withdrawn INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
      updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    );
    CREATE TABLE IF NOT EXISTS synced_transcripts (
      video_id TEXT PRIMARY KEY,
      markdown TEXT NOT NULL,
      hash TEXT NOT NULL,
      language TEXT NOT NULL DEFAULT 'hi',
      drive_file_id TEXT,
      updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    );
    CREATE INDEX IF NOT EXISTS idx_synced_classes_video ON synced_classes(video_id);
    CREATE INDEX IF NOT EXISTS idx_synced_classes_subject ON synced_classes(subject);
  `);
}

export function getPublishedClasses() {
  let db;
  let syncedRows = [];
  try {
    db = new Database(dbPath, { readonly: true });
    const hasTable = Boolean(db.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name='synced_classes'").get());
    if (hasTable) {
      syncedRows = db.prepare('SELECT * FROM synced_classes').all();
    }
  } catch {
    // If DB is locked or uninitialized, fallback safely to baseline
  } finally {
    db?.close();
  }

  // Base records from static catalog
  const recordsMap = new Map();
  for (const record of catalog.records) {
    recordsMap.set(record.id, { ...record });
  }

  // Overlay synced rows
  for (const row of syncedRows) {
    if (row.is_withdrawn) {
      // Withdrawn class: remove from catalog
      recordsMap.delete(row.class_id);
      if (row.video_id) {
        recordsMap.delete(`youtube:${row.video_id}`);
      }
    } else {
      // Published class: overlay or insert
      const id = row.class_id.startsWith('legacy:') || row.class_id.startsWith('catalog:') 
        ? row.class_id 
        : (row.video_id ? `youtube:${row.video_id}` : row.class_id);
      
      let parsedTopics = [];
      try {
        const raw = JSON.parse(row.topics_json);
        if (Array.isArray(raw)) {
          parsedTopics = raw.map(t => {
            if (typeof t === 'string') return t;
            if (t && typeof t === 'object') {
              const start = t.startTime || t.start_time || '';
              const text = t.text || t.topic || '';
              return start ? `${start} ${text}`.trim() : text;
            }
            return String(t);
          }).filter(Boolean);
        }
      } catch {}

      recordsMap.set(id, {
        id,
        date: row.date,
        subject: row.subject,
        chapter: row.chapter || row.subject,
        title: row.title || `${row.subject} ${row.date}`,
        videoId: row.video_id,
        topics: parsedTopics,
        transcriptAvailable: Boolean(row.transcript_available)
      });
    }
  }

  const allRecords = Array.from(recordsMap.values());
  allRecords.sort((a, b) => 
    a.date.localeCompare(b.date) || 
    a.subject.localeCompare(b.subject) || 
    (a.chapter || '').localeCompare(b.chapter || '') || 
    a.id.localeCompare(b.id)
  );

  return allRecords;
}

export function getPublishedTranscript(videoId) {
  if (!videoId || !/^[A-Za-z0-9_-]{11}$/.test(videoId)) return null;

  let db;
  try {
    db = new Database(dbPath, { readonly: true });
    // Check if withdrawn
    const hasSyncedClasses = Boolean(db.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name='synced_classes'").get());
    if (hasSyncedClasses) {
      const withdrawn = db.prepare('SELECT 1 FROM synced_classes WHERE video_id = ? AND is_withdrawn = 1').get(videoId);
      if (withdrawn) return null;
    }

    // Check synced_transcripts table first
    const hasSyncedTranscripts = Boolean(db.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name='synced_transcripts'").get());
    if (hasSyncedTranscripts) {
      const row = db.prepare('SELECT markdown FROM synced_transcripts WHERE video_id = ?').get(videoId);
      if (row && typeof row.markdown === 'string' && row.markdown.trim()) {
        return { markdown: row.markdown.trim() };
      }
    }
  } catch {
    // DB error, fallback to static archive
  } finally {
    db?.close();
  }

  // Fallback to baseline compressed transcript file
  if (availableTranscripts.includes(videoId)) {
    try {
      const gzPath = path.join(process.cwd(), 'data', 'class-transcripts', `${videoId}.json.gz`);
      if (fs.existsSync(gzPath)) {
        const bytes = fs.readFileSync(gzPath);
        const source = JSON.parse(gunzipSync(bytes, { maxOutputLength: 4 * 1024 * 1024 }).toString('utf8'));
        if (typeof source.markdown === 'string' && source.markdown.trim()) {
          return { markdown: source.markdown.trim() };
        }
      }
    } catch {}
  }

  return null;
}
