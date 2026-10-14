import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';

const appRoot = path.resolve(fileURLToPath(new URL('../', import.meta.url)));
const moduleUrl = new URL('../src/lib/db.js', import.meta.url).href;
const pathUrl = new URL('../src/lib/db-path.mjs', import.meta.url).href;

test('actual database and embeddings readers ignore root, app and unrelated cwd', () => {
  const unrelated = mkdtempSync(path.join(tmpdir(), 'saradakosh-db-'));
  try {
    // A plausible decoy makes the regression fail even when a wrong path exists.
    const decoy = new Database(path.join(unrelated, 'saradakosh.db'));
    decoy.exec("CREATE TABLE parameters (id INTEGER, para1 TEXT, type TEXT); INSERT INTO parameters VALUES (1, 'Wrong database', 'Person')");
    decoy.close();
    const code = `
      import assert from 'node:assert/strict';
      const { dbPath } = await import(${JSON.stringify(pathUrl)});
      const data = await import(${JSON.stringify(moduleUrl)});
      assert.equal(dbPath, ${JSON.stringify(path.join(appRoot, 'saradakosh.db'))});
      assert.equal(data.default.name, dbPath);
      assert.equal(data.default.prepare('SELECT COUNT(*) AS n FROM events').get().n, 20635);
      assert.equal(data.getParameterById(79).para1, 'Athens  (Nov 1900)');
      assert.ok(data.getPersons().length > 1);
      assert.ok(Object.keys(data.getRefsHierarchy()).length > 0);
      assert.deepEqual(data.searchEventsVector(new Array(384).fill(0)), []);
      data.default.close();
    `;
    for (const cwd of [path.dirname(appRoot), appRoot, unrelated]) {
      const result = spawnSync(process.execPath, ['--input-type=module', '-e', code], {
        cwd, encoding: 'utf8',
      });
      assert.equal(result.status, 0, `${cwd}: ${result.stdout}\n${result.stderr}`);
    }
  } finally {
    rmSync(unrelated, { recursive: true, force: true });
  }
});
