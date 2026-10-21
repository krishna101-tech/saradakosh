# SQLite ownership and reconciliation

Issue [#12](https://github.com/krishna101-tech/saradakosh/issues/12) selects `saradakosh-web/saradakosh.db` as the sole authoritative database. The former root database was compared before removal; no records were merged or invented, and the web database was not changed.

Comparison of the tracked databases at base revision `fe507cfd9e9a8a8719402866bd3dde60f9b73cff`:

| Table | Root rows | Web rows | Difference |
| --- | ---: | ---: | --- |
| events | 20,635 | 20,635 | 3,287 rows contain previously corrected text |
| parameters | 1,207 | 1,207 | Three corrected labels |
| event_parameters | 34,100 | 34,100 | Identical |
| param_hierarchy | 1,734 | 1,734 | Identical |
| schedule_settings | 1 | 1 | Identical |
| schedule_topics | 6 | 6 | Identical |
| sqlite_sequence | 1 | 1 | Identical |

Schemas and all primary-key sets are identical. Both `PRAGMA integrity_check` results are `ok`. There are no root-only records, relationships, tables, or unaccounted content changes.

Every changed event cell consists solely of removing the Excel `_x000d_` marker: 3,244 `du` cells, 114 `ref` cells, and one `new_guj` cell. Parameter label corrections are ID 79 (`Athence` to `Athens`), ID 910 (November 1890 to November 1900), and ID 911 (December 1890 to December 1900). The June 28 sanitization and timeline corrections are documented in the existing site audit report. Restoring these stale root values would undo accepted corrections.

SHA-256 before removal:

- Former root: `48fd775f0bb0241f213133e4775b054941b1321e79b92f5488b13f7b0a767abc`
- Authoritative web database, retained unchanged: `2611298adf34b438f801b2e029b605ce2dfe20744dea13a3251752ba4fd8d5cf`

The removed database remains recoverable from Git history. Routine backups, ETL, admin reads, and Next.js reads must target the web database. Regression checks run with `python -m unittest discover -s tests` at the repository root and `npm run test:database` in `saradakosh-web`.

## Legacy importer boundary

`python import_to_sqlite.py` now keeps the shared database file and rebuilds only the five workbook-owned legacy tables in one explicit `BEGIN IMMEDIATE` transaction. It uses individual SQLite DDL statements and parameterized inserts, avoiding the implicit commit behavior of `executescript` and pandas' SQLite `to_sql`. Count checks, `PRAGMA integrity_check`, and foreign-key checks for every non-legacy table run before the only commit. Exceptions roll back all changes, including new legacy schema. Library tables, summaries, links, real-cover provenance, and scheduling data remain in place; no persistent staging database is introduced.

The raw workbook source is not equivalent to the retained corrected legacy database documented above. Reimporting intentionally replaces legacy rows from those inputs, including 9,080 deduplicated Matrix relationships rather than the retained 34,100 and potentially older text/labels. Historical legacy orphan relationships are retained losslessly and reported, while a foreign-key defect in any non-legacy table aborts the rebuild. See [the maintenance procedure](../RUNBOOK.md#-reimporting-legacy-workbook-data). Event vectors are invalidated transactionally; search uses keyword matching and has no embedding-generation runtime.

`tests/test_legacy_importer.py` backs up the existing database through a read-only connection into temporary repository layouts and runs the documented CLI there. It checks full preservation of 168 books/55 links, an editorial summary, an approved real-cover fixture and its provenance, future Library tables, and schedules; it also checks repeatability, integrity, Library foreign keys, malformed-input rejection, and byte-for-byte rollback after failures during inserts and final validation. The canonical database is never the import target in these regressions.
