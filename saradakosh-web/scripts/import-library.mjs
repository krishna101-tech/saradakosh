import fs from 'node:fs';
import Database from 'better-sqlite3';
import { dbPath } from '../src/lib/db-path.mjs';
import { importLibrary } from '../src/lib/library/import.mjs';

const snapshot = JSON.parse(fs.readFileSync(new URL('../data/library/books-source.json', import.meta.url), 'utf8'));
const db = new Database(dbPath, { fileMustExist: true });
try {
  console.log('Library import:', importLibrary(db, snapshot));
} finally {
  db.close();
}
