# Version 02 T2 link ingestion

Implementation: gpt-6.1-sol, High reasoning, 2026-10-15. Authority: Issue25 and canonical software-engineering-standards/docs/AAA_RUNTIME_PROFILE.md. Incremental spend: zero; token telemetry not observable. T1 independent Medium PASS and exact adjudicated manifest SHA256 `a8b672743698e84d18072dc25eefcab59e72692be485348225aeb3280c95ba46` preceded execution. No new research decisions were made here.

## Result

168 canonical identities remain immutable. Preserved all55 original labels and URLs. Added30 exact approved targets from T1;34 adjudicated reader instances include4 existing targets. Links increase55→85, books with a source15→39, books without a listed source153→129. Eleven explicitly rejected new candidates remain excluded. Existing baseline preservation is not a new completeness/rights certification; ID4 visibly identifies its short-essay limitation. Source links authorize external reading only, not copying or redistribution.

Each series remains one book. Existing source-copy numbers remain verbatim with visible mirror clarification; existing Bengali Vol.1–10 stay in numeric order. Combined sources49/95 use1–2/1–3;55 visibly limits coverage to1–3 and excludes later4;36 retains both named sections;42 retains Parts I and II. ID18/59 AI-assisted transcriptions visibly defer to the printed edition. ID2 identifies Jagadananda's Great Master translation without silently equating it to Divine Play. Qualifications appear in the Sheet and Cards/List/modal under the resolved language.

Sheet row28/ID27 and row53/ID52 remain single books with no approved public source. ID52's full1983 text was found, but public-host authorization remains unresolved. ID27 private matches stay private. Holds14/44/74/75 and other unapproved additions remain excluded; existing approved baseline targets remain intact. No private Drive URLs, sharing changes, cover work, CDN uploads or deployment.

## Native Sheet evidence

Fresh exact CellData capture of Books!A1:I169 includes userEnteredValue, effectiveValue, formattedValue, userEnteredFormat, effectiveFormat, textFormatRuns, hyperlink, dataValidation and note. External evidence directory: `C:\Users\krish\Documents\SaradaKosh-Version-02-Evidence`.

- `t2-sheet-before.json`: SHA256 `d9d05e54e76a3b4dd7deec51e72126afc6c593200baeb289e3a0cb6ea8d8c2b8`.
- `t2-sheet-after.json`: complete connector readback; exact source of the committed lossless snapshot.
- `t2-link-requests.json`:39 I-cell updates only; writable mask userEnteredValue,textFormatRuns,userEnteredFormat.textFormat.link. Every target has an independent linked span; notes/separators are unlinked.
- `t2-database-before.db`: exact authoritative DB backup SHA256 `9e698c7652a1bdd1c1055fb3b9c49c74984deedabc72255d16a1a0530439a2f6`.

Fresh reread immediately before mutation matched the backup. Comparison against the original native baseline detected no concurrent writable-field/identity/55-link changes. Finalizer verifies every A:H cell and untouched I cell exactly,168 identities,85 precise rich-link spans, validation/notes and original formatting. Writable non-link style values are preserved; an empty Google-created textFormat object is normalized as equivalent. The old whole-cell link is cleared in favor of independent rich spans. Google recalculates effective hyperlink decoration (color/underline/link/display type); these derived changes are retained in the lossless readback. API-format verification succeeded; a native Google-rendered Sheet visual inspection was not captured. Dimensions/formatting were preserved.

Initial batch was atomically rejected because Google disallows a terminal formatting reset at string length. Removed that empty terminal run, then the entire39-cell batch succeeded and was read back. There were no partial writes.

## Reproducible ingestion and integrity

`scripts/curate-library-source.mjs plan|finalize ABSOLUTE_EVIDENCE_DIRECTORY` validates native baseline concurrency and creates the narrowly scoped request plan, then derives public source exclusively from successful connector readback. It never writes to Sheets itself. `books-source-manifest.json` records source, spreadsheet, immutable identity, adjudication and backup SHA256s plus derived counts. Source SHA256: `a9326e5e1d3119950f75bdee3a7c7ccd25ffa4fe175fbbbecdbbd205edc25bd0`. Spreadsheet SHA256: `6cf0d4484faabaa3f7240a2027b82000fc265b40f06381d72f091ec7049f1114`.

`import:library` checks the source-file hash, pinned adjudicated manifest, full snapshot hash, immutable identity hash and every label/language/target/order. Count is derived from the exact approved manifest, replacing the old55 hardcode. Import updates the existing authoritative SQLite in one transaction, adds link annotations/provenance, and preserves summaries, covers, schedules and unrelated data. No destructive rebuild or competing application DB.

## Validation and scope

Nine library tests and one database-path test pass. They cover exact85 mappings, baseline preservation, held candidates, strict unapproved HTTPS substitution rejection, rich-span removal, identity drift, idempotence, summaries/covers/legacy records and forced mid-insert rollback. Targeted ESLint and git diff --check pass. Next16 production build succeeded. All18 Chromium desktop/mobile library browser tests pass (18.7s), including both held rows, mixed-language volume order, AI/edition/source notes, fallback, independent popup navigation, history and responsive layouts. Independent Medium QC is recorded separately in `t2-quality-review.md` and is required before advancing to T3. Browser tests stub external navigation only to verify popup destination; T1 supplies actual external-text verification.

Changed implementation files: app/data/library/books-source.json and books-source-manifest.json; app/saradakosh.db; app/scripts/import-library.mjs and curate-library-source.mjs; app/src/lib/library/import.mjs and curation.mjs; app/src/components/library/BookPresentation.jsx and library.css; app/tests/library.test.mjs and tests/e2e/library.spec.js; this report. Here `app` means `saradakosh-web`. Independent QA owns its own report. No commit/push by implementation worker; coordinator owns revision/PR integrity and acceptance.
