import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import Database from 'better-sqlite3';
import { importLibrary } from '../src/lib/library/import.mjs';
import { importCovers, validateCoverManifest } from '../src/lib/library/cover-import.mjs';
import { coverAsset, coverDelivery } from '../src/lib/library/covers.mjs';
import { dbPath } from '../src/lib/db-path.mjs';

const snapshot = JSON.parse(fs.readFileSync(new URL('../data/library/books-source.json', import.meta.url)));
const manifest = JSON.parse(fs.readFileSync(new URL('../data/library/covers-manifest.json', import.meta.url)));
const emptyManifest = { schema_version: 1, covers: [] };
const url = name => `https://res.cloudinary.com/dljwhlvid/image/upload/v1/saradakosh/library-covers/${name}.webp`;
// Synthetic metadata exercises policy only; never a publishable/approved cover.
const fixture = () => ({ schema_version: 1, covers: [{ key: 'synthetic-test', book_id: 3,
  canonical_title: 'Life of Sri Ramakrishna', language: 'English', edition: 'TEST ONLY', volume: 'Single volume',
  representation: 'single', identity_evidence: 'https://example.org/edition', confidence: 'verified', reviewed_date: '2026-10-16',
  source: { publisher: 'Test fixture', url: 'https://example.org/book', image_url: 'https://example.org/cover.jpg', width: 900, height: 1200, bytes: 200000, format: 'jpeg' },
  rights: { basis: 'permission', assessment: 'Synthetic test only', evidence_url: 'https://example.org/permission' },
  variants: [320, 480, 720].map(width => ({ url: url(`test-${width}`), width, height: Math.round(width * 4 / 3), bytes: width <= 480 ? 20000 : 60000, format: 'webp' })),
}] });
function database() { const db = new Database(':memory:'); importLibrary(db, snapshot); return db; }
const dump = db => db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all()
  .map(({ name }) => [name, db.prepare(`SELECT * FROM ${name}`).all()]);

test('an empty manifest and repeat import preserve existing approved covers and all content', () => {
  const db = database();
  try {
    db.exec('CREATE TABLE editorial (text TEXT); INSERT INTO editorial VALUES (\'keep\')');
    db.prepare('UPDATE library_books SET summary = ? WHERE id=3').run('Editorial summary');
    db.prepare('INSERT INTO library_book_covers (book_id, language, asset_url, source_name) VALUES (3, ?, ?, ?)').run('English', url('previous'), 'Previously approved');
    assert.deepEqual(importCovers(db, emptyManifest), { accepted: 0, inserted: 0 });
    const before = dump(db);
    assert.deepEqual(importCovers(db, emptyManifest), { accepted: 0, inserted: 0 });
    assert.deepEqual(dump(db), before);
    assert.equal(db.prepare('SELECT count(*) n FROM library_book_links').get().n, 85);
    assert.equal(db.prepare('SELECT count(*) n FROM library_books').get().n, 168);
    assert.equal(db.prepare('SELECT summary FROM library_books WHERE id=3').get().summary, 'Editorial summary');
  } finally { db.close(); }
});

test('verified manifest imports deterministically, preserving earlier rows; mutation rolls back', () => {
  const db = database();
  try {
    assert.deepEqual(importCovers(db, fixture()), { accepted: 1, inserted: 1 });
    assert.deepEqual(importCovers(db, fixture()), { accepted: 1, inserted: 0 });
    const before = dump(db);
    const changed = fixture(); changed.covers[0].edition = 'Changed edition';
    assert.throws(() => importCovers(db, changed), /Approved cover changed/);
    assert.deepEqual(dump(db), before);
  } finally { db.close(); }
});

test('reject wrong identity/language, uncertain rights, tiny/upscaled/cropped/oversized and private assets before mutation', () => {
  const db = database(); const before = dump(db);
  try {
    const changes = [c => c.canonical_title = 'Wrong book', c => c.language = 'French', c => c.edition = '',
      c => c.rights.basis = 'viewable', c => c.rights.evidence_url = 'https://drive.google.com/file/d/private/view',
      c => c.source.width = 200, c => c.source.image_url = 'https://docs.google.com/private',
      c => c.variants[0].bytes = 45001, c => c.variants[0].height = 300,
      c => c.variants[0].url = 'https://publisher.example/cover.webp', c => c.variants[2].width = 1000];
    for (const change of changes) { const value = fixture(); change(value.covers[0]); assert.throws(() => importCovers(db, value)); }
    assert.deepEqual(dump(db), before);
    assert.throws(() => validateCoverManifest({ ...fixture(), covers: [...fixture().covers, ...fixture().covers] }, db.prepare('SELECT * FROM library_books').all()));
  } finally { db.close(); }
});

test('responsive delivery excludes unsafe assets and large modal variants on cards', () => {
  const cover = { variants_json: JSON.stringify(fixture().covers[0].variants) };
  const card = coverDelivery(cover); const detail = coverDelivery(cover, true);
  assert.match(card.sources[0].srcSet, /320w/); assert.match(card.sources[0].srcSet, /480w/);
  assert.doesNotMatch(card.sources[0].srcSet, /720w/); assert.match(detail.sources[0].srcSet, /720w/);
  assert.equal(coverDelivery({ variants_json: 'bad' }), null);
  for (const variants_json of ['{}', 'null', '[null]', '[5]', '"text"']) assert.equal(coverDelivery({ variants_json }), null);
  for (const value of [url('x').replace('dljwhlvid', 'other'), url('x') + '?x=1', url('x').replace('https:', 'http:'),
    url('x').replace('image/upload/', 'image/upload/w_720/'), 'https://user:pass@res.cloudinary.com/dljwhlvid/image/upload/x.webp']) {
    assert.equal(coverAsset(value), null);
  }
});

test('a failure after an actual insert rolls back every row in the cover import transaction', () => {
  const db = database();
  try {
    importCovers(db, emptyManifest);
    db.exec(`CREATE TRIGGER reject_second_cover BEFORE INSERT ON library_book_covers
      WHEN NEW.cover_key = 'synthetic-second' BEGIN SELECT RAISE(ABORT, 'forced cover failure'); END`);
    const before = dump(db); const batch = fixture();
    batch.covers.push({ ...structuredClone(batch.covers[0]), key: 'synthetic-second' });
    assert.throws(() => importCovers(db, batch), /forced cover failure/);
    assert.deepEqual(dump(db), before);
  } finally { db.close(); }
});

test('published production mappings match the immutable manifest without omitted provenance or variants', () => {
  const db = new Database(dbPath, { readonly: true });
  try {
    const covers = validateCoverManifest(manifest, db.prepare('SELECT * FROM library_books').all());
    assert(covers.length > 0, 'T3 production manifest must contain a genuinely published cover');
    for (const cover of covers) {
      const row = db.prepare('SELECT * FROM library_book_covers WHERE cover_key = ?').get(cover.key);
      assert.equal(row.book_id, cover.book_id); assert.equal(row.language, cover.language);
      assert.deepEqual(JSON.parse(row.provenance_json), cover);
      assert.deepEqual(JSON.parse(row.variants_json), cover.variants);
      assert(coverDelivery(row)); assert(coverDelivery(row, true));
    }
    assert.deepEqual(db.pragma('foreign_key_check(library_book_covers)'), []);
  } finally { db.close(); }
});
