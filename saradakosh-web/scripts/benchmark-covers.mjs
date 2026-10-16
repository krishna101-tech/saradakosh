import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { chromium } from 'playwright';

// Compare two already-built, local production servers. No deployment, hosted
// compute or Cloudinary transformations are created by this measurement.
const [baseline = 'http://127.0.0.1:3194', candidate = 'http://127.0.0.1:3193', output] = process.argv.slice(2);
if (!output) throw new Error('Usage: node scripts/benchmark-covers.mjs BASELINE CANDIDATE OUTPUT.json');
const sourceSha = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
if (execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' }).trim()) throw new Error('Freeze a clean candidate before benchmarking');
const inputHashes = Object.fromEntries(['src/lib/library/model.mjs', 'src/components/library/BookPresentation.jsx',
  'src/components/library/library.css', 'data/library/books-source.json', 'data/library/covers-manifest.json',
  'saradakosh.db', '.next/BUILD_ID'].map(file => [file, createHash('sha256').update(fs.readFileSync(file)).digest('hex')]));
const browser = await chromium.launch();
const manifestRaw = fs.readFileSync(new URL('../data/library/covers-manifest.json', import.meta.url));
const publishedCovers = JSON.parse(manifestRaw).covers.length;
const samples = [];
try {
  for (const [version, origin] of [['v1', baseline], ['v2', candidate]]) {
    for (const route of ['/reports/refs', '/reports/refs?page=7', '/reports/refs?view=list', '/reports/refs?q=Inspired%20Talks']) {
      for (let sample = 0; sample < 3; sample++) {
        const context = await browser.newContext({ viewport: { width: 390, height: 851 },
          deviceScaleFactor: 2, isMobile: true, hasTouch: true });
        const page = await context.newPage(); const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        const cdp = await context.newCDPSession(page);
        await cdp.send('Network.enable');
        const requests = new Map(); let wireBytes = 0; let imageWireBytes = 0; let coverWireBytes = 0;
        cdp.on('Network.requestWillBeSent', event => requests.set(event.requestId, { type: event.type, url: event.request.url }));
        cdp.on('Network.loadingFinished', event => { wireBytes += event.encodedDataLength;
          const request = requests.get(event.requestId);
          if (request?.type === 'Image') imageWireBytes += event.encodedDataLength;
          if (request?.url.includes('/saradakosh/library-covers/')) coverWireBytes += event.encodedDataLength;
        });
        await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1_600_000 / 8, uploadThroughput: 750_000 / 8 });
        await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
        await page.addInitScript(() => {
          window.coverMetrics = { lcp: null, cls: 0, observedLongTaskBlockingMs: 0, interactionEventMaxMs: null };
          new PerformanceObserver(list => { for (const entry of list.getEntries()) window.coverMetrics.lcp = entry.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
          new PerformanceObserver(list => { for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.coverMetrics.cls += entry.value; }).observe({ type: 'layout-shift', buffered: true });
          if (PerformanceObserver.supportedEntryTypes.includes('longtask')) new PerformanceObserver(list => {
            for (const entry of list.getEntries()) window.coverMetrics.observedLongTaskBlockingMs += Math.max(0, entry.duration - 50);
          }).observe({ type: 'longtask', buffered: true });
          if (PerformanceObserver.supportedEntryTypes.includes('event')) new PerformanceObserver(list => {
            for (const entry of list.getEntries()) if (entry.interactionId) window.coverMetrics.interactionEventMaxMs = Math.max(window.coverMetrics.interactionEventMaxMs || 0, entry.duration);
          }).observe({ type: 'event', buffered: true, durationThreshold: 16 });
        });
        for (const cache of ['cold', 'warm']) {
          wireBytes = 0; imageWireBytes = 0; coverWireBytes = 0;
          const status = await page.goto(origin + route);
          await page.locator('ul[aria-label="Books"] > li').first().waitFor();
          await page.evaluate(() => document.fonts.ready);
          // Windows headless Chromium can leave cold-navigation text paints
          // unpresented (only first-paint, no FCP/LCP), despite visible/focused
          // documents and completed animation. A screenshot requests a real
          // compositor frame without disabling animation or editing the page.
          // These are controlled comparative probes, NOT natural field LCP.
          for (let probe = 0; probe < 2; probe++) {
            await page.screenshot({ animations: 'allow' });
            await page.waitForTimeout(250);
            if (await page.evaluate(() => window.coverMetrics.lcp !== null)) break;
          }
          await page.waitForTimeout(500);
          const initialViewportCoverWireBytes = coverWireBytes;
          // A real interaction provides a reproducible ready-to-open proxy; do
          // not mislabel it as retired Lighthouse TTI or a field INP measurement.
          const began = Date.now();
          await page.locator('ul[aria-label="Books"] > li button').first().click();
          await page.getByRole('dialog').waitFor();
          const modalMs = Date.now() - began;
          await page.keyboard.press('Escape');
          await page.waitForTimeout(1000);
          const metrics = await page.evaluate(() => {
            const resources = performance.getEntriesByType('resource');
            const nav = performance.getEntriesByType('navigation')[0];
            const images = resources.filter(entry => entry.initiatorType === 'img');
            return { ...window.coverMetrics, transferBytes: resources.reduce((sum, entry) => sum + entry.transferSize, nav.transferSize),
              encodedBytes: resources.reduce((sum, entry) => sum + entry.encodedBodySize, nav.encodedBodySize),
              imageTransferBytes: images.reduce((sum, entry) => sum + entry.transferSize, 0),
              imageCount: images.length, domContentLoaded: nav.domContentLoadedEventEnd,
              overflow: document.documentElement.scrollWidth > innerWidth };
          });
          samples.push({ version, route, sample, cache, http: status.status(), modalMs, wireBytes, imageWireBytes,
            coverWireBytes, initialViewportCoverWireBytes, ...metrics, errors });
          console.log(`${version} ${route} ${sample + 1} ${cache}: LCP=${metrics.lcp} CLS=${metrics.cls} imageBytes=${imageWireBytes}`);
        }
        await context.close();
      }
    }
  }
} finally { await browser.close(); }
const percentile = (values, p) => values.length ? values.sort((a, b) => a - b)[Math.ceil(values.length * p) - 1] : null;
const summaries = [];
for (const version of ['v1', 'v2']) for (const cache of ['cold', 'warm']) {
  const rows = samples.filter(row => row.version === version && row.cache === cache);
  const lcp = rows.map(row => row.lcp).filter(value => value !== null);
  summaries.push({ version, cache, n: rows.length, lcpObserved: lcp.length, lcpMissing: rows.length - lcp.length, lcpMedian: percentile([...lcp], .5),
    lcpP90: percentile([...lcp], .9), lcpP95: percentile([...lcp], .95),
    maxCls: Math.max(...rows.map(row => row.cls)), medianBytes: percentile(rows.map(row => row.transferBytes), .5),
    maxInitialViewportCoverWireBytes: Math.max(...rows.map(row => row.initialViewportCoverWireBytes)),
    medianModalMs: percentile(rows.map(row => row.modalMs), .5) });
}
fs.writeFileSync(output, JSON.stringify({ observed_at: new Date().toISOString(),
  baseline_revision: '4308284efb7ad886e673286b3deed70a131418eb', candidate_revision: sourceSha,
  source_sha: sourceSha, input_sha256: inputHashes, candidate_build_id: fs.readFileSync('.next/BUILD_ID', 'utf8').trim(),
  candidate_published_covers: publishedCovers, manifest_sha256: createHash('sha256').update(manifestRaw).digest('hex'),
  conditions: { device: 'Mobile 390x851, DPR2, touch', latencyMs: 150, downstreamBps: 1_600_000, upstreamBps: 750_000, cpuSlowdown: 4,
    runsPerRoutePerCache: 3, paintProbe: 'Up to two screenshots with animations allowed request real compositor frames after fonts are ready. Windows headless cold paints otherwise failed to present; this affects absolute LCP. Missing observations stay null and are excluded from percentiles with explicit missing counts. Values are observed controlled-comparison probes and cannot establish natural mobile LCP or the 2.5s target.',
    note: 'Small local simulated sample; p90/p95 descriptive, not a field population estimate. Cold fresh browser context; warm second navigation in same context. Self-hosted font behavior identical. observedLongTaskBlockingMs sums duration above50ms through navigation and modal sampling, not Lighthouse TBT; interactionEventMaxMs is a bounded Event Timing sample, not field INP. Unobserved Event Timing remains null.' },
  summaries, samples }, null, 2) + '\n');
console.log(JSON.stringify(summaries));
