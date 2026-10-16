import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import test from 'node:test';
import Database from 'better-sqlite3';
import { dbPath } from '../src/lib/db-path.mjs';
import { importLibrary, parseLibrarySnapshot } from '../src/lib/library/import.mjs';
import { approvedCoverAsset, categoryFor, filterBooks, libraryStateQuery, readLibraryState, resolveBookDisplay } from '../src/lib/library/model.mjs';

const raw = fs.readFileSync(new URL('../data/library/books-source.json', import.meta.url));
const snapshot = JSON.parse(raw);
const audit = JSON.parse(fs.readFileSync(new URL('../data/library/books-source-manifest.json', import.meta.url), 'utf8'));
const adjudication = JSON.parse(fs.readFileSync(new URL('../../docs/library-v2/adjudicated-public-links.json', import.meta.url), 'utf8'));
const parsed = parseLibrarySnapshot(snapshot);
const rows = snapshot.spreadsheet.sheets[0].data[0].rowData.slice(1);
const approvedAsset = 'https://res.cloudinary.com/dljwhlvid/image/upload/library/example.webp';
const tableContents = db => ['library_books', 'library_book_links', 'library_book_covers'].map(table => db.prepare(`SELECT * FROM ${table} ORDER BY id`).all());

test('confirmed dead inherited reader is unavailable in every representation without changing the frozen ledger', () => {
  const gospel = parsed.books[0];
  const before = JSON.stringify(gospel);
  for (const mode of ['original', 'bengali']) {
    const links = resolveBookDisplay(gospel, mode).displayLinks;
    assert.equal(links.length, 5);
    assert.equal(links.filter(link => link.unavailable).length, 1);
    assert.equal(links.find(link => link.unavailable).label, 'Bengali 3');
  }
  assert.equal(resolveBookDisplay(gospel, 'english').displayLinks.filter(link => link.unavailable).length, 0);
  assert.equal(JSON.stringify(gospel), before);
  assert.equal(parsed.links.length, 85);
});

test('committed canonical database matches every source field and every approved link mapping', () => {
  const db = new Database(dbPath, { readonly: true });
  try {
    const stored = db.prepare(`SELECT id, person, canonical_title, original_title, author, english_title,
      bengali_title, original_language, sort_order FROM library_books ORDER BY id`).all();
    assert.deepEqual(stored, parsed.books.map(({ links, ...book }) => { void links; return book; }));
    assert.deepEqual(db.prepare('SELECT * FROM library_book_links ORDER BY id').all(), parsed.links.map((link, index) => ({ id: index + 1, ...link })));
    assert.deepEqual(db.pragma('foreign_key_check(library_book_links)'), []);
    assert.deepEqual(db.pragma('foreign_key_check(library_book_covers)'), []);
  } finally { db.close(); }
});

test('lossless approved snapshot: canonical identities, Unicode, all rich-text and single-cell targets', () => {
  assert.equal(createHash('sha256').update(raw).digest('hex'), audit.source_sha256);
  assert.equal(parsed.books.length, 168);
  assert.equal(parsed.links.length, audit.approved_links);
  assert.equal(new Set(parsed.books.map(book => book.canonical_title)).size, 168);
  const languages = {};
  parsed.books.forEach((book, i) => {
    const cells = rows[i].values;
    assert.equal(book.id, i + 1);
    assert.equal(book.sort_order, i);
    for (const [field, col] of [['person', 0], ['canonical_title', 1], ['original_title', 2], ['author', 3], ['english_title', 4], ['bengali_title', 5], ['original_language', 6]]) {
      assert.equal(book[field], cells[col]?.formattedValue || null);
    }
    languages[book.original_language] = (languages[book.original_language] || 0) + 1;
    const source = cells[8] || {};
    const targets = (source.textFormatRuns || []).filter(run => run.format?.link).map(run => run.format.link.uri);
    if (!targets.length && source.hyperlink) targets.push(source.hyperlink);
    assert.deepEqual(book.links.map(link => link.url), targets);
    assert.ok(book.links.every(link => link.book_id === book.id));
  });
  assert.deepEqual(languages, { Bengali: 105, English: 59, French: 1, Hindi: 1, 'not clear': 2 });
  assert.equal(parsed.books.filter(book => !book.english_title).length, 86);
  assert.equal(parsed.books.filter(book => !book.bengali_title).length, 54);
  assert.deepEqual(parsed.books[0].links.map(link => link.label), [
    ...Array.from({ length: 8 }, (_, i) => `English ${i + 1}`), ...Array.from({ length: 5 }, (_, i) => `Bengali ${i + 1}`),
  ]);
  assert.equal(parsed.books[20].links[0].url, 'https://play.google.com/store/books/details/Swami_Pavitrananda_A_Short_Life_of_The_Holy_Mother?id=TDY9DQAAQBAJ');
});

