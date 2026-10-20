import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { gunzipSync } from 'node:zlib';

const root = process.cwd();
const catalog = JSON.parse(fs.readFileSync(path.join(root, 'src/data/classes.json'), 'utf8'));
const available = JSON.parse(fs.readFileSync(path.join(root, 'src/data/transcripts.json'), 'utf8'));
const directory = path.join(root, 'data/class-transcripts');
const normalize = value => value.normalize('NFKC').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#(?:x([0-9a-f]+)|(\d+));/gi, (_, hex, decimal) => String.fromCodePoint(parseInt(hex || decimal, hex ? 16 : 10))).replace(/\s+/g, ' ').trim().toLowerCase();
const videos = new Map();
const ids = new Set();
assert.equal(new Set(available).size, available.length, 'Duplicate transcript IDs');
const transcriptIds = new Set(available);
for (const record of catalog.records) {
  assert(!ids.has(record.id), 'Duplicate class record');
  ids.add(record.id);
  assert(/^\d{4}-\d{2}-\d{2}$/.test(record.date));
  assert.equal(new Date(`${record.date}T00:00:00Z`).toISOString().slice(0, 10), record.date);
  if (record.videoId) {
    assert(/^[A-Za-z0-9_-]{11}$/.test(record.videoId));
    assert(!videos.has(record.videoId), 'Duplicate video ID');
    videos.set(record.videoId, record);
  }
  assert.equal(record.transcriptAvailable, transcriptIds.has(record.videoId));
  if (record.summary) {
    assert(transcriptIds.has(record.videoId), 'Summary without a transcript');
    assert(typeof record.summary === 'string' && record.summary.length <= 1600);
    const sentences = record.summary.match(/[.!?\u0964]+(?:\s|$)/gu) || [];
    assert(sentences.length > 0 && sentences.length <= 5, 'Summary exceeds five sentences');
  }
}
assert.deepEqual(fs.readdirSync(directory).filter(file => file.endsWith('.json.gz')).map(file => file.slice(0, -8)).sort(), [...available].sort());
for (const videoId of available) {
  const record = videos.get(videoId);
  assert(record, 'Transcript without a video');
  const source = JSON.parse(gunzipSync(fs.readFileSync(path.join(directory, `${videoId}.json.gz`)), { maxOutputLength: 4 * 1024 * 1024 }).toString('utf8'));
  assert(typeof source.markdown === 'string' && source.markdown.trim());
  const heading = /^#\s+(.+)$/m.exec(source.markdown)?.[1];
  assert(heading, 'Missing original title heading');
  // The owner explicitly corrected this source-heading typo in this conversation.
  const title = videoId === 'hLx94Hzb4zA' ? normalize(heading).replace('5 sep b 2025', '5 sep 2025') : normalize(heading);
  assert.equal(title, normalize(record.title), `Title mismatch: ${videoId}`);
}
console.log(`PASS: ${catalog.records.length} classes, ${videos.size} unique videos, ${available.length} matched original transcripts, ${videos.size - available.length} unavailable transcripts`);
