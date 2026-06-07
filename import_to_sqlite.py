import sqlite3
import pandas as pd
import os

db_path = 'c:/Saradakosh antigravity/saradakosh.db'
if os.path.exists(db_path):
    os.remove(db_path)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# 1. Create tables
cursor.executescript('''
    CREATE TABLE events (
        id INTEGER PRIMARY KEY,
        du TEXT,
        ref TEXT,
        type TEXT,
        dt REAL,
        mn REAL,
        yr REAL,
        type_2 TEXT,
        sequence REAL,
        field1 TEXT,
        field2 TEXT,
        child_id REAL,
        seq2 REAL,
        gujarati TEXT,
        gud_du TEXT,
        lev REAL,
        new_guj TEXT
    );

    CREATE TABLE parameters (
        id INTEGER PRIMARY KEY,
        para1 TEXT,
        type TEXT,
        sequence REAL,
        person TEXT,
        remark TEXT,
        remark2 TEXT,
        remark3 TEXT,
        remark4 TEXT
    );

    CREATE TABLE param_hierarchy (
        uid INTEGER PRIMARY KEY,
        parent_id INTEGER,
        child_id INTEGER,
        child2_id INTEGER,
        FOREIGN KEY(parent_id) REFERENCES parameters(id),
        FOREIGN KEY(child_id) REFERENCES parameters(id),
        FOREIGN KEY(child2_id) REFERENCES parameters(id)
    );

    CREATE TABLE event_parameters (
        event_id INTEGER,
        parameter_id INTEGER,
        FOREIGN KEY(event_id) REFERENCES events(id),
        FOREIGN KEY(parameter_id) REFERENCES parameters(id)
    );
''')

# Load data
folder = 'c:/Saradakosh antigravity/tables'
du1 = pd.read_excel(os.path.join(folder, 'DU1.xlsx'))
p1 = pd.read_excel(os.path.join(folder, 'Parameter1.xlsx'))
pm = pd.read_excel(os.path.join(folder, 'ParaM.xlsx'))
matrix = pd.read_excel(os.path.join(folder, 'Matrix.xlsx'))

# 2. Insert Events
du1 = du1.rename(columns={
    'ID': 'id', 'DU': 'du', 'Ref': 'ref', 'Type': 'type',
    'Type 2': 'type_2', 'Sequence': 'sequence', 'Field1': 'field1',
    'Field2': 'field2', 'ChildID': 'child_id', 'Seq2': 'seq2',
    'Gujarati': 'gujarati', 'GudDU': 'gud_du', 'LEV': 'lev', 'NEW GUJ': 'new_guj'
})
# Make sure we don't insert NaN where it causes issues, but for sqlite REAL/TEXT NaN becomes NULL
du1.to_sql('events', conn, if_exists='append', index=False)

# 3. Insert Parameters
p1 = p1.rename(columns={'ParaID': 'id', 'Para1': 'para1', 'Type': 'type', 'Sequence': 'sequence', 'Person': 'person', 'Remark': 'remark', 'Remark2': 'remark2', 'Remark3': 'remark3', 'Remark4': 'remark4'})
p1.to_sql('parameters', conn, if_exists='append', index=False)

# 4. Insert Hierarchy
pm = pm.rename(columns={'UID': 'uid', 'ParentID': 'parent_id', 'ChildID': 'child_id', 'Child2ID': 'child2_id'})
pm.to_sql('param_hierarchy', conn, if_exists='append', index=False)

# 5. Insert Matrix (Normalized)
# The matrix table has ID, RDU, M1, M2, M3, M4, Type
# We want to unpivot M1, M2, M3, M4
ep_records = []
for _, row in matrix.iterrows():
    rdu = row['RDU']
    if pd.isna(rdu): continue
    
    for m_col in ['M1', 'M2', 'M3', 'M4']:
        val = row[m_col]
        if pd.notna(val):
            ep_records.append((int(rdu), int(val)))

ep_df = pd.DataFrame(ep_records, columns=['event_id', 'parameter_id'])
ep_df = ep_df.drop_duplicates()
ep_df.to_sql('event_parameters', conn, if_exists='append', index=False)

conn.commit()
conn.close()

print("Successfully imported data into saradakosh.db")
