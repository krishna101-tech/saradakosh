# Version 02 T3 implementation and validation

Implementation: gpt-6.1-sol, High reasoning, 2026-10-16. AAA GOAL: follow the canonical software-engineering-standards runtime profile; Sol High implementation, independent Sol Medium QA, autonomous bounded repair, zero incremental spend, strict T3 before T4. Implementation baseline: fdec479358884bace2f3e70c633f2cb664f67d1f. Work is uncommitted for coordinator integration; this worker did not push or deploy.

**Published: one verified book/language/edition mapping, four optimized variants and one provider-stored source asset. 167 books have no accepted cover;199 language representations retain fallback.** All168 identities,85 full-text links and editorial content are preserved. Exact coverage is in t3-cover-ledger.json and the complete readable168-book list is t3-missing-covers.md. This bounded lawful survey does not claim exhaustive worldwide cover discovery. Implementation evidence is ready for independent T3 acceptance; T4 has not started in this worktree.

## Authentic source and publication

ID38, *Inspired Talks*, English, **1910 second edition, The Ramakrishna Mission, Mylapore, Madras**, uses its genuine red-cloth outer binding and gold emblem. The original [Internet Archive IIIF first canvas](https://iiif.archive.org/iiif/inspiredtalks00viverich/manifest.json) is **2502×3912 JPEG,1843422 bytes**. The outer binding and title/edition leaf were independently inspected. No title page or other volume is substituted; aspect ratio is intact and no variant is upscaled.

Rights are a reasoned public-domain assessment approved by independent Medium before upload: the [exact historical Commons scan](https://commons.wikimedia.org/wiki/File:Inspired_Talks_of_Swami_Vivekananda_1910_edition.pdf) is marked PD-US, [Belur Math](https://belurmath.org/emblem/) attributes the artwork to Vivekananda(d1902), and the [Indian Act](https://copyright.gov.in/Copyright_Act_1957/chapter_v.html) supports the relevant source-country terms. The old artwork and1910 binding context exceed those terms. This does not assert modern publisher permission, first-print status or endorsement. Storefront images without redistribution authority, tiny title pages and a marked Raja Yoga binding remain held/rejected in t3-cover-research.json.

The coordinator used the authenticated Cloudinary console's supported Web Address upload for the approved public source, bounded free transformations, and Web Address reingest of four preoptimized derivatives. The source and immutable production URLs, SHA256, MIME and HTTP readback are in the checked-in manifest and normalized provenance. No books/PDFs, existing3GB content or unrelated images were uploaded.

| Variant | Dimensions | Body bytes | Budget |
| --- | --- | ---: | ---: |
| AVIF card |320×500|6698|45000|
| AVIF card/density |480×751|16586|45000|
| AVIF enlarged modal |720×1126|65195|150000|
| WebP fallback |320×500|26566|45000|

## Data and delivery

The existing library_book_covers table remains authoritative. npm run import:covers validates the whole data/library/covers-manifest.json before mutation, then adds metadata columns and new keyed rows transactionally. Repeat imports are idempotent; a changed approval aborts rather than overwriting it. Existing covers, all editorial/book fields,85 links and other tables are preserved. No runtime write path or competing service was added. node scripts/report-covers.mjs regenerates the coverage/missing ledger.

The manifest records identity, language, exact edition/volume, identity evidence, public source/publisher, rights assessment/evidence, source dimensions/bytes/format, reviewed date/confidence and immutable variants with dimensions/format/bytes/SHA. Validation rejects identity/language mismatch, unresolved rights, private Drive sources, small/upscaled/cropped inputs, duplicate variants and over-budget outputs before writes.

Rendering accepts preoptimized versioned files only in the approved Cloudinary dljwhlvid image/upload/v…/saradakosh/library-covers/ path. It creates no transformation URLs or application-server resizing work. AVIF/WebP picture/srcset/sizes, explicit dimensions, the reserved3:4 frame, asynchronous decoding, native lazy loading, low fetch priority and object-fit:contain preserve the complete binding. The modal uses a bounded responsive set; List rows have no images. Missing, malformed, unoptimized legacy and failed assets retain the designed fallback. Only render metadata reaches the client; complete provenance stays in the ledger/database.

## Verification

- **6/6 cover,9/9 library,1/1 database tests pass**, including production manifest/database agreement, legacy/editorial preservation, validation before writes, idempotency, malformed runtime data, immutable approvals and rollback after an actual insert followed by forced SQL failure. Independent Medium reran all16 checks and independently verified all4 CDN byte/MIME/SHA readbacks.
- Build passes. Lint: **zero errors,15 preexisting warnings** outside this change. SQLite quick check passes. Independent comparison found all9 non-cover tables identical to T2.
- Focused Library Playwright:18/18 pass across desktop/mobile. Whole-Version T4 was not started.
- **Actual CDN browser checks pass** at390@3×,768@2×,1440@1×,1440@3×: HTTP200/decode, responsive320/480 cards,720px high-DPI modal, Save-Data, list/final page, no overflow or JS errors. Fresh image/font-failure contexts each blocked9 actual self-hosted font requests and restored designed fallback. Evidence: t3-cdn-browser.json; screenshots remain outside Git in the Version02 evidence directory. Visual inspection confirms the crisp complete red binding and legible gold emblem.
- A disposable fixture exposed an SSR race: an image can fail before hydration attaches onError. The callback ref now also detects completed images with zero natural width. The early-error path passes in both fixture and actual-CDN failure tests. Old B&W preparation/fixture files are explicitly historical, not production-source evidence.

## Final paired performance

`t3-performance.json` replaces the earlier zero-cover run. The final observation time is **2026-10-16T07:27:53.220Z**, with **1 published cover,48 observations and48 non-null controlled paint measurements**. Manifest SHA256: `226c9f6e92bbfe32fd9d6a36e59a37de541f0ff2ceb94a5d3d6e3deb1b056cc2`. Baseline is Version01 `4308284efb7ad886e673286b3deed70a131418eb`; candidate is the uncommitted T3 working tree on the T2 baseline above. Neither is a deployed-production claim.

The same two local production builds were compared on the first page, last page, List and the actual *Inspired Talks* cover route. Each route has3 cold fresh-context and3 warm repeat-navigation observations per version:390×851,DPR2,touch,150ms latency,1.6Mbps down/750kbps up and4× CPU slowdown. No CDN response was intercepted or substituted. The benchmark requests compositor frames using screenshots with animations allowed after fonts become ready; **these observed controlled paint probes cannot establish natural mobile LCP or the absolute2.5s target**. Small-sample p90/p95 values are descriptive.

| Measurement | V1 cold | T3 cold | V1 warm | T3 warm |
| --- | ---: | ---: | ---: | ---: |
| Controlled LCP median,ms |2952|2600|600|540|
| Controlled LCP p90,ms |3460|2916|712|652|
| Controlled LCP p95,ms |8552|3224|752|1108|
| Median total transfer,bytes |554016|572756|25875|29304|
| Median click-to-visible-modal proxy,ms |226|174|136|108|
| Maximum CLS |0|0|0|0|

Every observation returned HTTP200, with no JavaScript errors or viewport overflow. The first baseline cold restart outlier8552ms remains in the raw data and p95. The candidate warm p95 increases356ms because of one1108ms observation with an actual CDN response; this does not justify claiming that every percentile improved. Medians and p90 show no broad cover-induced timing regression in this bounded comparison. Modal timings measure click-to-visible-dialog readiness, not Lighthouse TTI or field INP, and do not promise completion of image decoding.

On the actual-cover route, median controlled LCP is2712→2536ms cold and572→476ms warm; the modal proxy is116→113ms cold and96→74ms warm. The largest observed initial-viewport cover transfer is **17112 bytes**, and the largest completed cover transfer including the interaction is **24328 bytes**, well within250KB. The cover-route total-transfer medians are514449→555870 bytes cold and24193→26975 warm, including the rest of the application and T2 content. First/last/List routes make no cover request, and the application never downloads all168 covers.

The first candidate cold cover-route observation had no completed cover response inside the measurement window;0 bytes there means **no completed response**, not a zero-byte delivered image. Subsequent cold/warm observations include real CDN transfers; the separate actual-CDN browser checks establish successful decoding, responsive selection and error fallback. Cross-origin timing/cache boundaries mean network wire-byte counters and Resource Timing transfer totals are separate measurements and are retained as such.

The surviving natural visible Chrome DevTools trace is external evidence at `C:\Users\krish\Documents\SaradaKosh-Version-02-Evidence\t3-natural-chrome-performance.json`: baseline cold4173ms/warm1610ms, candidate LCP unobserved/null in both runs, CLS0 throughout. Those incomplete natural observations cannot establish natural LCP non-regression or compliance with2.5s; no null is converted to0. The existing baseline itself exceeds2.5s cold. This limitation and the controlled-compositor method are explicit acceptance considerations for independent QA and whole-Version T4. Earlier fallback-only performance and monochrome preparation/fixture records remain historical, not final production-cover evidence.

## Always Free and handoff

Official console readback verified cloud dljwhlvid, **Free/$0**,8.57/25 credits used,313 transformations,1.89GB bandwidth and6.54GB storage before actions. The coordinator's fresh post-publication screenshots show **8.88/25 credits used (35.52%;16.12 remaining)**; no further upload or transformation is required. Unknown quota initially stopped uploads until readback. Four immutable variants total115045 bytes; only the approved1.84MB cover source and variants were stored. No paid API/upgrade, hosted Actions run, Vercel deployment or purchased credits was used. Included Plus usage was allowed; earlier implementation telemetry was58% primary/40% weekly used, credits0; resumed-session coordinator telemetry was26% primary used/74% remaining. No reset credit was consumed; token counts and per-worker quota consumption are not observable.

Independent QA drove repairs to raw-URL policy bypass, malformed containers, actual self-hosted font-failure coverage and the SSR early-error race. The resumed Sol High finisher ran one final48-observation benchmark and reconciled the implementation/provenance handoff; a separate Sol Medium owns the quality-review report and final Task gate. No commit, push, production deployment or merge was performed by this finisher. Final acceptance belongs to the independent reviewer; only its T3 PASS permits the coordinator to advance to T4.
