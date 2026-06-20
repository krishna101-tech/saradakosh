# Contributing to Saradakosh

Thank you for contributing to the Saradakosh project! To ensure code quality and prevent regressions, please follow the guidelines established below.

## 🌱 Development Workflow

1. **Branching Strategy:** 
   - Never commit directly to the `main` or `master` branch.
   - Use descriptive prefixes: `feature/your-feature`, `bugfix/issue-description`, or `docs/update-readme`.
2. **Commit Messages:** 
   - Keep commits granular and logical.
   - Use imperative mood: "Fix caching issue on reports" instead of "Fixed caching".
3. **Pull Requests:** 
   - Submit a PR with a clear summary of what was changed.
   - Link any related issue trackers in the PR description.

## 🗄️ Database Migrations & Schema Changes

Because this project uses raw SQLite without a heavy ORM/Migration framework (like Alembic or Prisma), schema changes must be handled with care:

1. **Backup First:** Before altering any tables, take a snapshot of your local `.db` file (see `RUNBOOK.md`).
2. **Raw SQL:** Write raw `ALTER TABLE` or `CREATE TABLE` scripts. Store these scripts in a `/migrations` or `/sql` folder so other developers can run them to catch up.
3. **Notify the Team:** Ensure that backend Python scripts (`app.py`, `import_to_sqlite.py`) and Next.js data fetching logics are simultaneously updated to accommodate schema modifications.

## 🧹 Code Quality & Formatting

Before pushing your changes, ensure your code passes local quality checks:

**For the Next.js Web App:**
Run the Next.js ESLinter to catch syntax and styling violations.
```bash
cd saradakosh-web
npm run lint
```

**For Python Scripts & Admin Dashboard:**
Ensure standard PEP-8 compliance. If you have `flake8` or `black` installed:
```bash
black .
flake8 .
```
