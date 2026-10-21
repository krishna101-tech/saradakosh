"""Regression checks for the retained data and cwd-independent Python tools."""

from pathlib import Path
from contextlib import closing
import hashlib
import json
import shutil
import sqlite3
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch

from database_path import DB_PATH, REPO_ROOT
from database_path import connect_database


class DatabaseTests(unittest.TestCase):
    def test_sqlite_backup_and_restore_preserve_all_schema_and_table_contents(self):
        def logical_hash(db):
            schema = db.execute(
                'SELECT type, name, tbl_name, sql FROM sqlite_master ORDER BY type, name'
            ).fetchall()
            tables = {}
            for kind, name, _, _ in schema:
                if kind == 'table':
                    quoted = '"' + name.replace('"', '""') + '"'
                    rows = db.execute(f'SELECT * FROM {quoted}').fetchall()
                    tables[name] = sorted(rows, key=repr)
            encoded = json.dumps((schema, tables), ensure_ascii=False,
                                 default=lambda value: {'blob_hex': value.hex()}).encode('utf-8')
            return hashlib.sha256(encoded).hexdigest()

        source_hash = hashlib.sha256(DB_PATH.read_bytes()).hexdigest()
        with tempfile.TemporaryDirectory(prefix='saradakosh-restore-') as folder:
            root = Path(folder)
            backup_path = root / 'verified backup # বাংলা.db'
            restored_path = root / 'restored worktree.db'
            with closing(connect_database(readonly=True)) as source:
                expected = logical_hash(source)
                with closing(sqlite3.connect(backup_path)) as backup:
                    source.backup(backup)
                    self.assertEqual(backup.execute('PRAGMA integrity_check').fetchall(), [('ok',)])
                    self.assertEqual(logical_hash(backup), expected)
            with closing(sqlite3.connect(restored_path)) as restored:
                # Simulate an incomplete local replacement before restoring it.
                restored.execute('CREATE TABLE damaged_placeholder (id INTEGER)')
                restored.commit()
                with closing(sqlite3.connect(backup_path.as_uri() + '?mode=ro', uri=True)) as backup:
                    backup.backup(restored)
                self.assertEqual(restored.execute('PRAGMA integrity_check').fetchall(), [('ok',)])
                self.assertEqual(logical_hash(restored), expected)
                self.assertEqual(restored.execute('SELECT COUNT(*) FROM library_books').fetchone()[0], 168)
                self.assertEqual(restored.execute('SELECT COUNT(*) FROM library_book_links').fetchone()[0], 55)
        self.assertEqual(hashlib.sha256(DB_PATH.read_bytes()).hexdigest(), source_hash)

    def test_missing_database_fails_without_creating_an_empty_file(self):
        with tempfile.TemporaryDirectory() as unrelated:
            missing = Path(unrelated) / 'saradakosh.db'
            with patch('database_path.DB_PATH', missing):
                for readonly in (False, True):
                    with self.subTest(readonly=readonly):
                        with self.assertRaises(sqlite3.OperationalError):
                            connect_database(readonly=readonly)
                        self.assertFalse(missing.exists())

    def test_only_authoritative_database_exists(self):
        self.assertFalse((REPO_ROOT / 'saradakosh.db').exists())
        self.assertTrue(DB_PATH.is_file())

    def test_python_path_from_each_working_directory(self):
        code = (
            'import sys; sys.path.insert(0, sys.argv[1]); '
            'from database_path import DB_PATH; '
            'print(DB_PATH)'
        )
        with tempfile.TemporaryDirectory() as unrelated:
            for cwd in (REPO_ROOT, REPO_ROOT / 'saradakosh-web', unrelated):
                with self.subTest(cwd=cwd):
                    result = subprocess.run(
                        [sys.executable, '-c', code, str(REPO_ROOT)],
                        cwd=cwd, check=True, capture_output=True, text=True,
                    )
                    self.assertEqual(Path(result.stdout.strip()), DB_PATH)

    def test_retained_content_and_integrity(self):
        with closing(connect_database(readonly=True)) as db:
            self.assertEqual(db.execute('PRAGMA integrity_check').fetchall(), [('ok',)])
            for table, count in {
                'events': 20635, 'parameters': 1207, 'event_parameters': 34100,
                'param_hierarchy': 1734, 'schedule_settings': 1, 'schedule_topics': 6,
            }.items():
                with self.subTest(table=table):
                    self.assertEqual(db.execute(f'SELECT COUNT(*) FROM {table}').fetchone()[0], count)
            for column in ('du', 'ref', 'new_guj'):
                self.assertEqual(db.execute(
                    f"SELECT COUNT(*) FROM events WHERE instr({column}, '_x000d_') > 0"
                ).fetchone()[0], 0)
            labels = dict(db.execute('SELECT id, para1 FROM parameters WHERE id IN (79, 910, 911)'))
            self.assertEqual(labels, {
                79: 'Athens  (Nov 1900)',
                910: 'Second Mission to the West  (June 1899 - Nov 1900)',
                911: 'Mission Over  (Dec 1900 - July 1902)',
            })

    def test_admin_reads_same_database_from_unrelated_directory(self):
        code = (
            'import sys; sys.path.insert(0, sys.argv[1]); '
            'from admin_dashboard.app import app, DB_PATH; '
            'from database_path import DB_PATH as canonical; '
            'assert DB_PATH == canonical; '
            'response = app.test_client().get("/api/events?limit=1"); '
            'assert response.status_code == 200; '
            'assert response.json["total"] == 20635; '
            'assert len(response.json["data"]) == 1'
        )
        with tempfile.TemporaryDirectory() as unrelated:
            subprocess.run([sys.executable, '-c', code, str(REPO_ROOT)],
                           cwd=unrelated, check=True, capture_output=True, text=True)

    def test_admin_is_readonly_and_missing_database_does_not_create_a_file(self):
        from admin_dashboard.app import app, get_db
        with closing(get_db()) as db:
            with self.assertRaisesRegex(sqlite3.OperationalError, 'readonly'):
                db.execute('CREATE TABLE forbidden_admin_write (id INTEGER)')
        with tempfile.TemporaryDirectory() as unrelated:
            missing = Path(unrelated) / 'missing admin database.db'
            with patch('admin_dashboard.app.DB_PATH', missing), patch.dict(app.config, TESTING=True):
                with self.assertRaises(sqlite3.OperationalError):
                    app.test_client().get('/api/events?limit=1')
            self.assertFalse(missing.exists())

    def test_export_and_child_repair_use_the_disposable_worktree_from_an_unrelated_cwd(self):
        source_hash = hashlib.sha256(DB_PATH.read_bytes()).hexdigest()
        with tempfile.TemporaryDirectory(prefix='saradakosh-portability-') as folder:
            root = Path(folder) / 'worktree # বাংলা'
            app = root / 'saradakosh-web'
            app.mkdir(parents=True)
            target = app / 'saradakosh.db'
            unrelated = Path(folder) / 'unrelated cwd'
            unrelated.mkdir()
            with closing(connect_database(readonly=True)) as source:
                with closing(sqlite3.connect(target)) as destination:
                    source.backup(destination)
            with closing(sqlite3.connect(unrelated / 'saradakosh.db')) as decoy:
                decoy.execute('CREATE TABLE events (id INTEGER)')
                decoy.commit()
            for filename in ('database_path.py', 'export_to_json.py', 'fix_child_ids.py'):
                shutil.copy2(REPO_ROOT / filename, root / filename)
            (root / 'tables').mkdir()
            shutil.copy2(REPO_ROOT / 'tables' / 'DU1.xlsx', root / 'tables' / 'DU1.xlsx')
            for filename in ('export_to_json.py', 'fix_child_ids.py'):
                result = subprocess.run([sys.executable, str(root / filename)], cwd=unrelated,
                                        capture_output=True, text=True, encoding='utf-8', timeout=90)
                self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
            events = json.loads((root / 'webapp' / 'data' / 'events.json').read_text(encoding='utf-8'))
            self.assertEqual(len(events), 20635)
            self.assertFalse((unrelated / 'webapp').exists())
            self.assertFalse((root / 'saradakosh.db').exists())
            with closing(sqlite3.connect(target.as_uri() + '?mode=ro', uri=True)) as db:
                self.assertEqual(db.execute('SELECT COUNT(*) FROM events').fetchone()[0], 20635)
                self.assertEqual(db.execute('SELECT COUNT(*) FROM library_books').fetchone()[0], 168)
                self.assertEqual(db.execute('SELECT COUNT(*) FROM library_book_links').fetchone()[0], 55)
        self.assertEqual(hashlib.sha256(DB_PATH.read_bytes()).hexdigest(), source_hash)


if __name__ == '__main__':
    unittest.main()
