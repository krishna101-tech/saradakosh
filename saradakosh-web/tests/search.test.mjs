import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import test, { after } from 'node:test';

// Resolve the app's Next.js alias while executing its real action and SQLite DAL.
// Fail the regression immediately if a model runtime or external fetch returns.
const hook = registerHooks({
  resolve(specifier, context, nextResolve) {
    assert.doesNotMatch(specifier, /huggingface|onnxruntime|\/embeddings/);
    if (specifier.startsWith('@/')) {
      return {
        url: new URL(`../src/${specifier.slice(2)}.js`, import.meta.url).href,
        shortCircuit: true,
      };
    }
    return nextResolve(specifier, context);
  },
});
const originalFetch = globalThis.fetch;
globalThis.fetch = () => { throw new Error('Search must not make external requests'); };
const { fetchSearchResults } = await import('../src/app/actions.js');
const { default: db } = await import('../src/lib/db.js');
after(() => {
  if (db.open) db.close();
  globalThis.fetch = originalFetch;
  hook.deregister();
});

test('invalid and short search terms return no results', async () => {
  for (const value of [undefined, null, false, true, 0, 123, {}, [], Symbol('query'), '', 'a', 'ab', ' ab ', '   ', '\n\t']) {
    assert.deepEqual(await fetchSearchResults(value), []);
  }
});

test('keyword matches retain the baseline result order, parent filter and 50-result cap', async () => {
  const expected = [1739,1748,1759,1763,1798,1834,1837,1864,1870,1871,1894,6939,7140,8667,8814,8857,8938,10583,10604,11009,11279,11645,12577,13201,13281,13285,13287,13612,14047,14051,14222,14275,14312,14419,14459,14500,14741,15115,15181,15182,15183,15184,15191,15195,15196,15202,15208,15210,15212,15225];
  const rows = await fetchSearchResults('Vivekananda');
  assert.deepEqual(rows.map(row => row.id), expected);
  assert.ok(rows.every(row => row.child_id === null || row.child_id === ''));
  assert.ok(rows.every(row => row.isTextMatch === true && !row.isVectorMatch));
  assert.ok(rows.every(row => row.du.toLowerCase().includes('vivekananda')));
  assert.ok(db.prepare("SELECT COUNT(*) AS n FROM events WHERE du LIKE '%Vivekananda%' AND (child_id IS NULL OR child_id = '')").get().n > 50);
});

test('normalization preserves trimming, SQLite case handling and truncation before trimming', async () => {
  const expected = await fetchSearchResults('Vivekananda');
  assert.deepEqual(await fetchSearchResults('  vivekananda \n'), expected);
  assert.deepEqual(await fetchSearchResults('Vivekananda' + ' '.repeat(39) + 'excluded suffix'), expected);
  assert.deepEqual(await fetchSearchResults(' '.repeat(49) + 'Vivekananda'), []);
});

test('bound LIKE search retains Unicode and wildcard semantics and rejects SQL injection as text', async () => {
  for (const term of ['Ramakrishna', 'શ્રી', '%__']) {
    const expected = db.prepare("SELECT * FROM events WHERE du LIKE ? AND (child_id IS NULL OR child_id = '') LIMIT 50").all(`%${term}%`);
    assert.ok(expected.length > 0, `Fixture must contain matches for ${term}`);
    assert.deepEqual(await fetchSearchResults(term), expected.map(row => ({ ...row, isTextMatch: true })));
  }
  assert.deepEqual(await fetchSearchResults("' OR 1=1 --"), []);
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM events').get().n, 20635);
});

test('a valid query with no matches returns an empty array', async () => {
  assert.deepEqual(await fetchSearchResults('unknown-xyzzysk-20261021'), []);
});

test('database failure retains the empty-result fallback', async () => {
  db.close();
  const messages = [];
  const originalError = console.error;
  console.error = (...args) => messages.push(args);
  try {
    assert.deepEqual(await fetchSearchResults('Vivekananda'), []);
    assert.equal(messages.length, 1);
    assert.equal(messages[0][0], 'Error searching events:');
  } finally {
    console.error = originalError;
  }
});
