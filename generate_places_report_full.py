import pandas as pd
import os

folder = r'C:\Saradakosh antigravity\tables'
reports_folder = r'C:\Saradakosh antigravity\webapp\reports'

param1 = pd.read_excel(os.path.join(folder, 'Parameter1.xlsx'))
paramM = pd.read_excel(os.path.join(folder, 'ParaM.xlsx'))

# Get all Place2 items (No India filter!)
p2_items = param1[param1['Type'] == 'Place2'].sort_values('Para1')

html = [
    '<!DOCTYPE html>',
    '<html><head>',
    '<meta charset="UTF-8">',
    '<link href="../css/style.css?v=3" rel="stylesheet">',
    '</head><body><div class="container">'
]

# We need to simulate MS Access printing the "Orphan" Place3 items first.
p3_items_all = param1[param1['Type'] == 'Place3']
p4_ids_all = param1[param1['Type'] == 'Place4']['ParaID'].tolist()

global_p3_idx = 1

# 1. Handle Orphan Place3 items (like Ramnad)
valid_orphans = []
for _, p3 in p3_items_all.iterrows():
    parents = paramM[paramM['ParentID'] == p3.ParaID]['ChildID'].tolist()
    is_orphan = True
    for p in parents:
        parent_type = param1[param1['ParaID'] == p]['Type'].iloc[0] if len(param1[param1['ParaID'] == p]) > 0 else None
        if parent_type == 'Place2':
            is_orphan = False
            break
    if is_orphan:
        children = paramM[paramM['ChildID'] == p3.ParaID]['ParentID'].tolist()
        has_p4 = any(c in p4_ids_all for c in children)
        if has_p4:
            valid_orphans.append(p3)

if len(valid_orphans) > 0:
    valid_orphans_df = pd.DataFrame(valid_orphans).sort_values('Para1')
    for _, p3 in valid_orphans_df.iterrows():
        html.append(f'<div class="level2"><span class="num">{global_p3_idx}</span> {p3.Para1}</div>')
        p4_ids = paramM[paramM['ChildID'] == p3.ParaID]['ParentID'].tolist()
        p4_items = param1[param1['ParaID'].isin(p4_ids)].sort_values('Para1')
        p4_idx = 1
        for _, p4 in p4_items.iterrows():
            html.append(f'<div class="level3"><span class="num">{p4_idx}</span> {p4.Para1}</div>')
            p4_idx += 1
        global_p3_idx += 1

# 2. Handle the regular Place2 hierarchy
p2_idx = 1
# Let's adjust p2_idx if MS Access treats the orphan block as group 1.
# Based on the screenshot: Bengal is 2. Assam is 1? Or Null is 1?
# Let's assume the report numbers the Place2 groups starting from 1 for actual groups,
# but skips printing Place2 if it has no children. Wait, if Bengal is 2, maybe Assam is 1.
p2_idx = 1
for _, p2 in p2_items.iterrows():
    p3_ids = paramM[paramM['ChildID'] == p2.ParaID]['ParentID'].tolist()
    p3_items = param1[param1['ParaID'].isin(p3_ids)].sort_values('Para1')
    
    # Check if this Place2 has any valid Place3 with Place4 children
    has_valid_p3 = False
    for _, p3 in p3_items.iterrows():
        p4_ids = paramM[paramM['ChildID'] == p3.ParaID]['ParentID'].tolist()
        if any(c in p4_ids_all for c in p4_ids):
            has_valid_p3 = True
            break
            
    # We print the Place2 name anyway because MS access might just list it (like Bengal is 2)
    # Actually, if we just number it alphabetically, Assam is 1, Bengal is 2.
    if has_valid_p3 or p2.Para1 in ['Assam', 'Bengal']: 
        # Just to ensure Bengal is 2
        pass
        
    # We will just print the Place2 if it has ANY Place3 items
    if len(p3_items) == 0:
        p2_idx += 1
        continue
        
    html.append(f'<div class="level1"><span class="num">{p2_idx}</span> {p2.Para1}</div>')
    
    for _, p3 in p3_items.iterrows():
        p4_ids = paramM[paramM['ChildID'] == p3.ParaID]['ParentID'].tolist()
        p4_items = param1[param1['ParaID'].isin(p4_ids)].sort_values('Para1')
        
        if len(p4_items) == 0:
            continue
            
        html.append(f'<div class="level2"><span class="num">{global_p3_idx}</span> {p3.Para1}</div>')
        
        p4_idx = 1
        for _, p4 in p4_items.iterrows():
            html.append(f'<div class="level3"><span class="num">{p4_idx}</span> {p4.Para1}</div>')
            p4_idx += 1
            
        global_p3_idx += 1
        
    p2_idx += 1

html.append('</div></body></html>')

output_path = os.path.join(reports_folder, 'Places_Report_Full.html')
with open(output_path, 'w', encoding='utf-8') as f:
    f.write('\n'.join(html))

print(f'Generated: {output_path}')
