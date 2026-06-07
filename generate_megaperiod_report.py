import pandas as pd
import os

folder = r'C:\Saradakosh antigravity\tables'
reports_folder = r'C:\Saradakosh antigravity\webapp\reports'

param1 = pd.read_excel(os.path.join(folder, 'Parameter1.xlsx'))
paramM = pd.read_excel(os.path.join(folder, 'ParaM.xlsx'))

# Get all MPCat items
mpcat_items = param1[param1['Type'] == 'MPCat'].sort_values('Sequence')

html = [
    '<!DOCTYPE html>',
    '<html><head>',
    '<meta charset="UTF-8">',
    '<link href="../css/style_main.css?v=14" rel="stylesheet">',
    '<script src="../js/theme.js?v=6"></script>',
    '</head><body><div class="container">',
    '<div class="theme-selector" style="position: absolute; top: 10px; right: 10px;">',
    '<button class="theme-btn active" data-set-theme="system">System</button>',
    '<button class="theme-btn" data-set-theme="light">Light</button>',
    '<button class="theme-btn" data-set-theme="dark">Dark</button>',
    '</div>',
    '<div class="level-toggles">',
    '    <span style="font-weight:bold; margin-right: 15px; color: var(--text-color); font-size: 15px;">Levels:</span>',
    '    <div class="toggle-btn" onclick="setLevel(1)">1</div>',
    '    <div class="toggle-btn active" onclick="setLevel(2)">2</div>',
    '</div>',
    '<script>',
    'function setLevel(level) {',
    '    var btns = document.querySelectorAll(".toggle-btn");',
    '    if(btns.length >= 2) {',
    '        btns[0].classList.toggle("active", level === 1);',
    '        btns[1].classList.toggle("active", level === 2);',
    '    }',
    '    document.querySelectorAll(".level2").forEach(function(el) {',
    '        el.style.display = level >= 2 ? "block" : "none";',
    '    });',
    '    document.querySelectorAll(".level1").forEach(function(el) {',
    '        if (level >= 2) el.classList.remove("collapsed");',
    '        else el.classList.add("collapsed");',
    '    });',
    '}',
    '</script>'
]

global_idx = 1

for _, cat_row in mpcat_items.iterrows():
    cat_id = cat_row['ParaID']
    cat_name = cat_row['Para1']
    
    # Get children Mega Period items
    # In ParaM, ChildID is the category, ParentID is the item
    item_ids = paramM[paramM['ChildID'] == cat_id]['ParentID'].tolist()
    
    if len(item_ids) > 0:
        html.append(f'<div class="level1 cat-title">{cat_name}</div>')
        
        items = param1[param1['ParaID'].isin(item_ids)].sort_values('Sequence')
        for _, item_row in items.iterrows():
            item_name = item_row['Para1']
            html.append('<div class="level2 item-container" style="cursor: pointer;">')
            html.append(f'<div class="item-text">{global_idx}&nbsp;&nbsp;&nbsp;{item_name}</div>')
            html.append('</div>')
            global_idx += 1

html.append('</div></body></html>')

output_path = os.path.join(reports_folder, 'Mega_Period.html')
with open(output_path, 'w', encoding='utf-8') as f:
    f.write('\n'.join(html))

print(f'Generated: {output_path}')
