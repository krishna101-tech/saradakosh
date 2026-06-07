import pandas as pd
import numpy as np

p1 = pd.read_excel('c:/Saradakosh antigravity/tables/Parameter1.xlsx')
pm = pd.read_excel('c:/Saradakosh antigravity/tables/ParaM.xlsx')
access_report = pd.read_excel('c:/Saradakosh antigravity/reports/Ref report from access.xlsx')

refs = p1[p1['Type'] == 'Ref'].copy()
refs = refs.rename(columns={
    'ParaID': 'ParaMatrix_ParaID',
    'Para1': 'ParaMatrix_Para1',
    'Remark': 'Remark',
    'Remark2': 'Remark2',
    'Remark3': 'Remark3',
    'Remark4': 'Remark4'
})

refs['Level'] = 4

# Drop records in ParaM that have NaN ChildID
pm_valid = pm.dropna(subset=['ChildID']).copy()

joined = pd.merge(refs, pm_valid[['ParentID', 'ChildID', 'Child2ID']], left_on='ParaMatrix_ParaID', right_on='ParentID', how='inner')

joined = pd.merge(joined, p1[['ParaID', 'Para1']], left_on='ChildID', right_on='ParaID', how='left')
joined = joined.rename(columns={'ParaID': 'Parameter1_ParaID', 'Para1': 'Parameter1_Para1'})

joined = pd.merge(joined, p1[['ParaID', 'Para1']], left_on='Child2ID', right_on='ParaID', how='left')
joined = joined.rename(columns={'ParaID': 'Parameter1_1_ParaID', 'Para1': 'Parameter1_1_Para1'})

cols = [
    'ParaMatrix_ParaID', 'ParaMatrix_Para1', 'Level', 'Remark', 'Remark2',
    'Remark3', 'Remark4', 'Parameter1_1_Para1', 'Parameter1_Para1',
    'Parameter1_ParaID', 'Parameter1_1_ParaID'
]

my_report = joined[cols].copy()

my_report = my_report.sort_values(['ParaMatrix_ParaID', 'Parameter1_ParaID', 'Parameter1_1_ParaID']).reset_index(drop=True)
access_report = access_report.sort_values(['ParaMatrix_ParaID', 'Parameter1_ParaID', 'Parameter1_1_ParaID']).reset_index(drop=True)

print(f"Generated rows: {len(my_report)}, Access report rows: {len(access_report)}")

access_report_filled = access_report.fillna('')
my_report_filled = my_report.fillna('')

for c in access_report_filled.columns:
    access_report_filled[c] = access_report_filled[c].astype(str).str.strip().str.replace('.0', '')
    my_report_filled[c] = my_report_filled[c].astype(str).str.strip().str.replace('.0', '')

diff = (access_report_filled != my_report_filled)

if diff.any().any():
    print("Differences found:")
    for col in cols:
        if diff[col].any():
            print(f"Column {col} has differences.")
            mask = diff[col]
            print("Access report:")
            print(access_report_filled[mask][col].head())
            print("My report:")
            print(my_report_filled[mask][col].head())
else:
    print("Match is PERFECT!")
