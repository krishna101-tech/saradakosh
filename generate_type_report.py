import pandas as pd
import os

folder = r'C:\Saradakosh antigravity\tables'
reports_folder = r'C:\Saradakosh antigravity\webapp\reports'

param1 = pd.read_excel(os.path.join(folder, 'Parameter1.xlsx'))

type_items = param1[param1['Type'] == 'Type']['Para1'].tolist()
type_items = sorted([str(x) for x in type_items])

html = [
    '<!DOCTYPE html>',
    '<html><head>',
    '<meta charset="UTF-8">',
    '<link href="../css/style.css?v=3" rel="stylesheet">',
    '</head><body><div class="container">'
]

for t in type_items:
    html.append(f'<div class="item">{t}</div>')

html.append('</div></body></html>')

output_path = os.path.join(reports_folder, 'Type_Report.html')
with open(output_path, 'w', encoding='utf-8') as f:
    f.write('\n'.join(html))

print(f'Generated: {output_path}')
