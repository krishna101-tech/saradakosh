import pandas as pd
import os
import re

folder = r'C:\Saradakosh antigravity\tables'
reports_folder = r'C:\Saradakosh antigravity\webapp\reports'

param1 = pd.read_excel(os.path.join(folder, 'Parameter1.xlsx'))
paramM = pd.read_excel(os.path.join(folder, 'ParaM.xlsx'))

period1_items = param1[param1['Type'] == 'Period1']

for _, p1_row in period1_items.iterrows():
    p1_id = p1_row['ParaID']
    p1_name = p1_row['Para1']
    
    period2_items_ids = paramM[paramM['ChildID'] == p1_id]['ParentID'].tolist()
    
    tree = []
    for p2_id in period2_items_ids:
        p2_row_data = param1[param1['ParaID'] == p2_id]
        if p2_row_data.empty: continue
        
        p3_ids = paramM[paramM['ChildID'] == p2_id]['ParentID'].tolist()
        valid_p3s = []
        
        for p3_id in p3_ids:
            p3_row_data = param1[param1['ParaID'] == p3_id]
            if p3_row_data.empty: continue
            
            p4_ids = paramM[paramM['ChildID'] == p3_id]['ParentID'].tolist()
            
            if len(p4_ids) > 0:
                p4_rows = param1[param1['ParaID'].isin(p4_ids)].sort_values('Sequence')
                valid_p3s.append({
                    'row': p3_row_data.iloc[0],
                    'children': p4_rows
                })
                
        if len(valid_p3s) > 0:
            valid_p3s.sort(key=lambda x: x['row']['Sequence'])
            tree.append({
                'row': p2_row_data.iloc[0],
                'children': valid_p3s
            })
            
    tree.sort(key=lambda x: x['row']['Sequence'])
    
    html = [
    '<!DOCTYPE html>',
    '<html><head>',
    '<meta charset="UTF-8">',
    '<link href="../css/style.css?v=3" rel="stylesheet">',
    '<script src="../js/theme.js"></script>',
    '</head><body><div class="container">',
    '<div class="theme-selector" style="position: absolute; top: 10px; right: 10px;">',
    '<button class="theme-btn active" data-set-theme="system">System</button>',
    '<button class="theme-btn" data-set-theme="light">Light</button>',
    '<button class="theme-btn" data-set-theme="dark">Dark</button>',
    '</div>'
]
    
    html.append(f'<h1>{p1_name}</h1>')

    p2_idx = 1
    p3_global_idx = 1
    
    for p2 in tree:
        p2_name = p2['row']['Para1']
        html.append(f'<div class="level1">{p2_idx} {p2_name}</div>')
        p2_idx += 1
        
        for p3 in p2['children']:
            p3_name = p3['row']['Para1']
            html.append(f'<div class="level2">{p3_global_idx} {p3_name}</div>')
            p3_global_idx += 1
            
            p4_idx = 1
            for _, p4_row in p3['children'].iterrows():
                p4_name = p4_row['Para1']
                p4_seq = int(p4_row['Sequence']) if pd.notnull(p4_row['Sequence']) else ''
                html.append('<div class="level3-container"><div class="level3-row">')
                html.append(f'<div class="level3-text">{p4_idx} {p4_name}</div>')
                html.append(f'<div class="level3-seq">{p4_seq}</div>')
                html.append('</div></div>')
                p4_idx += 1

    html.append('</div></body></html>')
    
    # Format filename safely (replace spaces with underscores, etc)
    safe_name = re.sub(r'[^a-zA-Z0-9]', '_', str(p1_name))
    output_path = os.path.join(reports_folder, f'{safe_name}.html')
    
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(html))
        
    print(f'Generated: {output_path}')

# Clean up the old file
old_file = os.path.join(reports_folder, 'sv_life_continuous.html')
if os.path.exists(old_file):
    os.remove(old_file)
    print(f'Removed old file: {old_file}')
