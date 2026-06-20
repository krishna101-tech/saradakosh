# Runbook & Operational Tasks

This guide outlines routine maintenance, data-management, and recovery procedures for the Saradakosh project's local environment.

## 💾 Database Backups

Because the primary database is a local `.db` file, taking regular snapshots is incredibly simple and highly recommended before running large generation scripts or schema migrations.

**To safely back up the database without locking it:**
Open your terminal in the root directory and run:
```bash
sqlite3 saradakosh.db ".backup 'saradakosh_backup_$(date +%Y%m%d).db'"
```
*(For Windows PowerShell, you can simply copy the file: `Copy-Item saradakosh.db -Destination saradakosh_backup.db`)*

## 🌱 Seeding & Resetting Data

If your local database becomes corrupted or you need to test from a clean slate, you can purge the existing data and rebuild it using the project's Python ETL scripts.

**Step 1: Destroy the existing database**
Simply delete or rename the `.db` file:
```bash
# Mac/Linux
rm saradakosh.db
# Windows
del saradakosh.db
```

**Step 2: Re-seed the Database**
Execute the import script located in the root directory. This script will recreate the schema and populate it based on your localized source files (like Excel reports).
```bash
python import_to_sqlite.py
```
*(Note: If you have additional setup scripts like `setup_schedule_db.py`, run them sequentially to fully restore all tables).*

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
