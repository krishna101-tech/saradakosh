import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Use the server module URL without a literal asset URL: Next.js must keep the
// SQLite file in the server filesystem, never emit it into public static media.
let directory = path.dirname(fileURLToPath(import.meta.url));
let databasePath;
while (true) {
  const manifest = path.join(directory, 'package.json');
  if (fs.existsSync(manifest) && JSON.parse(fs.readFileSync(manifest, 'utf8')).name === 'saradakosh-web') {
    databasePath = path.join(directory, 'saradakosh.db');
    break;
  }
  const parent = path.dirname(directory);
  if (parent === directory) {
    throw new Error('Cannot locate the SaradaKosh application database root');
  }
  directory = parent;
}

export const dbPath = process.env.SARADAKOSH_DB_PATH || databasePath;
