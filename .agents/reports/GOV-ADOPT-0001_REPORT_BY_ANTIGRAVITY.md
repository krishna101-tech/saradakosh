# Report by Anti-Gravity

### Task Metadata

- **Task ID:** GOV-ADOPT-0001
- **Task Title:** Initial engineering standards adoption audit
- **Status:** COMPLETE
- **Standard:** Human–AI Systems Engineering Standard `0.1-bootstrap` (`krishna101-tech/sound-studio/docs/portfolio/HUMAN_AI_SYSTEMS_ENGINEERING_STANDARD.md`)
- **Branch:** `ag/GOV-ADOPT-0001-standards-adoption`
- **Base branch:** `main`
- **Base origin/main SHA:** `4cc40014c7cd683c45f4561c9d31e244d0835432`
- **HEAD commit:** `c96a390`
- **Pull request:** https://github.com/krishna101-tech/saradakosh/pull/15
- **Preflight git status:** Primary workspace (`C:\Saradakosh antigravity`) preserved untouched per coordination rules. Initial isolated worktree (`C:\Saradakosh antigravity\.worktrees\GOV-ADOPT-0001`) status: `clean`.
- **Working directory isolation:** Clean isolated Git worktree at `C:\Saradakosh antigravity\.worktrees\GOV-ADOPT-0001` tracking `origin/main`.
- **Foreign state confirmation:** Zero uncommitted files from the main working directory were modified, stashed, cleaned, or absorbed.

---

## 1. Executive Summary

SaradaKosh has completed its formal engineering standards adoption audit under the portfolio-wide **Human–AI Systems Engineering Standard `0.1-bootstrap`**. 

In accordance with the standard's non-rewrite directive, this adoption audit maps the production architecture and authoritative state, verifies standards conformance across 11 core areas, refines local governance without duplicating central standards, and establishes concrete, prioritized remediation issues for identified technical debt.

---

## 2. Architecture, Data Flow, and Authoritative State Map

### 2.1 Component Architecture

```
                      +-----------------------------+
                      |   Client Web Browser / PWA  |
                      +--------------+--------------+
                                     |
                                     | HTTPS (SSR / Static / Edge)
                                     v
                 +---------------------------------------+
                 |   Next.js 16 App Router (Vercel)      |
                 |   - Server Components                 |
                 |   - Server Actions                    |
                 |   - better-sqlite3 driver             |
                 +--------+---------------------+--------+
                          |                     |
     Readonly SQLite queries                    | Direct CDN Image URLs
                          v                     v
            +---------------------------+   +-------------------------------+
            | saradakosh-web/           |   | Cloudinary Media CDN          |
            | saradakosh.db             |   | (3GB Content Assets)          |
            | [AUTHORITATIVE PROD DB]   |   | [AUTHORITATIVE MEDIA ASSETS]  |
            +---------------------------+   +-------------------------------+
                          ^
                          | (Local Development / Offline ETL only)
            +-------------+-------------+
            | Python ETL Scripts &      |
            | Flask Admin CMS           |
            | [LOCAL / NON-AUTHORITATIVE]|
            +---------------------------+
```

### 2.2 Authoritative State Boundaries

1. **Production Web Application:** The code in `/saradakosh-web` deployed to Vercel represents the sole authoritative web runtime.
2. **Production Content Database:** `saradakosh-web/saradakosh.db` is the runtime database read by `better-sqlite3`. Root `saradakosh.db` represents an out-of-sync local development artifact that must be unified into a single source of truth.
3. **Media CDN:** `https://res.cloudinary.com/dljwhlvid/...` is the sole authoritative host for ~3GB of historical content photographs and quote graphics. The git repository holds only UI design assets and icons.
4. **Offline & Admin Utilities:** Flask Admin (`admin_dashboard/app.py`) and Python scripts (`import_to_sqlite.py`, `export_to_json.py`) are strictly local development utilities.

---

## 3. Standards-Conformance Evaluation

