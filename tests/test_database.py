"""Regression checks for the retained data and cwd-independent Python tools."""

from pathlib import Path
import sqlite3
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch

from database_path import DB_PATH, REPO_ROOT
from database_path import connect_database


class DatabaseTests(unittest.TestCase):
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
        with sqlite3.connect(DB_PATH.as_uri() + '?mode=ro', uri=True) as db:
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


if __name__ == '__main__':
    unittest.main()
