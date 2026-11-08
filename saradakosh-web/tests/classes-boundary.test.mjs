// Anonymous real-HTTP and production artifact tests; no Clerk session is mocked.
import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const origin = process.env.AUTH_TEST_ORIGIN;
const catalog = JSON.parse(await fs.readFile(new URL('../src/data/classes.json', import.meta.url), 'utf8'));
const record = catalog.records.find(row => row.videoId && row.title.length > 35);
const paths = ['/classes', `/classes/${encodeURIComponent(record.subject)}`, `/classes/transcripts/${record.videoId}`];
let browser;
let context;

before(async () => {
  if (!origin) return;
  browser = await chromium.launch({ channel: 'chrome', headless: true });
  context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(`${origin}/sign-in`);
  await page.waitForFunction(() => window.Clerk?.loaded === true);
});

after(async () => { await browser?.close(); });

// Playwright manages the real anonymous Development browser cookie handshake.
// No logged-in user, injected identity or literal mock JWT is used.
async function request(url, options = {}) {
  const response = await context.request.fetch(url, { ...options, maxRedirects: 0 });
  return { status: response.status(), headers: new Headers(response.headers()), text: () => response.text() };
}

for (const route of paths) {
  test(`anonymous document route ${route.split('/').slice(0, 2).join('/')} is private without data`, { skip: !origin }, async () => {
    const response = await request(`${origin}${route}`, { headers: { accept: 'text/html' } });
    assert.ok([302, 303, 307, 308].includes(response.status));
    const location = new URL(response.headers.get('location'), origin);
    assert.equal(location.origin, origin);
    assert.equal(location.pathname, '/sign-in');
    assert.equal(location.searchParams.get('redirect_url'), new URL(route, origin).href);
    assert.match(response.headers.get('cache-control'), /private.*no-store/);
    assert.equal((await response.text()).includes(record.title), false);
  });
}

test('anonymous and forged-token RSC/action requests return no class data', { skip: !origin }, async () => {
  for (const route of paths) {
    for (const { headers, forged, prefetch } of [
      { headers: { rsc: '1', accept: 'text/x-component' } },
      { headers: { rsc: '1', accept: 'text/x-component' }, forged: true },
      { headers: { 'next-router-prefetch': '1', rsc: '1' }, prefetch: true },
    ]) {
      if (forged) await context.addCookies([{ name: '__session', value: 'forged.invalid.session', url: origin }]);
      const response = await request(`${origin}${route}?_rsc=boundary`, { headers });
      if (forged) await context.clearCookies({ name: '__session' });
      if (prefetch) {
        // Next normalizes internal prefetch headers before Proxy. Its safe
        // canonical login redirect is an auth denial, never a data response.
        assert.ok([401, 307].includes(response.status));
        if (response.status === 307) {
          const location = new URL(response.headers.get('location'), origin);
          assert.equal(location.origin, origin);
          assert.equal(location.pathname, '/sign-in');
        }
      } else assert.equal(response.status, 401);
      assert.match(response.headers.get('cache-control'), /private.*no-store/);
      assert.equal((await response.text()).includes(record.title), false);
    }
    const action = await request(`${origin}${route}`, { method: 'POST', headers: { 'next-action': 'invalid-action' } });
    assert.equal(action.status, 401);
    assert.equal((await action.text()).includes(record.title), false);
  }
});

test('raw catalog, index and compressed archives have no public HTTP path', { skip: !origin }, async () => {
  for (const route of ['/src/data/classes.json', '/src/data/transcripts.json', '/data/classes.json',
    `/data/class-transcripts/${record.videoId}.json.gz`, `/class-transcripts/${record.videoId}.json.gz`, '/api/classes']) {
    const response = await request(`${origin}${route}`);
    assert.equal(response.status, 404);
    assert.equal((await response.text()).includes(record.title), false);
  }
});

test('public main homepage remains anonymously readable', { skip: !origin }, async () => {
  const response = await request(origin);
  assert.equal(response.status, 200);
  assert.equal((await response.text()).includes(record.title), false);
});

test('production output has no prerendered Classes data or class metadata in client assets', async () => {
  const manifest = JSON.parse(await fs.readFile(new URL('../.next/prerender-manifest.json', import.meta.url), 'utf8'));
  assert.deepEqual(Object.keys(manifest.routes).filter(route => route === '/classes' || route.startsWith('/classes/')), []);
  const sentinels = catalog.records.filter(row => row.title.length > 35).slice(0, 5).map(row => row.title);
  async function inspect(directory) {
    for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
      const target = path.join(directory, entry.name);
      if (entry.isDirectory()) await inspect(target);
      else if (/\.(?:js|json|map|html)$/.test(entry.name)) {
        const text = await fs.readFile(target, 'utf8');
        for (const sentinel of sentinels) assert.equal(text.includes(sentinel), false, 'Class metadata found in public client asset');
      }
    }
  }
  await inspect(fileURLToPath(new URL('../.next/static/', import.meta.url)));
});
