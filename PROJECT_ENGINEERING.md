# SaradaKosh Engineering Addendum

**Project:** SaradaKosh  
**Repository:** `krishna101-tech/saradakosh`  
**Portfolio Logbook:** `SaradaKosh_Logbook.md` in Google Drive → `Software Architecture`  
**Current Portfolio Platform Version:** not yet assigned

SaradaKosh inherits the central Portfolio Platform engineering standard and AAA runtime in full. This file contains only project-specific engineering constraints.

## Product / architecture boundary

The repository currently combines:
- a Next.js public web application;
- a Flask administrative dashboard;
- Python ETL/data-processing scripts;
- SQLite-backed structured data.

## Project-specific invariants

1. Prefer one authoritative database/data path. Do not introduce duplicate SQLite authorities or cwd-sensitive database selection.
2. Public web, administrative tooling, ETL, and database changes must agree on data contracts and identity.
3. Hard-coded machine-specific absolute paths are not acceptable production architecture.
4. Secrets and credentials must not be committed or exposed to clients.
5. User-facing behavior that materially affects the deployed site requires real-browser verification at representative mobile and desktop widths.
6. Content/media integrity and deterministic data migration outrank implementation convenience.
7. Existing focused product-remediation Issues survive the retirement of the old governance-adoption PRs and must be mapped into the next owner-approved SaradaKosh Version.

## Version boundary

Portfolio Platform migration must not invent a SaradaKosh product Version. Until the owner approves a Version goal, current product work remains represented by its existing GitHub Issues.

## Exceptions

None approved.
