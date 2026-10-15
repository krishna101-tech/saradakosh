# Library data and runtime contract

The Library at `/reports/refs` reads only the single authoritative `saradakosh-web/saradakosh.db`. The feature uses one database adapter and one language resolver for Cards, List, and the book dialog. Google Sheets and the checked-in source snapshot are import inputs, never public-request dependencies.

## Source and import

The approved lossless snapshot is `saradakosh-web/data/library/books-source.json`, captured from the **Books** tab (`47022594`) of [Ramakrishna Books](https://docs.google.com/spreadsheets/d/19PlVXPdfx6qAJmPVhlnAHU7sRfoQkBbl1p4Gt4iY010/edit). It includes rows 1–169, rich-text runs, and single-cell hyperlinks. SHA-256: `303d51b192e2f20d09afcc48133be6a9ed87dcb0fdf5058732a6db1921d5481b`.

From `saradakosh-web`, run `npm run import:library`. The importer validates the whole snapshot before any database writes, then applies schema and records in one transaction. It imports **168 books and 55 link mappings**: 48 rich-text targets plus seven single-cell targets, without counting the same cell's hyperlink and text-format URL twice. Labels, Unicode text, source order, and explicit languages are preserved. Book IDs correspond to the frozen snapshot's ordered canonical identities. A repeat import that changes those identities requires an explicit migration; it cannot silently reuse an ID for another book.

The import updates source-owned book fields and synchronizes source links. It preserves separately approved summaries and cover records. It never rebuilds or changes legacy event, parameter, hierarchy, or scheduling tables. Library link/cover foreign keys are checked separately; preexisting legacy relationship defects are not claimed fixed by this feature.

The separate legacy command `python import_to_sqlite.py` also preserves every Library table, summary, link and cover record. Its transaction replaces only workbook-owned legacy data and invalidates event vectors; embedding generation is a separate operation. Follow [the runbook](../RUNBOOK.md#-reimporting-legacy-workbook-data), keeping the shared database in place. `python -m unittest discover -s tests -p test_legacy_importer.py` exercises the actual command in disposable repository copies, including editorial/real-cover preservation and full failure rollback.

Source original languages are 105 Bengali, 59 English, one French, one Hindi, and two explicitly `not clear`. English titles are absent for 86 books; Bengali titles are absent for 54. No summaries, translations, edition metadata, replacement links, or covers have been invented. The existing Google Play target in source row 22 is retained after coordinator verification that its full ebook is offered free.

## Representation and navigation

Original, English, and Bengali are representation preferences for the same 168 canonical identities. A missing requested translation falls back to the original title and language and displays the appropriate availability note. `not clear` remains stored unchanged and visible in the UI, with English as the temporary resolved display language. Links and covers follow only that resolved language.

Search includes every title field, author, and person. Categories group the three principal figures, the other named disciples, and General. Query parameters `view`, `lang`, `person`, `q`, and `page` preserve browsing context. View/language changes retain the page; search/category changes reset to page one. Native history updates support browser Back/Forward without replacing the catalogue.

Book opening controls and full-text anchors are separate siblings. The shared native dialog adds only the summary to the card information, provides explicit Tab/Shift+Tab wrapping, supports Escape, and restores the invoking control's focus. Missing summaries show a clear empty state.

## Future cover population

`library_book_covers` separates production `asset_url` from provenance `source_url`/`source_name`. The current production asset contract accepts HTTPS image uploads from the existing approved Cloudinary cloud: `https://res.cloudinary.com/dljwhlvid/image/upload/…`. Other hosts/clouds, non-HTTPS URLs, and embedded credentials do not become display assets. A primary approved asset for the resolved language wins, followed by another approved asset in source order. Missing or failed images render the deterministic title/author design. These designs are CSS-rendered; no catalogue cover binaries are committed.

Real-cover discovery/acquisition is outside Version 01 T3 and requires the separately authorized cover task. No real covers were acquired for this implementation.

## Validation

`npm run test:library` checks the lossless source, all mappings, identity/language rules, filtering, cover policy, repeat import preservation, malformed input rejection, and forced transactional rollback. `npm run test:database` retains the preexisting database path/content regression checks. `npm test` builds and runs the complete app browser suite, including six view/language combinations, pagination/history, search/categories, link-versus-dialog separation, fallback language alignment, keyboard focus, responsive grid/list anatomy, and 390/768/1440px overflow/font checks.

This feature follows the canonical [Platform UI/UX Design System](https://github.com/krishna101-tech/software-engineering-standards/blob/main/docs/PLATFORM_UI_UX_DESIGN_SYSTEM.md), reuses the current site theme variables and Lucide icons, and adds no UI dependencies. T4 integration repairs the 21 preexisting lint errors and five missing tree selection attributes without suppressing rules. Full-repository lint passes with 15 existing native-image optimization warnings; these images retain their current rendering and Cloudinary transformations where used. The regression suite also checks saved theme/carousel language hydration, feedback reference history without submitting a message, the current quote sharing URL through a mocked sharing boundary, weekend schedule rotation, and timeline keyboard expansion.

Local integration gates are `npm run lint`, `npm run test:library`, `npm run test:database`, and `npm test` from `saradakosh-web`, plus `python -m unittest discover -s tests -p test_database.py` from the repository root. The browser command owns a fresh production build/server by default. The root PR workflow runs lint and both native Node suites before that same browser command, and remains gated by exact candidate SHA authorization. Native Python checks are recorded locally. No runtime Sheets request, paid image optimization, real-cover acquisition, or deployment is needed for these checks.
