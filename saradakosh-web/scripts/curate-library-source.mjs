import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { ADJUDICATED_MANIFEST_SHA256, approvedMappings, cellText, identityValues, richLinkCell, sha256, snapshotRows } from '../src/lib/library/curation.mjs';

// Plan from exact native backups, then finalize ONLY from connector readback.
const [mode, evidenceDirectory] = process.argv.slice(2);
if (!['plan', 'finalize'].includes(mode) || !path.isAbsolute(evidenceDirectory || '')) throw new Error('Usage: curate-library-source.mjs plan|finalize ABSOLUTE_EVIDENCE_DIRECTORY');
const read = name => JSON.parse(fs.readFileSync(path.join(evidenceDirectory, name), 'utf8'));
const write = (name, value) => fs.writeFileSync(path.join(evidenceDirectory, name), JSON.stringify(value, null, 2) + '\n');
const manifestRaw = fs.readFileSync(new URL('../../docs/library-v2/adjudicated-public-links.json', import.meta.url));
assert.equal(sha256(manifestRaw), ADJUDICATED_MANIFEST_SHA256);
const manifest = JSON.parse(manifestRaw);
const mappings = approvedMappings(manifest);
const before = read('t2-sheet-before.json');
const rows = snapshotRows(before);
const baseline = snapshotRows(read('books-sheet-baseline.json'));
assert.equal(rows.length, 169);
assert.deepEqual(identityValues(rows), identityValues(baseline), 'Concurrent identity change');
const nativeFields = ['userEnteredValue', 'userEnteredFormat', 'textFormatRuns', 'dataValidation', 'note'];
for (let i = 0; i < rows.length; i++) for (let col = 0; col < 9; col++) for (const field of nativeFields) {
  assert.deepEqual(rows[i].values?.[col]?.[field], baseline[i].values?.[col]?.[field], `Concurrent native change ${i + 1}:${col + 1}:${field}`);
}
const extract = (cell, id) => {
  const value = cellText(cell); const runs = cell?.textFormatRuns || [];
  const links = runs.flatMap((run, i) => run.format?.link?.uri ? [{ book_id: id, label: value.slice(run.startIndex || 0, runs[i + 1]?.startIndex ?? value.length).replace(/^[\s·]+|[\s·]+$/gu, ''), url: run.format.link.uri }] : []);
  if (!links.length && cell?.hyperlink) links.push({ book_id: id, label: value.trim(), url: cell.hyperlink });
  return links;
};
assert.deepEqual(rows.slice(1).flatMap((row, i) => extract(row.values?.[8], i + 1)), manifest.baseline_links.map(({ book_id, label, url }) => ({ book_id, label, url })), 'Original hyperlinks changed');
const requests = [];
for (let id = 1; id <= 168; id++) {
  const links = mappings.filter(link => link.book_id === id);
  if (!links.length) continue;
  requests.push({ updateCells: { start: { sheetId: 47022594, rowIndex: id, columnIndex: 8 }, rows: [{ values: [richLinkCell(links)] }], fields: 'userEnteredValue,textFormatRuns,userEnteredFormat.textFormat.link' } });
}
if (mode === 'plan') {
  write('t2-link-requests.json', requests);
  console.log(JSON.stringify({ requests: requests.length, before_links: manifest.baseline_links.length, after_links: mappings.length, identities: rows.length - 1, original_native_fields: 'unchanged', backup_sha256: sha256(fs.readFileSync(path.join(evidenceDirectory, 't2-sheet-before.json'))) }));
} else {
  const after = read('t2-sheet-after.json'); const afterRows = snapshotRows(after);
  assert.equal(afterRows.length, rows.length);
  for (let i = 0; i < rows.length; i++) for (let col = 0; col < 9; col++) {
    if (col !== 8 || !mappings.some(link => link.book_id === i)) assert.deepEqual(afterRows[i].values?.[col], rows[i].values?.[col], `Unrelated cell changed ${i + 1}:${col + 1}`);
    else {
      const expected = richLinkCell(mappings.filter(link => link.book_id === i)); const cell = afterRows[i].values[col];
      assert.deepEqual(cell.userEnteredValue, expected.userEnteredValue);
      // Google drops an empty terminal formatting reset; compare independent link spans exactly.
      assert.deepEqual(extract(cell, i), mappings.filter(link => link.book_id === i).map(({ book_id, label, url }) => ({ book_id, label, url })));
      for (const field of ['dataValidation', 'note']) assert.deepEqual(cell[field], rows[i].values[col]?.[field]);
      const cleanFormat = cell => { const copy = structuredClone(cell?.userEnteredFormat || {}); if (copy.textFormat) { delete copy.textFormat.link; if (!Object.keys(copy.textFormat).length) delete copy.textFormat; } return copy; };
      assert.deepEqual(cleanFormat(cell), cleanFormat(rows[i].values[col]), `Cell format changed ${i + 1}`);
    }
  }
  assert.deepEqual(identityValues(afterRows), identityValues(rows));
  assert.ok(!/https?:\/\/(drive|notebooklm)\.google\.com/iu.test(JSON.stringify(after)), 'Private URL in public snapshot');
  const source = { snapshot_version: 1, captured_at: new Date().toISOString(), source_range: 'Books!A1:I169', expected_books: rows.length - 1, cell_fields: 'userEnteredValue,effectiveValue,formattedValue,userEnteredFormat,effectiveFormat,textFormatRuns,hyperlink,dataValidation,note', spreadsheet: after };
  const raw = JSON.stringify(source, null, 2) + '\n';
  fs.writeFileSync(new URL('../data/library/books-source.json', import.meta.url), raw);
  const audit = { schema_version: 1, source_range: source.source_range, source_sha256: sha256(raw), spreadsheet_sha256: sha256(after), identities_sha256: sha256(identityValues(afterRows)), adjudicated_manifest_sha256: ADJUDICATED_MANIFEST_SHA256, expected_books: rows.length - 1, approved_links: mappings.length, baseline_links: manifest.baseline_links.length, new_links: manifest.proposed_additions.length, books_with_links: new Set(mappings.map(link => link.book_id)).size, native_backup_sha256: sha256(fs.readFileSync(path.join(evidenceDirectory, 't2-sheet-before.json'))) };
  fs.writeFileSync(new URL('../data/library/books-source-manifest.json', import.meta.url), JSON.stringify(audit, null, 2) + '\n');
  write('t2-ingestion-audit.json', audit);
  console.log(JSON.stringify(audit));
}

