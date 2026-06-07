import pandas as pd
import os

folder = r'C:\Saradakosh antigravity\tables'
reports_folder = r'C:\Saradakosh antigravity\webapp\reports'

param1 = pd.read_excel(os.path.join(folder, 'Parameter1.xlsx'))

person_items = param1[param1['Type'] == 'Person']['Para1'].tolist()
# Filter out any NaNs and ensure string type, then sort
person_items = sorted([str(x) for x in person_items if pd.notna(x)])

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

html.append('<div class="header">Person</div>')

for p in person_items:
    html.append(f'<div class="item">{p}</div>')

html.append('</div></body></html>')

output_path = os.path.join(reports_folder, 'Person_Report.html')
with open(output_path, 'w', encoding='utf-8') as f:
    f.write('\n'.join(html))

print(f'Generated: {output_path}')