test('idempotent, library-only import preserves summaries and future approved covers', () => {
  const db = new Database(':memory:');
  try {
    db.exec("CREATE TABLE events(id INTEGER PRIMARY KEY, du TEXT); INSERT INTO events VALUES(1, 'Legacy record');");
    assert.deepEqual(importLibrary(db, snapshot), { books: 168, links: audit.approved_links });
    db.prepare('UPDATE library_books SET summary=? WHERE id=1').run('An approved future summary.');
    db.prepare('INSERT INTO library_book_covers(id, book_id, language, asset_url, source_url, source_name, is_primary) VALUES(1, 1, ?, ?, ?, ?, 1)')
      .run('Bengali', approvedAsset, 'https://example.org/provenance', 'Future approved source');
    const before = tableContents(db);
    importLibrary(db, snapshot);
    assert.deepEqual(tableContents(db), before);
    assert.deepEqual(db.prepare('SELECT * FROM events').all(), [{ id: 1, du: 'Legacy record' }]);
    assert.deepEqual(db.pragma('foreign_key_check(library_book_links)'), []);
    assert.deepEqual(db.pragma('foreign_key_check(library_book_covers)'), []);
    assert.deepEqual(db.pragma('integrity_check'), [{ integrity_check: 'ok' }]);
  } finally { db.close(); }
});

test('prevalidation rejects malformed source before any write; transactional failures roll back', () => {
  const db = new Database(':memory:');
  try {
    importLibrary(db, snapshot);
    const before = tableContents(db);
    for (const mutate of [
      source => source.spreadsheet.sheets[0].data[0].rowData.pop(),
      source => { source.spreadsheet.sheets[0].data[0].rowData[1].values[2].formattedValue = ''; },
      source => { source.spreadsheet.sheets[0].data[0].rowData[2].values[1].formattedValue = parsed.books[0].canonical_title; },
      source => { source.spreadsheet.sheets[0].data[0].rowData[1].values[6].formattedValue = 'Invented language'; },
      source => { source.spreadsheet.sheets[0].data[0].rowData[1].values[8].textFormatRuns[0].format.link.uri = 'javascript:alert(1)'; },
    ]) {
      const source = structuredClone(snapshot); mutate(source);
      assert.throws(() => importLibrary(db, source));
      assert.deepEqual(tableContents(db), before);
    }
    db.exec("CREATE TRIGGER reject_import BEFORE INSERT ON library_book_links WHEN NEW.id=2 BEGIN SELECT RAISE(ABORT,'forced failure'); END;");
    assert.throws(() => importLibrary(db, snapshot), /forced failure/);
    assert.deepEqual(tableContents(db), before);
  } finally { db.close(); }
});

test('every language mode preserves all canonical identities and links follow resolved language', () => {
  const identities = parsed.books.map(book => book.id);
  for (const mode of ['original', 'english', 'bengali']) {
    const views = parsed.books.map(book => resolveBookDisplay(book, mode));
    assert.deepEqual(views.map(book => book.id), identities);
    for (const book of views) {
      assert.ok(book.displayTitle);
      assert.ok(book.displayLinks.every(link => link.language === book.displayLanguage));
      assert.equal(book.displayCover, null);
      if (mode === 'english' && !book.english_title) assert.equal(book.availabilityTag, 'English not available');
      if (mode === 'bengali' && !book.bengali_title) assert.equal(book.availabilityTag, 'Bengali not available');
      if (book.original_language === 'not clear' && (mode === 'original' || !book[`${mode}_title`])) assert.equal(book.displayLanguage, 'English');
    }
  }
});

