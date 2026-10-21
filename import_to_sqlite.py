"""Atomically replace workbook-owned legacy data in the shared SQLite database.

Library, scheduling and other tables are not rebuilt. See docs/database-reconciliation.md.
"""

from collections import Counter
from pathlib import Path
import sqlite3

import pandas as pd

from database_path import DB_PATH, REPO_ROOT


# Execute each statement separately: sqlite3.executescript() and pandas.to_sql()
# can commit an existing transaction, defeating rollback of a partial rebuild.
SCHEMAS = {
    'events': '''CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY, du TEXT, ref TEXT, type TEXT,
        dt REAL, mn REAL, yr REAL, type_2 TEXT, sequence REAL,
        field1 TEXT, field2 TEXT, child_id REAL, seq2 REAL,
        gujarati TEXT, gud_du TEXT, lev REAL, new_guj TEXT
    )''',
    'parameters': '''CREATE TABLE IF NOT EXISTS parameters (
        id INTEGER PRIMARY KEY, para1 TEXT, type TEXT, sequence REAL,
        person TEXT, remark TEXT, remark2 TEXT, remark3 TEXT, remark4 TEXT
    )''',
    'param_hierarchy': '''CREATE TABLE IF NOT EXISTS param_hierarchy (
        uid INTEGER PRIMARY KEY, parent_id INTEGER, child_id INTEGER, child2_id INTEGER,
        FOREIGN KEY(parent_id) REFERENCES parameters(id),
        FOREIGN KEY(child_id) REFERENCES parameters(id),
        FOREIGN KEY(child2_id) REFERENCES parameters(id)
    )''',
    'event_parameters': '''CREATE TABLE IF NOT EXISTS event_parameters (
        event_id INTEGER, parameter_id INTEGER,
        FOREIGN KEY(event_id) REFERENCES events(id),
        FOREIGN KEY(parameter_id) REFERENCES parameters(id)
    )''',
    'event_embeddings': '''CREATE TABLE IF NOT EXISTS event_embeddings (
        event_id INTEGER PRIMARY KEY, embedding BLOB,
        FOREIGN KEY(event_id) REFERENCES events(id) ON DELETE CASCADE
    )''',
}

WORKBOOKS = {
    'events': ('DU1.xlsx', {
        'ID': 'id', 'DU': 'du', 'Ref': 'ref', 'Type': 'type',
        'dt': 'dt', 'mn': 'mn', 'yr': 'yr', 'Type 2': 'type_2',
        'Sequence': 'sequence', 'Field1': 'field1', 'Field2': 'field2',
        'ChildID': 'child_id', 'Seq2': 'seq2', 'Gujarati': 'gujarati',
        'GudDU': 'gud_du', 'LEV': 'lev', 'NEW GUJ': 'new_guj',
    }),
    'parameters': ('Parameter1.xlsx', {
        'ParaID': 'id', 'Para1': 'para1', 'Type': 'type', 'Sequence': 'sequence',
        'Person': 'person', 'Remark': 'remark', 'Remark2': 'remark2',
        'Remark3': 'remark3', 'Remark4': 'remark4',
    }),
    'param_hierarchy': ('ParaM.xlsx', {
        'UID': 'uid', 'ParentID': 'parent_id', 'ChildID': 'child_id',
        'Child2ID': 'child2_id',
    }),
}


def read_workbooks(folder):
    """Read all inputs before locking/writing the database; retain source nulls."""
    datasets = {}
    for table, (filename, mapping) in WORKBOOKS.items():
        frame = pd.read_excel(folder / filename)
        if set(frame.columns) != set(mapping):
            raise ValueError(f'{filename}: unexpected or missing columns')
        frame = frame[list(mapping)].rename(columns=mapping)
        frame = frame.astype(object).where(pd.notna(frame), None)
        datasets[table] = (list(frame.columns), list(frame.itertuples(index=False, name=None)))

    matrix = pd.read_excel(folder / 'Matrix.xlsx')
    required = ['RDU', 'M1', 'M2', 'M3', 'M4']
    if not set(required).issubset(matrix.columns):
        raise ValueError('Matrix.xlsx: missing relationship columns')
    relationships = []
    for rdu, *parameters in matrix[required].itertuples(index=False, name=None):
        if pd.isna(rdu):
            continue
        for parameter in parameters:
            if pd.notna(parameter):
                event_id, parameter_id = int(rdu), int(parameter)
                if event_id != rdu or parameter_id != parameter:
                    raise ValueError('Matrix.xlsx: relationship IDs must be integers')
                relationships.append((event_id, parameter_id))
    datasets['event_parameters'] = (
        ['event_id', 'parameter_id'], list(dict.fromkeys(relationships)),
    )
    return datasets


def quote_identifier(name):
    return '"' + name.replace('"', '""') + '"'


def rebuild_legacy(db_path=DB_PATH, folder=REPO_ROOT / 'tables'):
    """Replace only legacy data, committing DDL/deletes/inserts/validation together.

    The historical workbooks have orphan legacy relationships. Keep them losslessly
    and report them, while enforcing FK validity for every table outside this import.
    Disabling FK enforcement on this connection also avoids legacy DELETE cascades;
    the explicit checks below run before the only COMMIT.
    """
    datasets = read_workbooks(folder)
    # A workbook rebuild cannot recover the Library/editorial data in a missing
    # database. Fail instead of silently creating an incomplete replacement.
    conn = sqlite3.connect(Path(db_path).resolve().as_uri() + '?mode=rw',
                           uri=True, isolation_level=None)
    try:
        conn.execute('PRAGMA foreign_keys = OFF')
        conn.execute('BEGIN IMMEDIATE')
        for schema in SCHEMAS.values():
            conn.execute(schema)
        # Child rows and old vectors belong to the replaced events. Keeping their
        # embeddings could silently associate old descriptions with new content.
        for table in ('event_embeddings', 'event_parameters', 'param_hierarchy', 'events', 'parameters'):
            conn.execute(f'DELETE FROM {quote_identifier(table)}')
        for table, (columns, rows) in datasets.items():
            column_sql = ', '.join(map(quote_identifier, columns))
            placeholders = ', '.join('?' for _ in columns)
            conn.executemany(
                f'INSERT INTO {quote_identifier(table)} ({column_sql}) VALUES ({placeholders})', rows,
            )
            count = conn.execute(f'SELECT COUNT(*) FROM {quote_identifier(table)}').fetchone()[0]
            if count != len(rows):
                raise ValueError(f'{table}: imported row count does not match source')
        if conn.execute('PRAGMA integrity_check').fetchall() != [('ok',)]:
            raise ValueError('Database integrity check failed')
        violations = conn.execute('PRAGMA foreign_key_check').fetchall()
        protected_violations = [row for row in violations if row[0] not in SCHEMAS]
        if protected_violations:
            raise ValueError(f'Foreign key check failed outside legacy tables: {protected_violations[:5]}')
        legacy_orphans = Counter(row[0] for row in violations)
        conn.execute('COMMIT')
    except BaseException:
        if conn.in_transaction:
            conn.execute('ROLLBACK')
        raise
    finally:
        conn.close()
    return {table: len(rows) for table, (_, rows) in datasets.items()}, dict(legacy_orphans)


def main():
    counts, legacy_orphans = rebuild_legacy()
    print(f'Successfully imported legacy data into {DB_PATH}')
    print('Imported rows:', counts)
    if legacy_orphans:
        print('Legacy source foreign-key violations retained:', legacy_orphans)
    print('Library and other non-legacy tables preserved. Event embeddings cleared; '
          'search uses keyword matching without an embedding model.')


if __name__ == '__main__':
    main()
