"""Exercise the documented legacy importer CLI only inside disposable repo copies."""

from contextlib import contextmanager
import hashlib
import json
from pathlib import Path
import shutil
import sqlite3
import subprocess
import sys
import tempfile
import unittest

from database_path import DB_PATH, REPO_ROOT


LEGACY_TABLES = {'events', 'parameters', 'param_hierarchy', 'event_parameters', 'event_embeddings'}
APPROVED_LINK_COUNT = json.loads(
    (REPO_ROOT / 'saradakosh-web/data/library/books-source-manifest.json').read_text(encoding='utf-8')
)['approved_links']
SUMMARY = 'Approved editorial summary — preserved exactly বাংলা.'
COVER = (
    1, 'Bengali',
    'https://res.cloudinary.com/dljwhlvid/image/upload/library/approved-real-cover.jpg',
    'https://example.org/edition/approved-cover', 'Approved publisher scan', 0, 1, 0,
)


@contextmanager
def connection(*args, **kwargs):
    db = sqlite3.connect(*args, **kwargs)
    try:
        with db:
            yield db
    finally:
        db.close()


def file_hash(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def table_state(db, *, protected_only=False):
    """Include schema, indexes/triggers and rows, including future Library tables."""
    schema = db.execute(
        "SELECT type, name, tbl_name, sql FROM sqlite_master ORDER BY type, name"
    ).fetchall()
    if protected_only:
        schema = [row for row in schema if row[2] not in LEGACY_TABLES]
    tables = [row[1] for row in schema if row[0] == 'table']
    return schema, {
        table: db.execute('SELECT * FROM "' + table.replace('"', '""') + '" ORDER BY rowid').fetchall()
        for table in tables
    }


class LegacyImporterTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix='saradakosh-import-regression-')
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.app = self.root / 'saradakosh-web'
        self.app.mkdir()
        self.db_path = self.app / 'saradakosh.db'
        # SQLite backup reads the tracked authority without ever running an import
        # against it. All CLI code and all workbook inputs live in this sandbox.
        with connection(DB_PATH.as_uri() + '?mode=ro', uri=True) as source:
            with connection(self.db_path) as destination:
                source.backup(destination)
        for filename in ('import_to_sqlite.py', 'database_path.py'):
            shutil.copy2(REPO_ROOT / filename, self.root / filename)
        shutil.copytree(REPO_ROOT / 'tables', self.root / 'tables')
        with connection(self.db_path) as db:
            db.execute('UPDATE library_books SET summary = ? WHERE id = 1', (SUMMARY,))
            db.execute('DELETE FROM library_book_covers')
            db.execute('''INSERT INTO library_book_covers
                (book_id, language, asset_url, source_url, source_name, is_generated, is_primary, sort_order)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)''', COVER)
            # Prove that the importer preserves unknown future Library schema too.
            db.execute('''CREATE TABLE library_editorial_notes (
                id INTEGER PRIMARY KEY, book_id INTEGER REFERENCES library_books(id), content BLOB)''')
            db.execute("INSERT INTO library_editorial_notes VALUES (1, 1, X'0001FF')")
            self.event_id = db.execute('SELECT MIN(id) FROM events').fetchone()[0]
            db.execute("UPDATE events SET du = 'pre-import fixture description' WHERE id = ?",
                       (self.event_id,))
            db.execute('''CREATE TABLE IF NOT EXISTS event_embeddings (
                event_id INTEGER PRIMARY KEY, embedding BLOB,
                FOREIGN KEY(event_id) REFERENCES events(id) ON DELETE CASCADE)''')
            db.execute("INSERT OR REPLACE INTO event_embeddings VALUES (?, X'ABCD')", (self.event_id,))
            self.assertEqual(db.execute('SELECT COUNT(*) FROM library_books').fetchone()[0], 168)
            self.assertEqual(db.execute('SELECT COUNT(*) FROM library_book_links').fetchone()[0], APPROVED_LINK_COUNT)
            self.protected_before = table_state(db, protected_only=True)

    def run_cli(self):
        # Absolute script path from an unrelated cwd exercises the real __main__
        # path and file-anchored database resolution, without test-only CLI flags.
        return subprocess.run(
            [sys.executable, str(self.root / 'import_to_sqlite.py')],
            cwd=self.app, capture_output=True, text=True, encoding='utf-8',
            timeout=90,
        )

    def assert_library_preserved(self, db):
        self.assertEqual(table_state(db, protected_only=True), self.protected_before)
        self.assertEqual(db.execute('SELECT COUNT(*) FROM library_books').fetchone()[0], 168)
        self.assertEqual(db.execute('SELECT COUNT(*) FROM library_book_links').fetchone()[0], APPROVED_LINK_COUNT)
        self.assertEqual(db.execute('SELECT summary FROM library_books WHERE id=1').fetchone(), (SUMMARY,))
        self.assertEqual(db.execute('''SELECT book_id, language, asset_url, source_url,
            source_name, is_generated, is_primary, sort_order FROM library_book_covers''').fetchall(), [COVER])
        self.assertEqual(db.execute('PRAGMA integrity_check').fetchall(), [('ok',)])
        for table in ('library_books', 'library_book_links', 'library_book_covers', 'library_editorial_notes'):
            self.assertEqual(db.execute(f'PRAGMA foreign_key_check({table})').fetchall(), [])

    def test_documented_cli_preserves_library_and_rebuilds_legacy_repeatably(self):
        before_hash = file_hash(DB_PATH)
        for _ in range(2):
            result = self.run_cli()
            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
            self.assertIn('Legacy source foreign-key violations retained:', result.stdout)
            self.assertNotIn('Running embedding sync', result.stdout)
            with connection(self.db_path) as db:
                self.assert_library_preserved(db)
                for table, count in {
                    'events': 20635, 'parameters': 1207, 'param_hierarchy': 1734,
                    'event_parameters': 9080, 'event_embeddings': 0,
                }.items():
                    self.assertEqual(db.execute(f'SELECT COUNT(*) FROM {table}').fetchone()[0], count)
                self.assertNotEqual(db.execute('SELECT du FROM events WHERE id = ?', (self.event_id,)).fetchone()[0],
                                    'pre-import fixture description')
                state = table_state(db)
            if _ == 0:
                first_state = state
            else:
                self.assertEqual(state, first_state)
        self.assertEqual(file_hash(DB_PATH), before_hash, 'The authoritative database must stay untouched')
        self.assertFalse((self.root / 'saradakosh.db').exists())
        self.assertEqual(list(self.root.rglob('*.db')), [self.db_path])

    def test_cli_mid_rebuild_failure_rolls_back_every_previous_table_and_schema(self):
        with connection(self.db_path) as db:
            db.execute('''CREATE TRIGGER regression_abort_parameters BEFORE INSERT ON parameters
                BEGIN SELECT RAISE(ABORT, 'simulated mid-rebuild failure'); END''')
            before = table_state(db)
        before_hash = file_hash(self.db_path)
        result = self.run_cli()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('simulated mid-rebuild failure', result.stderr)
        self.assertNotIn('Successfully imported', result.stdout)
        self.assertEqual(file_hash(self.db_path), before_hash)
        with connection(self.db_path) as db:
            self.assertEqual(table_state(db), before)
            self.assert_library_preserved(db)

    def test_cli_validation_failure_after_inserts_rolls_back(self):
        with connection(self.db_path) as db:
            # This fires after legacy DELETEs/inserts. The protected FK validation
            # must catch it and roll back both legacy and editorial mutations.
            db.execute('DROP TABLE event_embeddings')
            db.execute('''CREATE TRIGGER regression_corrupt_link AFTER INSERT ON parameters
                WHEN NEW.id = 1 BEGIN
                UPDATE library_book_links SET book_id = -1 WHERE id = 1; END''')
            before = table_state(db)
        before_hash = file_hash(self.db_path)
        result = self.run_cli()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('Foreign key check failed outside legacy tables', result.stderr)
        self.assertEqual(file_hash(self.db_path), before_hash)
        with connection(self.db_path) as db:
            self.assertEqual(table_state(db), before)
            self.assert_library_preserved(db)

    def test_cli_malformed_workbook_never_touches_database(self):
        (self.root / 'tables' / 'ParaM.xlsx').write_bytes(b'invalid workbook fixture')
        before_hash = file_hash(self.db_path)
        result = self.run_cli()
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(file_hash(self.db_path), before_hash)


if __name__ == '__main__':
    unittest.main()
