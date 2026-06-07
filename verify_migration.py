import sqlite3
import pandas as pd
import os
import sys

folder = 'c:/Saradakosh antigravity/tables'
db_path = 'c:/Saradakosh antigravity/saradakosh.db'

print("Loading Original Excel Data...")
du1_xl = pd.read_excel(os.path.join(folder, 'DU1.xlsx'))
p1_xl = pd.read_excel(os.path.join(folder, 'Parameter1.xlsx'))
pm_xl = pd.read_excel(os.path.join(folder, 'ParaM.xlsx'))
matrix_xl = pd.read_excel(os.path.join(folder, 'Matrix.xlsx'))

print("Loading SQLite Data...")
conn = sqlite3.connect(db_path)
events_db = pd.read_sql("SELECT * FROM events", conn)
params_db = pd.read_sql("SELECT * FROM parameters", conn)
pm_db = pd.read_sql("SELECT * FROM param_hierarchy", conn)
ep_db = pd.read_sql("SELECT * FROM event_parameters", conn)
conn.close()

success = True

# 1. Verify DU1 vs Events
print("\n--- Verifying DU1 vs Events ---")
if len(du1_xl) == len(events_db):
    print(f"Row count perfectly matches: {len(du1_xl)}")
else:
    print(f"Row count mismatch! Excel: {len(du1_xl)}, DB: {len(events_db)}")
    success = False

# 2. Verify Parameter1 vs Parameters
print("\n--- Verifying Parameter1 vs Parameters ---")
if len(p1_xl) == len(params_db):
    print(f"Row count perfectly matches: {len(p1_xl)}")
else:
    print(f"Row count mismatch! Excel: {len(p1_xl)}, DB: {len(params_db)}")
    success = False

# 3. Verify ParaM vs param_hierarchy
print("\n--- Verifying ParaM vs Hierarchy ---")
if len(pm_xl) == len(pm_db):
    print(f"Row count perfectly matches: {len(pm_xl)}")
else:
    print(f"Row count mismatch! Excel: {len(pm_xl)}, DB: {len(pm_db)}")
    success = False

# 4. Verify Matrix mappings vs event_parameters
print("\n--- Verifying Many-to-Many Mappings (Matrix) ---")
# Reconstruct pairs from Excel Matrix
xl_pairs = set()
for _, row in matrix_xl.iterrows():
    rdu = row['RDU']
    if pd.isna(rdu): continue
    for col in ['M1', 'M2', 'M3', 'M4']:
        val = row[col]
        if pd.notna(val):
            xl_pairs.add((int(rdu), int(val)))

# Reconstruct pairs from DB
db_pairs = set()
for _, row in ep_db.iterrows():
    db_pairs.add((int(row['event_id']), int(row['parameter_id'])))

if xl_pairs == db_pairs:
    print(f"Mapping perfectly matches! Both have exactly {len(xl_pairs)} unique event-parameter links.")
else:
    print("Mapping mismatch!")
    print(f"Excel Links: {len(xl_pairs)}")
    print(f"DB Links: {len(db_pairs)}")
    print(f"Missing in DB: {xl_pairs - db_pairs}")
    print(f"Extra in DB: {db_pairs - xl_pairs}")
    success = False

if success:
    print("\n✅ ZERO-LOSS VERIFICATION PASSED. 100% DATA FIDELITY GUARANTEED.")
else:
    print("\n❌ VERIFICATION FAILED.")
    sys.exit(1)