test('fallback title, matching cover, primary preference and safe asset contract', () => {
  const book = {
    original_title: 'মূল বই', original_language: 'Bengali', english_title: null, person: 'Sri Ramakrishna',
    links: [{ language: 'Bengali', url: 'https://example.org/bn' }, { language: 'English', url: 'https://example.org/en' }],
    covers: [
      { id: 1, language: 'English', asset_url: approvedAsset, is_primary: 1, sort_order: 0 },
      { id: 2, language: 'Bengali', asset_url: approvedAsset, is_primary: 0, sort_order: 0 },
      { id: 3, language: 'Bengali', asset_url: approvedAsset, is_primary: 1, sort_order: 1 },
    ],
  };
  const view = resolveBookDisplay(book, 'english');
  assert.equal(view.displayTitle, 'মূল বই');
  assert.equal(view.displayLanguage, 'Bengali');
  assert.equal(view.displayCover.id, 3);
  assert.equal(view.displayLinks[0].url, 'https://example.org/bn');
  assert.equal(view.displayLinks.length, 1);
  for (const value of ['javascript:alert(1)', 'http://res.cloudinary.com/dljwhlvid/image/upload/a.png', 'https://res.cloudinary.com.evil.test/dljwhlvid/image/upload/a.png', 'https://example.org/a.jpg', 'https://res.cloudinary.com/other/image/upload/a.png']) assert.equal(approvedCoverAsset(value), null);
  assert.equal(approvedCoverAsset(approvedAsset), approvedAsset);
});

test('search across all titles, author and person; categories and URL state remain independent', () => {
  const state = readLibraryState(new URLSearchParams('view=list&lang=bengali&person=sarada&q=Mother&page=2'));
  assert.deepEqual(readLibraryState(new URLSearchParams(libraryStateQuery(state))), state);
  assert.deepEqual(readLibraryState(new URLSearchParams('view=bad&lang=bad&person=bad&page=-9')), { view: 'cards', lang: 'original', person: 'all', q: '', page: 1 });
  for (const field of ['canonical_title', 'original_title', 'english_title', 'bengali_title', 'author', 'person']) {
    const book = parsed.books.find(value => value[field]);
    assert.ok(filterBooks(parsed.books, { q: book[field], person: 'all' }).some(value => value.id === book.id));
  }
  const counts = { ramakrishna: 16, sarada: 15, vivekananda: 33, disciples: 99, general: 5 };
  for (const [person, count] of Object.entries(counts)) {
    const result = filterBooks(parsed.books, { q: '', person });
    assert.equal(result.length, count);
    assert.ok(result.every(book => categoryFor(book.person) === person));
  }
});


test('adjudication preserves every original label/target and imports only exact approved additions', () => {
  for (const link of adjudication.baseline_links) assert.ok(parsed.links.some(item => item.book_id === link.book_id && item.label === link.label && item.url === link.url));
  const expected = [...adjudication.baseline_links, ...adjudication.proposed_additions];
  assert.equal(parsed.links.length, expected.length);
  for (const link of parsed.links) assert.ok(expected.some(item => item.book_id === link.book_id && item.url === link.url));
  for (const id of [27, 52]) assert.equal(parsed.books[id - 1].links.length, 0);
  for (const held of adjudication.excluded_new_candidates) assert.ok(!parsed.links.some(link => link.book_id === held.book_id && link.url === held.url));
  assert.match(parsed.books[17].links.find(link => link.language === 'Bengali').annotation, /AI transcription/);
  assert.deepEqual(parsed.books[58].links.map(link => link.label), ['Bengali 1 — AI transcription', 'Bengali 2 — AI transcription', 'Bengali 3 — AI transcription']);
  assert.deepEqual(parsed.books[41].links.map(link => link.label), ['English — Part I', 'English — Part II']);
  assert.match(parsed.books[54].links[0].annotation, /Volume4 not included/);
});

test('valid URL substitution, dropped rich span and identity drift fail closed without writes', () => {
  const db = new Database(':memory:');
  try {
    importLibrary(db, snapshot); const before = tableContents(db);
    for (const mutate of [
      source => { source.spreadsheet.sheets[0].data[0].rowData[59].values[8].textFormatRuns[0].format.link.uri = 'https://example.org/unapproved'; },
      source => { source.spreadsheet.sheets[0].data[0].rowData[59].values[8].textFormatRuns.pop(); },
      source => { source.spreadsheet.sheets[0].data[0].rowData[52].values[3].userEnteredValue = { stringValue: 'Changed author' }; },
    ]) {
      const source = structuredClone(snapshot); mutate(source);
      assert.throws(() => importLibrary(db, source)); assert.deepEqual(tableContents(db), before);
    }
    assert.equal(db.prepare('SELECT COUNT(*) AS n FROM library_import_provenance').get().n, 1);
  } finally { db.close(); }
});
