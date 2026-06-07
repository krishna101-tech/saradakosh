import pandas as pd
import os

folder = r'C:\Saradakosh antigravity\tables'
param1 = pd.read_excel(os.path.join(folder, 'Parameter1.xlsx'))
paramM = pd.read_excel(os.path.join(folder, 'ParaM.xlsx'))

mega_periods = param1[param1['Type'] == 'Mega Period']
print(f'Found {len(mega_periods)} Mega Periods:')
print(mega_periods[['ParaID', 'Para1', 'Sequence']].to_string())

print('\n--- Mega Period as ParentID (Item belonging to Category) ---')
mp_as_parent = paramM[paramM['ParentID'].isin(mega_periods['ParaID'])]
# Get categories (ChildID)
for _, row in mp_as_parent.iterrows():
    cat = param1[param1['ParaID'] == row['ChildID']]
    item = param1[param1['ParaID'] == row['ParentID']]
    if not cat.empty and not item.empty:
        print(f"{item['Para1'].iloc[0]} belongs to Category: {cat['Para1'].iloc[0]} ({cat['Type'].iloc[0]})")

print('\n--- Mega Period as ChildID (Category having Items) ---')
mp_as_child = paramM[paramM['ChildID'].isin(mega_periods['ParaID'])]
for _, row in mp_as_child.head(10).iterrows():
    child_item = param1[param1['ParaID'] == row['ParentID']]
    cat = param1[param1['ParaID'] == row['ChildID']]
    if not child_item.empty and not cat.empty:
        print(f"Category {cat['Para1'].iloc[0]} has Item: {child_item['Para1'].iloc[0]} ({child_item['Type'].iloc[0]})")
