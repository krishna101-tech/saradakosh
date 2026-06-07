import pandas as pd
import os

folder = r'C:\Saradakosh antigravity\tables'
reports_folder = r'C:\Saradakosh antigravity\webapp\reports'

p1 = pd.read_excel(os.path.join(folder, 'Parameter1.xlsx'))
pm = pd.read_excel(os.path.join(folder, 'ParaM.xlsx'))

refs = p1[p1['Type'] == 'Ref'].copy()
refs = refs.rename(columns={
    'ParaID': 'ParaMatrix_ParaID',
    'Para1': 'ParaMatrix_Para1',
    'Remark': 'Remark',
    'Remark2': 'Remark2',
    'Remark3': 'Remark3',
    'Remark4': 'Remark4'
})

pm_valid = pm.dropna(subset=['ChildID']).copy()

joined = pd.merge(refs, pm_valid[['ParentID', 'ChildID', 'Child2ID']], left_on='ParaMatrix_ParaID', right_on='ParentID', how='inner')

joined = pd.merge(joined, p1[['ParaID', 'Para1']], left_on='ChildID', right_on='ParaID', how='left')
joined = joined.rename(columns={'ParaID': 'Parameter1_ParaID', 'Para1': 'Parameter1_Para1'})

joined = pd.merge(joined, p1[['ParaID', 'Para1']], left_on='Child2ID', right_on='ParaID', how='left')
joined = joined.rename(columns={'ParaID': 'Parameter1_1_ParaID', 'Para1': 'Parameter1_1_Para1'})

cols = [
    'ParaMatrix_ParaID', 'ParaMatrix_Para1', 'Remark', 'Remark2',
    'Remark3', 'Remark4', 'Parameter1_1_Para1', 'Parameter1_Para1',
    'Parameter1_ParaID', 'Parameter1_1_ParaID'
]
df = joined[cols].copy()

# Sort so they appear sequentially in group
df = df.sort_values(['Parameter1_ParaID', 'Parameter1_1_ParaID', 'ParaMatrix_ParaID']).reset_index(drop=True)

html = [
    '<!DOCTYPE html>',
    '<html><head>',
    '<meta charset="UTF-8">',
    '<link href="../css/style.css?v=3" rel="stylesheet">',
    '</head><body><div class="container">'
]

html.append('<h1 style="text-align: center; color: #333;">Ref Report from Access</h1>')

grouped1 = df.groupby('Parameter1_Para1', sort=False)

l1_idx = 1
for name1, group1 in grouped1:
    name1_str = str(name1) if pd.notna(name1) else "Unknown"
    html.append(f'<div class="level1">{l1_idx} {name1_str}</div>')
    l1_idx += 1
    
    grouped2 = group1.groupby('Parameter1_1_Para1', sort=False)
    l2_idx = 1
    for name2, group2 in grouped2:
        name2_str = str(name2) if pd.notna(name2) else "Unknown"
        html.append(f'<div class="level2">{l2_idx} {name2_str}</div>')
        l2_idx += 1
        
        l3_idx = 1
        for _, row in group2.iterrows():
            para1 = str(row['ParaMatrix_Para1']) if pd.notna(row['ParaMatrix_Para1']) else ""
            
            # Combine remarks if present
            remarks = []
            for r in ['Remark', 'Remark2', 'Remark3', 'Remark4']:
                val = row[r]
                if pd.notna(val):
                    remarks.append(str(val))
            
            remark_str = " | ".join(remarks)
            if remark_str:
                remark_str = f"[{remark_str}]"
                
            html.append('<div class="level3-container"><div class="level3-row">')
            html.append(f'<div class="level3-text">{l3_idx} {para1}</div>')
            html.append(f'<div class="level3-remark">{remark_str}</div>')
            html.append('</div></div>')
            l3_idx += 1

html.append('</div></body></html>')

output_path = os.path.join(reports_folder, 'Generated_Ref_Report.html')
with open(output_path, 'w', encoding='utf-8') as f:
    f.write('\n'.join(html))

print(f'Generated: {output_path}')
