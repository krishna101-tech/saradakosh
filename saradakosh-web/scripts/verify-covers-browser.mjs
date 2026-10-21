import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const [origin = 'http://127.0.0.1:3193', output, localFixtureDirectory] = process.argv.slice(2);
if (!output) throw new Error('Usage: node scripts/verify-covers-browser.mjs ORIGIN OUTPUT.json');
const screenshotDirectory = process.env.COVER_SCREENSHOT_DIR || path.dirname(output);
fs.mkdirSync(screenshotDirectory, { recursive: true });
const screenshotPath = (width, kind) => path.join(screenshotDirectory, `${path.basename(output, '.json')}-${width}-${kind}.png`);
const browser = await chromium.launch(); const evidence = [];
try {
  for (const [width, dpr] of [[390, 3], [768, 2], [1440, 1], [1440, 3]]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: dpr,
      extraHTTPHeaders: width === 390 ? { 'Save-Data': 'on' } : {} });
    const page = await context.newPage(); const errors = []; const assets = [];
    if (localFixtureDirectory) await page.route('**/saradakosh/library-covers/local-fixture-*', route => {
      const filename = new URL(route.request().url()).pathname.split('/').pop().replace('local-fixture-', '');
      return route.fulfill({ body: fs.readFileSync(path.join(localFixtureDirectory, filename)),
        contentType: filename.endsWith('.avif') ? 'image/avif' : 'image/webp' });
    });
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if (response.url().includes('/library-covers/')) assets.push({ url: response.url(), status: response.status() }); });
    await page.goto(origin + '/reports/refs?q=Inspired%20Talks');
    const cover = page.locator('[data-book-id="38"] .book-cover');
    await cover.locator('img').waitFor();
    await cover.locator('img').evaluate(async img => { await img.decode(); });
    const card = await cover.locator('img').evaluate(img => ({ src: img.currentSrc, naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight, width: img.getBoundingClientRect().width, loading: img.loading, decoding: img.decoding,
      objectFit: getComputedStyle(img).objectFit }));
    assert(card.naturalWidth > 0); assert.equal(card.loading, 'lazy'); assert.equal(card.decoding, 'async'); assert.equal(card.objectFit, 'contain');
    await page.locator('[data-book-id="38"] button').click();
    await page.getByRole('dialog').locator('img').evaluate(async img => { await img.decode(); });
    const modal = await page.getByRole('dialog').locator('img').evaluate(img => ({ src: img.currentSrc,
      width: img.getBoundingClientRect().width, naturalWidth: img.naturalWidth }));
    await page.screenshot({ path: screenshotPath(`${width}@${dpr}x`, 'modal') });
    await page.keyboard.press('Escape');
    await page.screenshot({ path: screenshotPath(`${width}@${dpr}x`, 'card') });
    await page.getByRole('button', { name: 'List', exact: true }).click();
    assert.equal(await page.locator('ul[aria-label="Books"] img').count(), 0);
    await page.getByRole('button', { name: 'Cards', exact: true }).click();
    await page.goto(origin + '/reports/refs?page=7');
    assert.equal(await page.locator('ul[aria-label="Books"] > li').count(), 24);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await context.close();
    // A fresh context makes actual self-hosted font and image failures
    // observable without cached decoded images masking the error path.
    const failureContext = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: dpr });
    const failurePage = await failureContext.newPage();
    failurePage.on('pageerror', error => errors.push(error.message));
    let fontsBlocked = 0;
    await failurePage.route('**/*', route => {
      if (route.request().resourceType() === 'font') { fontsBlocked++; return route.abort(); }
      if (route.request().url().includes('/saradakosh/library-covers/')) return route.abort();
      return route.continue();
    });
    await failurePage.goto(origin + '/reports/refs?q=Inspired%20Talks');
    await failurePage.evaluate(() => document.fonts.ready);
    assert(fontsBlocked > 0, 'font failure scenario must actually block self-hosted font requests');
    // Failure is verified against the actual accepted cover, never a published
    // fake fixture. It must reveal the original designed title/author cover.
    const failedCover = failurePage.locator('[data-book-id="38"] .book-cover');
    await failedCover.scrollIntoViewIfNeeded();
    await failedCover.locator('.cover-design').waitFor();
    assert.match(await failedCover.locator('.cover-title').innerText(), /Inspired Talks/u);
    const fallbackHeight = await failedCover.evaluate(element => element.getBoundingClientRect().height);
    assert.equal(await failurePage.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    assert.deepEqual(errors, []);
    evidence.push({ width, dpr, lowDataRequest: width === 390, card, modal, assets, failureFallback: true, fallbackHeight, fontFallback: true, fontsBlocked,
      listDoesNotLoadImages: true, lastPage24: true, overflow: false, errors });
    await failurePage.screenshot({ path: screenshotPath(`${width}@${dpr}x`, 'fallback') });
    await failureContext.close();
  }
} finally { await browser.close(); }
fs.writeFileSync(output, JSON.stringify({ observed_at: new Date().toISOString(),
  mode: localFixtureDirectory ? 'LOCAL FIXTURE: prepared approved image served through intercepted CDN requests; no real CDN asset exists and this is not publication proof' : 'actual CDN requests', evidence }, null, 2) + '\n');
console.log(JSON.stringify(evidence));
