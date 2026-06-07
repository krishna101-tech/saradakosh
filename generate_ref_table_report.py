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

joined['Level'] = 4

# Order the columns EXACTLY as in MS Access report
cols = [
    'ParaMatrix_ParaID', 'ParaMatrix_Para1', 'Level', 'Remark', 'Remark2',
    'Remark3', 'Remark4', 'Parameter1_1_Para1', 'Parameter1_Para1',
    'Parameter1_ParaID', 'Parameter1_1_ParaID'
]
df = joined[cols].copy()

# Sort alphabetical on Level 1 (Parameter1_Para1) as requested previously
df['Parameter1_Para1_str'] = df['Parameter1_Para1'].astype(str)
df = df.sort_values(by=['Parameter1_Para1_str', 'Parameter1_1_Para1', 'ParaMatrix_Para1']).reset_index(drop=True)
df = df.drop(columns=['Parameter1_Para1_str'])

# Generate Excel
excel_path = os.path.join(reports_folder, 'Generated_Ref_Report_Table.xlsx')
df.to_excel(excel_path, index=False)
print(f'Generated Excel: {excel_path}')

# Generate HTML Table
html_path = os.path.join(reports_folder, 'Generated_Ref_Report_Table.html')
html = df.to_html(index=False, classes='styled-table', border=0)

full_html = f'''<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<link href="../css/style.css?v=3" rel="stylesheet">
</head>
<body>
<div class="container">
<h1 style="color: var(--primary-color);">Ref Report Table</h1>
{html}
</div>
</body>
</html>
'''

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(full_html)

print(f'Generated HTML Table: {html_path}')