| Audit Dimension | Status | Notes & Evidence |
| :--- | :---: | :--- |
| **1. Single Source of Truth** | **DEVIATION (P1)** | Two copies of `saradakosh.db` exist in the repository (root and `saradakosh-web/`). `src/lib/db.js` uses `path.resolve(process.cwd(), 'saradakosh.db')`, making path resolution dependent on current working directory. |
| **2. Duplicated Implementations** | **DEVIATION (P2)** | Multiple duplicate/overlapping report generators and scripts in repo root (`analyze_full_places.py`, `places.py`, `mega.py`). |
| **3. Dead/Obsolete Paths** | **DEVIATION (P3)** | Stray temporary and scratch files at root (`gemini_code.txt`, `temp.txt`, `p2_items.txt`, `p3_items.txt`, `output.txt`). |
| **4. AI Incomplete Implementations**| **DEVIATION (P2)** | Vector search pipeline in `saradakosh-web/src/lib/embeddings.js` imports `@huggingface/transformers` and runs ONNX models on search queries against an empty/non-existent `event_embeddings` table. |
| **5. Data Contracts & Interfaces** | **CONFORMS** | SQLite schema for `events`, `parameters`, `event_parameters`, and `param_hierarchy` is consistent and functional. Quiz question data schema is fully validated. |
| **6. Security & Trust Boundaries** | **CONFORMS** | No committed credentials or API keys. Production SQLite database accessed with `{ readonly: true }`. Outbound links use `rel="noopener noreferrer"`. |
| **7. Dependency & Versioning** | **CONFORMS** | Dependencies pinned with `package-lock.json`. React 19 overrides documented and operational. |
| **8. Migration Integrity** | **CONFORMS** | Cloudinary 3GB content rule is strictly enforced (`upload_to_cloudinary.py` hard-disabled). No unmanaged schema mutations. |
| **9. Testing Production Reality** | **DEVIATION (P1)** | Playwright config contains default boilerplate `example.spec.ts` testing `https://playwright.dev/`. No unit/integration test runner configured. |
| **10. CI Quality Gates** | **DEVIATION (P1)** | Playwright GitHub Actions workflow is misplaced inside `saradakosh-web/.github/workflows/` rather than repo root `.github/workflows/`, so CI is completely inactive. `package.json` lacks an `npm test` script. |
| **11. Project-Specific Invariants** | **CONFORMS** | Invariants codified in refined `PROJECT_ENGINEERING.md` (no 3GB image uploads, mandatory staging protocol, worktree isolation, deterministic edge verification). |

---

## 4. Prioritized Audit Findings

### [P1] Broken CI Quality Gate: Misplaced Playwright Workflow and Missing Test Script

- **Severity:** P1 (Material quality, correctness, and reliability risk)
- **Location:** `saradakosh-web/.github/workflows/playwright.yml`, `saradakosh-web/package.json`
- **Evidence:** GitHub Actions only searches `.github/workflows/` at the repository root. `gh run list` shows that only GitHub Pages build runs; Playwright E2E tests have never run in CI. Furthermore, `saradakosh-web/package.json` has no `test` script, and `playwright.config.ts` includes `example.spec.ts` which tests `https://playwright.dev/`.
- **PRODUCT IMPACT:** Pull requests and commits currently merge without automated regression testing. Broken UI routes or quiz regressions could silently enter production without automated detection.
- **Action:** Open remediation Issue: "Move CI workflow to repository root, add npm test script, configure working-directory, and remove boilerplate external test".

---

### [P1] Competing Database Truth: Duplicate SQLite Files and CWD-Sensitive DB Resolution

- **Severity:** P1 (Material data-integrity and operational risk)
- **Location:** `saradakosh.db` (root), `saradakosh-web/saradakosh.db`, `saradakosh-web/src/lib/db.js:6`
- **Evidence:** Two distinct SQLite database files exist in git tracking with differing blob hashes (`b6a34da6...` vs `135170c9...`). In `db.js`, `const dbPath = path.resolve(process.cwd(), 'saradakosh.db')` resolves differently depending on whether node/npm is invoked from the repo root or from `saradakosh-web/`.
- **PRODUCT IMPACT:** Edits or updates made to root `saradakosh.db` (via admin dashboard or ETL scripts) are silently ignored on Vercel, causing data drift and customer confusion.
- **Action:** Open remediation Issue: "Establish single authoritative database path and remove duplicate SQLite file".

---

### [P2] Incomplete AI Implementation: Unbacked Vector Search Loading Heavyweight Model in Serverless

- **Severity:** P2 (Meaningful performance and operational cost)
- **Location:** `saradakosh-web/src/lib/embeddings.js`, `saradakosh-web/src/app/actions.js`
- **Evidence:** `fetchSearchResults` imports and runs `@huggingface/transformers` (`Xenova/all-MiniLM-L6-v2`) on every search query. It then invokes `searchEventsVector`, which queries `event_embeddings`. However, the `event_embeddings` table does not exist in production SQLite, returning an empty array and falling back to SQL `LIKE` search.
- **PRODUCT IMPACT:** Serverless search requests suffer unnecessary memory allocation, model download overhead, and latency for a feature that is inactive in production.
- **Action:** Open remediation Issue: "Decouple search action from unpopulated onnx vector pipeline until embeddings table is migrated".

