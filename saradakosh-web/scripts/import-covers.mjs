import fs from 'node:fs';
import Database from 'better-sqlite3';
import { dbPath } from '../src/lib/db-path.mjs';
import { importCovers } from '../src/lib/library/cover-import.mjs';

const manifest = JSON.parse(fs.readFileSync(new URL('../data/library/covers-manifest.json', import.meta.url), 'utf8'));
const db = new Database(dbPath, { fileMustExist: true });
try { console.log('Cover import:', importCovers(db, manifest)); } finally { db.close(); }
