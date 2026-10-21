"""The SQLite database shared by the web app and repository tools."""

from pathlib import Path
import sqlite3

REPO_ROOT = Path(__file__).resolve().parent
DB_PATH = REPO_ROOT / "saradakosh-web" / "saradakosh.db"


def connect_database(*, readonly=False):
    """Open the existing canonical database without creating a missing file."""
    mode = 'ro' if readonly else 'rw'
    return sqlite3.connect(f'{DB_PATH.as_uri()}?mode={mode}', uri=True)
