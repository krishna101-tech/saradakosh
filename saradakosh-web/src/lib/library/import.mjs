import fs from 'node:fs';
import { ADJUDICATED_MANIFEST_SHA256, approvedMappings, cellText, identityValues, sha256 } from './curation.mjs';

const manifestRaw = fs.readFileSync(new URL('../../../../docs/library-v2/adjudicated-public-links.json', import.meta.url));
if (sha256(manifestRaw) !== ADJUDICATED_MANIFEST_SHA256) throw new Error('Adjudicated manifest hash mismatch');
const approved = approvedMappings(JSON.parse(manifestRaw));
const audit = JSON.parse(fs.readFileSync(new URL('../../../data/library/books-source-manifest.json', import.meta.url), 'utf8'));
const HEADERS = ['Person', 'Canonical Title', 'Original Title', 'Author', 'English Title', 'Bengali Title', 'Original Language', 'NotebookLM', 'Link'];
const LANGUAGES = new Set(['English', 'Bengali', 'French', 'Hindi', 'not clear']);
const text = cellText;

function sourceLinks(cell, bookId) {
  const value = text(cell);
  const runs = cell?.textFormatRuns || [];
  const links = [];
  for (let i = 0; i < runs.length; i++) {
    const start = runs[i].startIndex ?? 0;
    const end = runs[i + 1]?.startIndex ?? value.length;
    if (!Number.isInteger(start) || start < 0 || end <= start || end > value.length) {
      throw new Error(`Invalid rich-text offsets for book ${bookId}`);
    }
    const url = runs[i].format?.link?.uri;
    if (url) links.push({ label: value.slice(start, end).replace(/^[\s·]+|[\s·]+$/gu, ''), url });
  }
  if (!links.length) {
    const url = cell?.hyperlink || cell?.userEnteredFormat?.textFormat?.link?.uri;
    if (url) links.push({ label: value.trim(), url });
  }
  if (value.trim() && !links.length) throw new Error(`Unresolved source hyperlinks for book ${bookId}`);
  return links.map((link, sort_order) => {
    const language = /^(English|Bengali|French|Hindi)\b/u.exec(link.label)?.[1];
    const url = new URL(link.url);
    if (!language || !['https:', 'http:'].includes(url.protocol) || url.username || url.password) {
      throw new Error(`Invalid link language or URL for book ${bookId}`);
    }
    return { ...link, book_id: bookId, language, sort_order };
  });
}

export function parseLibrarySnapshot(snapshot) {
  const source = snapshot.spreadsheet;
  const sheet = source?.sheets?.[0];
  if (snapshot.snapshot_version !== 1 || snapshot.expected_books !== 168 ||
      source?.spreadsheetId !== '19PlVXPdfx6qAJmPVhlnAHU7sRfoQkBbl1p4Gt4iY010' ||
      sheet?.properties?.sheetId !== 47022594 || snapshot.source_range !== 'Books!A1:I169') {
    throw new Error('Unrecognized Library source snapshot');
  }
  const rows = sheet.data?.[0]?.rowData;
  if (!rows || rows.length !== 169 || HEADERS.some((header, i) => text(rows[0].values?.[i]) !== header)) {
    throw new Error('Library source headers or canonical count do not match');
  }
  const identities = new Set();
  const books = rows.slice(1).map((row, index) => {
    const values = HEADERS.map((_, i) => text(row.values?.[i]));
    if (values.some(value => typeof value !== 'string') || !values[0].trim() || !values[1].trim() ||
        !values[2].trim() || !LANGUAGES.has(values[6]) || identities.has(values[1])) {
      throw new Error(`Invalid or duplicate canonical book at source row ${index + 2}`);
    }
    identities.add(values[1]);
    return {
      id: index + 1, person: values[0], canonical_title: values[1], original_title: values[2],
      author: values[3] || null, english_title: values[4] || null, bengali_title: values[5] || null,
      original_language: values[6], sort_order: index, links: sourceLinks(row.values?.[8], index + 1),
    };
  });
  const links = books.flatMap(book => book.links);
  if (audit.adjudicated_manifest_sha256 !== ADJUDICATED_MANIFEST_SHA256 ||
      sha256(snapshot.spreadsheet) !== audit.spreadsheet_sha256 ||
      sha256(identityValues(rows)) !== audit.identities_sha256 ||
      links.length !== approved.length || links.length !== audit.approved_links ||
      links.some((link, i) => ['book_id', 'language', 'label', 'url', 'sort_order'].some(key => link[key] !== approved[i][key]))) {
    throw new Error('Source hash, immutable identities or approved hyperlink mappings differ from manifest');
  }
  for (const book of books) book.links.forEach(link => { link.annotation = approved.find(item => item.book_id === link.book_id && item.sort_order === link.sort_order).annotation; });
  return { books, links };
}

