import fs from 'node:fs';
import Database from 'better-sqlite3';
import { dbPath } from '../src/lib/db-path.mjs';
import { validateCoverManifest } from '../src/lib/library/cover-import.mjs';

const manifest = JSON.parse(fs.readFileSync(new URL('../data/library/covers-manifest.json', import.meta.url)));
const db = new Database(dbPath, { readonly: true });
try {
  const books = db.prepare('SELECT * FROM library_books ORDER BY id').all();
  const covers = validateCoverManifest(manifest, books);
  const records = books.map(book => {
    const languages = [...new Set([book.original_language === 'not clear' ? 'English' : book.original_language,
      book.english_title && 'English', book.bengali_title && 'Bengali'].filter(Boolean))];
    const accepted = covers.filter(cover => cover.book_id === book.id);
    return { book_id: book.id, canonical_title: book.canonical_title, original_language: book.original_language,
      status: accepted.length ? 'partially-covered' : 'fallback',
      languages: languages.map(language => ({ language,
        accepted: accepted.filter(cover => cover.language === language).map(cover => cover.key),
        missing: !accepted.some(cover => cover.language === language),
        reason: accepted.some(cover => cover.language === language) ? null : 'No matching cover with verified rights, edition and source quality accepted in this bounded survey; designed fallback retained.' })),
      covers: accepted };
  });
  const counts = {};
  for (const cover of covers) counts[cover.language] = (counts[cover.language] || 0) + 1;
  const ledger = { schema_version: 1, reviewed_date: manifest.reviewed_date,
    scope: 'All 168 canonical identities accounted for. Bounded cover survey, not an exhaustive worldwide per-title search. Text-link research does not authorize image redistribution.',
    counts: { canonical_books: books.length, accepted_assets: covers.length,
      uploaded_variants: covers.reduce((count, cover) => count + cover.variants.length, 0), accepted_by_language: counts,
      uploaded_source_assets: covers.filter(cover => cover.source.cdn_source_url).length,
      books_with_cover: records.filter(record => record.covers.length).length,
      books_without_any_cover: records.filter(record => !record.covers.length).length,
      missing_language_representations: records.flatMap(record => record.languages).filter(language => language.missing).length },
    books: records };
  fs.writeFileSync(new URL('../../docs/library-v2/t3-cover-ledger.json', import.meta.url), JSON.stringify(ledger, null, 2) + '\n');
  const lines = ['# T3 cover coverage and missing list', '', ledger.scope, '',
    `Accepted ${covers.length} book/language/edition mappings; uploaded ${ledger.counts.uploaded_variants} optimized variants. ` +
    `${ledger.counts.books_without_any_cover} books have no accepted cover; ${ledger.counts.missing_language_representations} available language representations retain fallback.`, '',
    '| ID | Canonical title | Accepted edition/language | Missing cover languages |', '| --- | --- | --- | --- |'];
  for (const book of records) lines.push(`| ${book.book_id} | ${book.canonical_title.replaceAll('|', '\\|')} | ${book.covers.map(cover => `${cover.language}: ${cover.edition}`).join('; ') || 'None'} | ${book.languages.filter(language => language.missing).map(language => language.language).join(', ') || 'None'} |`);
  fs.writeFileSync(new URL('../../docs/library-v2/t3-missing-covers.md', import.meta.url), lines.join('\n') + '\n');
  console.log(JSON.stringify(ledger.counts));
} finally { db.close(); }
