import pandas as pd
import os

folder = r'C:\Saradakosh antigravity\tables'
reports_folder = r'C:\Saradakosh antigravity\webapp\reports'

param1 = pd.read_excel(os.path.join(folder, 'Parameter1.xlsx'))
paramM = pd.read_excel(os.path.join(folder, 'ParaM.xlsx'))

india = param1[(param1['Para1'] == 'India') & (param1['Type'] == 'Place1')]['ParaID'].iloc[0]

# Get Place2 children of India
p2_ids = paramM[paramM['ChildID'] == india]['ParentID'].tolist()
p2_items = param1[param1['ParaID'].isin(p2_ids)].sort_values('Para1')

html = [
    '<!DOCTYPE html>',
    '<html><head>',
    '<meta charset="UTF-8">',
    '<link href="../css/style.css?v=5" rel="stylesheet">',
    '<script src="../js/theme.js?v=5"></script>',
    '</head><body><div class="container">',
    '<div class="theme-selector" style="position: absolute; top: 10px; right: 10px;">',
    '<button class="theme-btn active" data-set-theme="system">System</button>',
    '<button class="theme-btn" data-set-theme="light">Light</button>',
    '<button class="theme-btn" data-set-theme="dark">Dark</button>',
    '</div>'
]

# Recursively or iteratively build the tree
p2_idx = 1
for _, p2 in p2_items.iterrows():
    html.append(f'<div class="level1"><span class="num">{p2_idx}</span> {p2.Para1}</div>')
    
    # Get Place3 children
    p3_ids = paramM[paramM['ChildID'] == p2.ParaID]['ParentID'].tolist()
    p3_items = param1[param1['ParaID'].isin(p3_ids)].sort_values('Para1')
    
    p3_idx = 1
    for _, p3 in p3_items.iterrows():
        html.append(f'<div class="level2"><span class="num">{p3_idx}</span> {p3.Para1}</div>')
        
        # Get Place4 children
        p4_ids = paramM[paramM['ChildID'] == p3.ParaID]['ParentID'].tolist()
        p4_items = param1[param1['ParaID'].isin(p4_ids)].sort_values('Para1')
        
        p4_idx = 1
        for _, p4 in p4_items.iterrows():
            html.append(f'<div class="level3"><span class="num">{p4_idx}</span> {p4.Para1}</div>')
            p4_idx += 1
            
        p3_idx += 1
        
    p2_idx += 1

html.append('</div></body></html>')

output_path = os.path.join(reports_folder, 'Places_Report.html')
with open(output_path, 'w', encoding='utf-8') as f:
    f.write('\n'.join(html))

print(f'Generated: {output_path}')