export function importLibrary(db, snapshot) {
  // Validate the entire source before DDL or data changes; failures cannot leave a partial catalogue.
  const { books, links } = parseLibrarySnapshot(snapshot);
  db.pragma('foreign_keys = ON');
  return db.transaction(() => {
    db.exec(`
      CREATE TABLE IF NOT EXISTS library_books (
        id INTEGER PRIMARY KEY, person TEXT NOT NULL, canonical_title TEXT NOT NULL UNIQUE,
        original_title TEXT NOT NULL, original_language TEXT NOT NULL,
        english_title TEXT, bengali_title TEXT, author TEXT, summary TEXT,
        sort_order INTEGER NOT NULL UNIQUE
      );
      CREATE TABLE IF NOT EXISTS library_book_links (
        id INTEGER PRIMARY KEY, book_id INTEGER NOT NULL REFERENCES library_books(id),
        language TEXT NOT NULL, label TEXT NOT NULL, url TEXT NOT NULL, sort_order INTEGER NOT NULL,
        UNIQUE(book_id, sort_order)
      );
      CREATE TABLE IF NOT EXISTS library_book_covers (
        id INTEGER PRIMARY KEY, book_id INTEGER NOT NULL REFERENCES library_books(id),
        language TEXT NOT NULL, asset_url TEXT, source_url TEXT, source_name TEXT,
        is_generated INTEGER NOT NULL DEFAULT 0, is_primary INTEGER NOT NULL DEFAULT 0,
        sort_order INTEGER NOT NULL DEFAULT 0
      );
      CREATE INDEX IF NOT EXISTS library_links_book ON library_book_links(book_id, sort_order);
      CREATE INDEX IF NOT EXISTS library_covers_book ON library_book_covers(book_id, language);
    `);
    if (!db.prepare('PRAGMA table_info(library_book_links)').all().some(column => column.name === 'annotation')) db.exec('ALTER TABLE library_book_links ADD COLUMN annotation TEXT');
    db.exec(`CREATE TABLE IF NOT EXISTS library_import_provenance (
      source_sha256 TEXT PRIMARY KEY, manifest_sha256 TEXT NOT NULL, identities_sha256 TEXT NOT NULL,
      book_count INTEGER NOT NULL, link_count INTEGER NOT NULL, source_range TEXT NOT NULL
    )`);
    const existing = db.prepare('SELECT id, canonical_title FROM library_books ORDER BY id').all();
    if (existing.length && (existing.length !== books.length || existing.some((book, i) => book.id !== books[i].id || book.canonical_title !== books[i].canonical_title))) {
      throw new Error('Canonical identity changed; an explicit catalogue migration is required');
    }
    const bookStatement = db.prepare(`INSERT INTO library_books
      (id, person, canonical_title, original_title, original_language, english_title, bengali_title, author, sort_order)
      VALUES (@id, @person, @canonical_title, @original_title, @original_language, @english_title, @bengali_title, @author, @sort_order)
      ON CONFLICT(id) DO UPDATE SET person=excluded.person, original_title=excluded.original_title,
      original_language=excluded.original_language, english_title=excluded.english_title,
      bengali_title=excluded.bengali_title, author=excluded.author, sort_order=excluded.sort_order`);
    books.forEach(book => bookStatement.run(book));
    db.exec('DELETE FROM library_book_links');
    const linkStatement = db.prepare(`INSERT INTO library_book_links (id, book_id, language, label, url, sort_order, annotation)
      VALUES (@id, @book_id, @language, @label, @url, @sort_order, @annotation)`);
    links.forEach((link, i) => linkStatement.run({ ...link, id: i + 1 }));
    const count = db.prepare('SELECT COUNT(*) AS count FROM library_books').get().count;
    if (count !== books.length || db.pragma('foreign_key_check(library_book_links)').length) throw new Error('Library import invariant failed');
    db.prepare(`INSERT OR IGNORE INTO library_import_provenance VALUES (?, ?, ?, ?, ?, ?)`)
      .run(audit.spreadsheet_sha256, ADJUDICATED_MANIFEST_SHA256, audit.identities_sha256, count, links.length, snapshot.source_range);
    return { books: count, links: links.length };
  })();
}
