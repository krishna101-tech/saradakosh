# SaradaKosh Engineering Addendum

**Project:** `krishna101-tech/saradakosh`  
**Global standard:** Human–AI Systems Engineering Standard `0.1-bootstrap`  
**Current canonical source:** `krishna101-tech/sound-studio/docs/portfolio/HUMAN_AI_SYSTEMS_ENGINEERING_STANDARD.md`  
**Future canonical source:** `krishna101-tech/software-engineering-standards`

SaradaKosh inherits the global standard in full. The global standard must not be copied into this repository.

## 1. System Architecture & Authoritative State

- **Production Web Application:** Next.js 16 (React 19) App Router located in `/saradakosh-web`, hosted on Vercel (`www.saradakosh.org`).
- **Production Database:** SQLite database accessed in read-only mode via `better-sqlite3`. The authoritative production database file is `saradakosh-web/saradakosh.db`. Duplicate or diverging SQLite database files at the repository root must not be treated as separate production truths.
- **Content Media & Image Assets:** Content images (totaling ~3GB) are hosted on Cloudinary CDN (`res.cloudinary.com/dljwhlvid/image/upload/...`). URLs are resolved directly from database records or static catalogs. Git tracks only UI design images, layout mockups, and icons under `saradakosh-web/public/` or `UI/`.
- **Admin & ETL Utilities:** Legacy Python ETL scripts (`import_to_sqlite.py`, `export_to_json.py`) and local Flask CMS (`admin_dashboard/app.py`) are strictly local development utilities and are non-authoritative for the live web application.

## 2. Project-Specific Invariants (Strict)

1. **Content Image Upload Prohibition:** NEVER commit or reupload the 3GB of content images into Git or Cloudinary. The database and catalog already contain resolved Cloudinary CDN URLs. `upload_to_cloudinary.py` is permanently disabled. UI design images, page icons, and layout mockups are exempt from this restriction.
2. **Mandatory CI/CD Staging Protocol:** Direct pushes to the `main` branch are strictly prohibited. All feature, fix, and task branches must target `staging` first. Before promoting to `staging`, agents must follow `saradakosh-web/DEPLOYMENT_PROTOCOL.md`.
3. **Deterministic Edge Verification:** After pushing to `staging`, verify the live deployment using deterministic HTTP `200 OK` status and raw DOM payload checks (via Node.js script or curl) across both mobile (390px) and desktop viewports. Never assume deployment succeeded without edge verification.
4. **Working-Tree Hygiene & Worktree Isolation:** The root workspace contains uncommitted local data, offline management tools, and scratch scripts. Implementation agents must never run destructive `git reset --hard` or delete untracked files outside their assigned task scope. Agents must perform implementation work in isolated Git worktrees (`.worktrees/<TASK_ID>`).
5. **No AI-Generated Simulated Verification:** AI agents must not replace real database lookups or canonical source verification with simulated or fabricated data. For instance, Quiz v1 citations must resolve directly to canonical Ramakrishna Math and Ramakrishna Mission (RKMM) URLs (`englishbooks.rkmm.org`).

## 3. Deployment & Quality Validation

- **Local Build Requirement:** `npm run build` inside `saradakosh-web` must succeed with zero TypeScript, Next.js, or ESLint errors before opening a PR.
- **Dependency Discipline:** Peer dependency conflicts (such as React 19 vs ecosystem libraries) must be resolved explicitly via `overrides` in `saradakosh-web/package.json`.
- **Case Sensitivity:** Import paths must match file casing in the git tree exactly (`git ls-tree`), preventing runtime 404/Module Not Found errors in Linux/Vercel environments.

## 4. Exceptions

None approved at adoption.

## 5. Owner Interface

The owner's only operational command is `go`. AI agents must inspect live GitHub Issue/PR/review state and repository documentation rather than asking the owner to carry task IDs, branch names, or handoff files.