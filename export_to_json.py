import sqlite3
import pandas as pd
import json
import os

db_path = 'c:/Saradakosh antigravity/saradakosh.db'
out_dir = 'c:/Saradakosh antigravity/webapp/data'

if not os.path.exists(out_dir):
    os.makedirs(out_dir)

conn = sqlite3.connect(db_path)

# 1. Export Events
print("Exporting Events...")
events_df = pd.read_sql("SELECT * FROM events ORDER BY sequence", conn)
events_df = events_df.fillna('')
# Convert to dict
events_list = events_df.to_dict(orient='records')
with open(os.path.join(out_dir, 'events.json'), 'w', encoding='utf-8') as f:
    json.dump(events_list, f, ensure_ascii=False)

# 2. Export Parameters
print("Exporting Parameters...")
params_df = pd.read_sql("SELECT * FROM parameters", conn)
params_df = params_df.fillna('')
params_list = params_df.to_dict(orient='records')
with open(os.path.join(out_dir, 'parameters.json'), 'w', encoding='utf-8') as f:
    json.dump(params_list, f, ensure_ascii=False)

# 3. Export Event Parameters Mappings
print("Exporting Mappings...")
ep_df = pd.read_sql("SELECT * FROM event_parameters", conn)
ep_df = ep_df.fillna('')
ep_list = ep_df.to_dict(orient='records')
with open(os.path.join(out_dir, 'event_parameters.json'), 'w', encoding='utf-8') as f:
    json.dump(ep_list, f, ensure_ascii=False)

# 4. Pre-generate the Ref Report Hierarchy for the frontend
print("Exporting Ref Report Hierarchy...")
# We use the same inner join logic as the Python script, but export as nested JSON
refs = params_df[params_df['type'] == 'Ref'].copy()
refs = refs.rename(columns={'id': 'ParaMatrix_ParaID', 'para1': 'ParaMatrix_Para1'})

pm_df = pd.read_sql("SELECT * FROM param_hierarchy WHERE child_id IS NOT NULL", conn)
joined = pd.merge(refs, pm_df[['parent_id', 'child_id', 'child2_id']], left_on='ParaMatrix_ParaID', right_on='parent_id', how='inner')
joined = pd.merge(joined, params_df[['id', 'para1']], left_on='child_id', right_on='id', how='left')
joined = joined.rename(columns={'id': 'Parameter1_ParaID', 'para1': 'Parameter1_Para1'})
joined = pd.merge(joined, params_df[['id', 'para1']], left_on='child2_id', right_on='id', how='left')
joined = joined.rename(columns={'id': 'Parameter1_1_ParaID', 'para1': 'Parameter1_1_Para1'})

# As requested earlier: Level 1 = Parameter1_Para1, Level 2 = Parameter1_1_Para1
joined['Parameter1_Para1_str'] = joined['Parameter1_Para1'].astype(str)
joined = joined.sort_values(by=['Parameter1_Para1_str', 'Parameter1_1_Para1', 'ParaMatrix_Para1']).reset_index(drop=True)

hierarchy = {}
for _, row in joined.iterrows():
    l1 = str(row['Parameter1_Para1']) if row['Parameter1_Para1'] != '' else "Unknown"
    l2 = str(row['Parameter1_1_Para1']) if row['Parameter1_1_Para1'] != '' else "Unknown"
    item = {
        'id': row['ParaMatrix_ParaID'],
        'name': row['ParaMatrix_Para1'],
        'remark': row['remark'],
        'remark2': row['remark2'],
    }
    
    if l1 not in hierarchy:
        hierarchy[l1] = {}
    if l2 not in hierarchy[l1]:
        hierarchy[l1][l2] = []
        
    hierarchy[l1][l2].append(item)

with open(os.path.join(out_dir, 'ref_report.json'), 'w', encoding='utf-8') as f:
    json.dump(hierarchy, f, ensure_ascii=False)

conn.close()
print("All data exported to JSON successfully!")
