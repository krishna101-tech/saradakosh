import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import Database from 'better-sqlite3';
import { resolveBookDisplay } from '../src/lib/library/model.mjs';

const [directory] = process.argv.slice(2);
if (!directory) throw new Error('Usage: node scripts/collect-v2-evidence.mjs EXTERNAL_EVIDENCE_DIRECTORY');
const git = args => execFileSync('git', args, { encoding: 'utf8' }).trim();
if (git(['status', '--porcelain'])) throw new Error('Evidence requires a clean frozen tree');
const sha256 = value => createHash('sha256').update(value).digest('hex');
const root = path.resolve('..');
const sourceSha = git(['rev-parse', 'HEAD']);
const t2Sha = 'fdec479358884bace2f3e70c633f2cb664f67d1f';
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'saradakosh-v2-evidence-'));
const baselinePath = path.join(temporary, 't2.db');
fs.writeFileSync(baselinePath, execFileSync('git', ['show', `${t2Sha}:saradakosh-web/saradakosh.db`], { maxBuffer: 50_000_000 }));
const db = new Database('saradakosh.db', { readonly: true });
const before = new Database(baselinePath, { readonly: true });
let database;
try {
  const tables = before.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name!='library_book_covers' ORDER BY name").all().map(row => row.name);
  const equality = Object.fromEntries(tables.map(table => [table, sha256(JSON.stringify(db.prepare(`SELECT * FROM ${table} ORDER BY rowid`).all())) === sha256(JSON.stringify(before.prepare(`SELECT * FROM ${table} ORDER BY rowid`).all()))]));
  const books = db.prepare('SELECT * FROM library_books ORDER BY id').all().map(book => ({ ...book,
    links: db.prepare('SELECT * FROM library_book_links WHERE book_id=? ORDER BY sort_order,id').all(book.id) }));
  const clickable = new Set();
  for (const mode of ['original', 'english', 'bengali']) for (const book of books) {
    for (const link of resolveBookDisplay(book, mode).displayLinks) if (!link.unavailable) clickable.add(`${book.id}|${link.url}`);
  }
  const fk = db.pragma('foreign_key_check');
  database = { integrity_check: db.pragma('integrity_check'), canonical_ids: books.map(book => book.id),
    stored_links: books.reduce((n, book) => n + book.links.length, 0), clickable_reader_instances: clickable.size,
    linked_books: books.filter(book => book.links.length).length, unlinked_books: books.filter(book => !book.links.length).length,
    approved_covers: db.prepare('SELECT count(*) AS n FROM library_book_covers').get().n,
    t2_baseline_sha: t2Sha, non_cover_tables_identical: equality,
    cover_foreign_keys: db.pragma('foreign_key_check(library_book_covers)'),
    link_foreign_keys: db.pragma('foreign_key_check(library_book_links)'),
    legacy_foreign_key_findings: fk.length,
    legacy_foreign_key_findings_equal_t2: JSON.stringify(fk) === JSON.stringify(before.pragma('foreign_key_check')),
    public_link_privacy: books.every(book => book.links.every(link => !['drive.google.com', 'docs.google.com'].includes(new URL(link.url).hostname))) };
} finally { db.close(); before.close(); fs.rmSync(temporary, { recursive: true }); }
const inputs = ['docs/library-v2/adjudicated-public-links.json', 'docs/library-v2/baseline-http-audit.json',
  'docs/library-v2/t3-performance.json', 'docs/library-v2/t3-cdn-browser.json',
  'saradakosh-web/data/library/books-source.json', 'saradakosh-web/data/library/books-source-manifest.json',
  'saradakosh-web/data/library/covers-manifest.json', 'saradakosh-web/saradakosh.db',
  'saradakosh-web/src/lib/library/model.mjs', 'saradakosh-web/src/components/library/BookPresentation.jsx',
  'saradakosh-web/scripts/benchmark-covers.mjs', 'saradakosh-web/tests/e2e/library-v2-integration.spec.js'];
const artifacts = fs.readdirSync(directory).filter(file => /^t4-/.test(file) && !/t4-evidence\.json|t4-handover\.md/.test(file))
  .filter(file => fs.statSync(path.join(directory, file)).isFile()).map(file => ({ path: path.join(directory, file), sha256: sha256(fs.readFileSync(path.join(directory, file))) }));
const report = { observed_at: new Date().toISOString(), source_sha: sourceSha, branch: git(['branch', '--show-current']),
  candidate_build_id: fs.readFileSync('.next/BUILD_ID', 'utf8').trim(),
  input_sha256: Object.fromEntries(inputs.map(file => [file, sha256(fs.readFileSync(path.join(root, file)))])), database,
  artifacts, acceptance: 'PENDING independent whole-Version Medium QA, root remote/PR revision integrity, exact-SHA preview and ChatGPT acceptance',
  dashboard: { state: 'SOURCE_UNAVAILABLE', registry: 'https://github.com/krishna101-tech/software-engineering-standards/tree/main/registry',
    note: 'No claim that the live Dashboard updated; root owns source readback and registry lineage.' },
  limitations: ['55 baseline targets remain frozen and are not85 newly certified full-text readers. Known404 retained in source but has no public anchor; ID4 essay remains explicitly qualified.',
    'Historical T3 working-tree benchmarks are retained as history. Use final t4-performance.json for frozen-candidate comparison.',
    'Controlled screenshot compositor LCP is not natural/field LCP. The absolute2.5s target and field INP remain unproven; null is never zero.',
    '4909 unrelated legacy event_parameters foreign-key findings persist exactly as T2; cover/link foreign keys are clean.'] };
fs.writeFileSync(path.join(directory, 't4-evidence.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ source_sha: sourceSha, database, artifact_count: artifacts.length }));
