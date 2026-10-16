import { createHash } from 'node:crypto';

export const ADJUDICATED_MANIFEST_SHA256 = 'a8b672743698e84d18072dc25eefcab59e72692be485348225aeb3280c95ba46';
export const sha256 = value => createHash('sha256').update(typeof value === 'string' || Buffer.isBuffer(value) ? value : JSON.stringify(value)).digest('hex');
export const cellText = cell => cell?.formattedValue ?? cell?.effectiveValue?.stringValue ?? cell?.userEnteredValue?.stringValue ?? '';
export const snapshotRows = spreadsheet => spreadsheet.sheets[0].data.flatMap(segment => segment.rowData || []);
export const identityValues = rows => rows.slice(1).map(row => Array.from({ length: 7 }, (_, i) => cellText(row.values?.[i])));

export function approvedMappings(manifest) {
  const baseline = manifest.baseline_links;
  const approved = manifest.approved_reader_links;
  if (manifest.schema_version !== 1 || !Array.isArray(baseline) || !Array.isArray(approved) ||
      baseline.some(link => link.decision !== 'preserve_baseline_verbatim') ||
      approved.some(link => link.decision !== 'approved_external_reader_link')) throw new Error('Invalid adjudicated manifest');
  const additions = approved.filter(link => !link.already_in_baseline);
  if (sha256(additions) !== sha256(manifest.proposed_additions)) throw new Error('Manifest additions differ from approvals');
  for (const link of approved.filter(link => link.already_in_baseline)) {
    if (!baseline.some(old => old.book_id === link.book_id && old.url === link.url && old.language === link.language)) throw new Error('Missing approved baseline match');
  }
  const order = new Map();
  const mappings = [...baseline, ...additions].map(link => {
    const adjudication = approved.find(item => item.book_id === link.book_id && item.url === link.url);
    const notes = [];
    if (link.label_semantics === 'source_copy_ordinal_not_volume' && /\d/u.test(link.label)) notes.push('Source copy number; not a volume number.');
    for (const key of ['identity_qualification', 'fidelity_qualification', 'coverage_qualification', 'limitations']) {
      if (adjudication?.[key]) notes.push(adjudication[key]);
    }
    if (link.book_id === 18 && adjudication) notes.push('Bengali AI transcription, combined parts 1–2; printed edition authoritative.');
    if (manifest.baseline_anomalies?.some(item => item.book_id === link.book_id)) notes.push('Existing source is a short centenary-address essay; complete biography not verified.');
    const url = new URL(link.url);
    if (!Number.isInteger(link.book_id) || link.book_id < 1 || link.book_id > 168 ||
        !['http:', 'https:'].includes(url.protocol) || url.username || url.password ||
        ['drive.google.com', 'docs.google.com'].includes(url.hostname)) throw new Error('Unsafe or private approved link');
    const sort_order = order.get(link.book_id) || 0;
    order.set(link.book_id, sort_order + 1);
    return { book_id: link.book_id, language: link.language, label: link.label, url: link.url, sort_order, annotation: notes.join(' ') || null };
  });
  if (new Set(mappings.map(link => `${link.book_id}|${link.url}`)).size !== mappings.length ||
      manifest.counts.baseline_links_preserved !== baseline.length ||
      manifest.counts.approved_reader_links !== approved.length ||
      manifest.counts.proposed_additions !== additions.length) throw new Error('Manifest count or duplicate mismatch');
  return mappings.sort((a, b) => a.book_id - b.book_id || a.sort_order - b.sort_order);
}

export function richLinkCell(links) {
  let value = '';
  const textFormatRuns = [];
  for (const link of links) {
    if (value) value += ' · ';
    textFormatRuns.push({ startIndex: value.length, format: { link: { uri: link.url } } });
    value += link.label;
    textFormatRuns.push({ startIndex: value.length, format: {} });
    if (link.annotation) value += ` (${link.annotation})`;
  }
  return { userEnteredValue: { stringValue: value }, textFormatRuns: textFormatRuns.filter(run => run.startIndex < value.length) };
}