---

### [P2] Environment Portability: Hardcoded Absolute Paths in Admin CMS and ETL Scripts

- **Severity:** P2 (Maintainability and collaboration cost)
- **Location:** `admin_dashboard/app.py`, `export_to_json.py`, `import_to_sqlite.py`, `fix_child_ids.py`
- **Evidence:** `admin_dashboard/app.py` sets `DB_PATH = 'c:/Saradakosh antigravity/saradakosh.db'`. The ETL scripts contain identical hardcoded Windows paths.
- **PRODUCT IMPACT:** Scripts fail immediately when run on any other developer machine, CI server, or worktree.
- **Action:** Open remediation Issue: "Convert admin dashboard and ETL scripts to use relative repository paths or DB_PATH environment variable".

---

### [P3] Repository Hygiene: Stray Temporary and Scratch Files

- **Severity:** P3 (Engineering polish)
- **Location:** `gemini_code.txt`, `temp.txt`, `p2_items.txt`, `p3_items.txt`, `no_children.txt`, `ref_head.txt`, `output.txt`
- **Evidence:** Stray text files from historical ad-hoc tasks remain tracked in the repository root and web directory.
- **PRODUCT IMPACT:** Clutters repository and creates confusion for new agents during initial discovery.
- **Action:** Tracked for cleanup in subsequent hygiene task.

---

## 5. Explicit "No Material Finding" Areas

- **Zero Hardcoded Secrets / Token Leaks:** Comprehensive git grep across all tracked files identified zero leaked Cloudinary API secrets, authentication tokens, or private environment variables.
- **Production Database Read-Only Isolation:** Next.js Server Components query SQLite via `better-sqlite3` strictly in read-only mode (`{ readonly: true }`), preventing web injection attacks from mutating data.
- **Frontend Core Quality:** Clean modern Next.js 16 App Router foundation with React 19, zero legacy jQuery/WordPress dependencies, and accessible responsive styling.
- **Quiz v1 Foundation Integrity:** SQ-AG-001 Quiz module conforms to all specifications with 10 passing Playwright tests, valid RKMM citations, and no external tracking.

---

## 6. Refined Governance Artifacts

1. **`PROJECT_ENGINEERING.md`:** Refined with SaradaKosh-specific invariants (Cloudinary 3GB content rule, mandatory staging protocol, deterministic edge verification, worktree hygiene, single database authority, and `go` owner interface). No duplication of the global standard.
2. **`AGENTS.md`:** Refined to make the 3-tier authority and inheritance hierarchy explicit:
   `Canonical Global Standard (0.1-bootstrap) -> Project Addendum (PROJECT_ENGINEERING.md) -> Live GitHub State`.

---

## 7. Remediation GitHub Issues Created

1. **Issue #11 (P1):** `FIX-CI-0001: Move Playwright CI workflow to repo root and add npm test script`
2. **Issue #12 (P1):** `DATA-ARCH-0001: Unify duplicate saradakosh.db files and fix cwd-sensitive database resolution`
3. **Issue #13 (P2):** `PERF-SEARCH-0001: Decouple serverless search from unpopulated ONNX vector pipeline`
4. **Issue #14 (P2):** `PORT-ETL-0001: Replace hardcoded absolute Windows paths in admin CMS and ETL scripts`

---

## 8. Cross-Project Lessons for Upward Propagation

1. **Subdirectory CI Workflow Blindspot:** When frontend projects are nested in subfolders (`/saradakosh-web`), AI agents frequently generate `.github/workflows/` inside the subfolder instead of the repository root, leading to silently inactive CI quality gates. The central standard should require CI workflows to reside strictly in `<root>/.github/workflows/` with explicit `working-directory` declarations.
2. **Multi-File SQLite Drift in Monorepos:** In hybrid repositories containing both scripts and web frontends, duplicate SQLite databases often emerge when root scripts and web apps each keep a local file. The central standard should specify that SQLite databases must have exactly one authoritative path in source control or be treated as build-time artifacts.
3. **Incomplete Client/Serverless AI Features:** Heavy ONNX or machine-learning models should never be loaded on hot paths (e.g. search requests) unless their supporting tables/indexes are validated as present at application boot.

---

## 9. Conclusion & Review-Ready Handoff

The initial engineering standards adoption audit for SaradaKosh is complete. Governance documents have been updated, project-specific invariants are codified, and material technical deviations are represented by focused remediation Issues.

SaradaKosh is now ready for independent review by ChatGPT:
- **Branch:** `ag/GOV-ADOPT-0001-standards-adoption`
- **Target:** `staging` / `main`
- **Status:** `REVIEW_READY`
