# Runbook & Operational Tasks

This guide outlines routine maintenance, data-management, and recovery procedures for the Saradakosh project's local environment.

## 💾 Database Backups

Take a consistent SQLite snapshot before any data replacement or migration. Use SQLite's backup API, which includes committed data even when a write-ahead log is present. A raw copy of the `.db` file alone is not a verified live backup.

From the repository root, choose a new backup filename and run this command in Bash or PowerShell:
```bash
python -c "import sqlite3; from database_path import connect_database; source = connect_database(readonly=True); backup = sqlite3.connect('saradakosh_backup.db'); source.backup(backup); print(backup.execute('PRAGMA integrity_check').fetchall()); backup.close(); source.close()"
```

The source opens read-only and fails if the canonical file is missing. The explicitly named backup is the only newly created database. Verify `integrity_check` returns `ok`, then rehearse restoration into a disposable destination with the same SQLite backup API and compare the complete schema and every table's logical contents. `python -m unittest discover -s tests -p test_database.py -v` performs this round trip against a read-only canonical source, including all Library and scheduling tables. After successful rehearsal, stop database writers before replacing the canonical database from that verified snapshot; workbook import cannot restore editorial data.

## 🌱 Reimporting legacy workbook data

Keep `saradakosh-web/saradakosh.db` in place. It contains Library editorial content and scheduling data that the legacy workbooks cannot reconstruct. The importer opens only an existing file and fails if it is missing. For database corruption or a missing file, restore a verified backup instead of attempting a workbook import.

With Python dependencies `pandas` and `openpyxl` installed, run this command from the repository root:
```bash
python import_to_sqlite.py
```

The command reads `tables/DU1.xlsx`, `Parameter1.xlsx`, `ParaM.xlsx`, and `Matrix.xlsx` before writing. It replaces only `events`, `parameters`, `param_hierarchy`, `event_parameters`, and `event_embeddings` in one SQLite transaction, preserving the existing table schemas and every other table, including all `library_*` records, summaries, cover assets/provenance, and schedule settings. It validates imported counts, database integrity, and foreign keys outside the legacy tables before committing. Any write or validation failure rolls back the complete rebuild and exits unsuccessfully. No second authoritative database is created. Paths resolve relative to the scripts, even from another working directory.

This is a **replacement of legacy data from raw workbook inputs**, not a restoration of accepted database corrections. The checked-in Matrix currently yields 9,080 distinct mappings rather than the retained database's 34,100; workbook text/labels can also predate editorial corrections described in [the reconciliation record](docs/database-reconciliation.md). Review the inputs and use a disposable copy for rehearsals. Known orphan relationships in these historical legacy inputs are retained and reported explicitly; the command does not claim to repair them. Foreign-key defects outside those five legacy tables abort the import.

Old event embeddings are cleared within the same transaction because event descriptions may change. The importer does not launch a post-commit subprocess or download a model. Global event search uses keyword matching; the unused embedding runtime and generation scripts have been removed because the canonical database has no vector index. Activating vector search requires a separately approved index and maintenance design. Library imports remain separate: run `npm run import:library` from `saradakosh-web` only when updating the approved Library source.

Run `python -m unittest discover -s tests` for regressions. The importer tests execute the actual CLI inside temporary repository copies backed up from a read-only source connection. They preserve 168 books/55 links plus seeded editorial summary/real-cover records across two imports, and prove full rollback after both mid-import and post-insert validation failures. They never reimport into the canonical database.

## 🧹 Cache Invalidation & Rebuilding

If the Next.js web application is not reflecting the latest database changes, or if you've updated core stylesheets:
1. Use the provided utility script in the root directory:
   ```bash
   python bust_cache.py
   ```
2. Or perform a clean rebuild of the Next.js app:
   ```bash
   cd saradakosh-web
   rm -rf .next
   npm run build
   npm run start
   ```
