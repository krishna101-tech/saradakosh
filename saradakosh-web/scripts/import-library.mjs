import fs from 'node:fs';
import Database from 'better-sqlite3';
import { dbPath } from '../src/lib/db-path.mjs';
import { importLibrary } from '../src/lib/library/import.mjs';
import { sha256 } from '../src/lib/library/curation.mjs';

const raw = fs.readFileSync(new URL('../data/library/books-source.json', import.meta.url));
const audit = JSON.parse(fs.readFileSync(new URL('../data/library/books-source-manifest.json', import.meta.url), 'utf8'));
if (sha256(raw) !== audit.source_sha256) throw new Error('Source file SHA256 mismatch');
const snapshot = JSON.parse(raw);
const db = new Database(dbPath, { fileMustExist: true });
try {
  console.log('Library import:', importLibrary(db, snapshot));
} finally {
  db.close();
}
