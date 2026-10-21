import { coverAsset } from './covers.mjs';

const publicUrl = value => {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password &&
      !/(?:^|\.)(?:drive\.google\.com|docs\.google\.com)$/u.test(url.hostname);
  } catch { return false; }
};
const positive = value => Number.isInteger(value) && value > 0;

export function validateCoverManifest(manifest, books) {
  if (manifest.schema_version !== 1 || !Array.isArray(manifest.covers)) throw new Error('Invalid cover manifest');
  const keys = new Set();
  for (const cover of manifest.covers) {
    const book = books.find(book => book.id === cover.book_id);
    const languages = book && new Set([book.original_language, book.english_title && 'English', book.bengali_title && 'Bengali']);
    if (!book || book.canonical_title !== cover.canonical_title || !languages.has(cover.language) ||
        !cover.edition || !cover.volume || !cover.key || keys.has(cover.key) ||
        !['single', 'series-volume'].includes(cover.representation) ||
        !cover.identity_evidence || !publicUrl(cover.identity_evidence) ||
        !['permission', 'public-domain', 'open-license'].includes(cover.rights?.basis) ||
        !cover.rights?.assessment || !publicUrl(cover.rights?.evidence_url) ||
        cover.confidence !== 'verified' || !/^\d{4}-\d{2}-\d{2}$/u.test(cover.reviewed_date) ||
        !cover.source?.publisher || !publicUrl(cover.source?.url) || !publicUrl(cover.source?.image_url) ||
        !positive(cover.source?.width) || !positive(cover.source?.height) || !positive(cover.source?.bytes) || !cover.source?.format ||
        cover.source.width < 600 || !Array.isArray(cover.variants) || !cover.variants.length) {
      throw new Error(`Unverified cover identity/rights/source: ${cover.key || 'unknown'}`);
    }
    keys.add(cover.key);
    const variants = new Set();
    for (const variant of cover.variants) {
      const key = `${variant.format}:${variant.width}`;
      if (!coverAsset(variant.url) || !['webp', 'avif'].includes(variant.format) ||
          !new URL(variant.url).pathname.endsWith(`.${variant.format}`) ||
          !positive(variant.width) || !positive(variant.height) || !positive(variant.bytes) ||
          variant.width > cover.source.width || variant.height > cover.source.height ||
          variant.width > 720 || variant.bytes > (variant.width <= 480 ? 45_000 : 150_000) ||
          Math.abs(variant.width / variant.height - cover.source.width / cover.source.height) > 0.005 || variants.has(key)) {
        throw new Error(`Unsafe or over-budget cover variant: ${cover.key}`);
      }
      variants.add(key);
    }
    if (!cover.variants.some(variant => variant.width >= 320 && variant.width <= 480) ||
        !cover.variants.some(variant => variant.width >= Math.min(600, cover.source.width))) {
      throw new Error(`Missing card/modal density variants: ${cover.key}`);
    }
  }
  return manifest.covers;
}

export function importCovers(db, manifest) {
  // Validate everything before schema/data writes. Existing approved rows are
  // immutable; this import owns only new rows identified by their stable key.
  const covers = validateCoverManifest(manifest, db.prepare('SELECT * FROM library_books ORDER BY id').all());
  db.pragma('foreign_keys = ON');
  return db.transaction(() => {
    const columns = new Set(db.prepare('PRAGMA table_info(library_book_covers)').all().map(column => column.name));
    for (const column of ['cover_key', 'edition', 'volume', 'representation', 'variants_json', 'provenance_json']) {
      if (!columns.has(column)) db.exec(`ALTER TABLE library_book_covers ADD COLUMN ${column} TEXT`);
    }
    db.exec('CREATE UNIQUE INDEX IF NOT EXISTS library_cover_key ON library_book_covers(cover_key) WHERE cover_key IS NOT NULL');
    const lookup = db.prepare('SELECT * FROM library_book_covers WHERE cover_key = ?');
    const insert = db.prepare(`INSERT INTO library_book_covers
      (book_id, language, asset_url, source_url, source_name, is_generated, is_primary, sort_order,
       cover_key, edition, volume, representation, variants_json, provenance_json)
      VALUES (@book_id, @language, @asset_url, @source_url, @source_name, 0, 0, @sort_order,
       @cover_key, @edition, @volume, @representation, @variants_json, @provenance_json)`);
    let inserted = 0;
    for (const cover of covers) {
      const primary = cover.variants.find(variant => variant.format === 'webp' && variant.width <= 480) || cover.variants[0];
      const row = { book_id: cover.book_id, language: cover.language, asset_url: primary.url,
        source_url: cover.source.url, source_name: cover.source.publisher, sort_order: cover.sort_order || 0,
        cover_key: cover.key, edition: cover.edition, volume: cover.volume, representation: cover.representation,
        variants_json: JSON.stringify(cover.variants), provenance_json: JSON.stringify(cover) };
      const existing = lookup.get(cover.key);
      if (existing) {
        if (Object.entries(row).some(([key, value]) => existing[key] !== value)) throw new Error(`Approved cover changed: ${cover.key}`);
      } else { insert.run(row); inserted++; }
    }
    if (db.pragma('foreign_key_check(library_book_covers)').length) throw new Error('Cover foreign key invariant failed');
    return { accepted: covers.length, inserted };
  })();
}
