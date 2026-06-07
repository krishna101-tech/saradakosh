import pandas as pd
import os
import math

folder = r'C:\Saradakosh antigravity\tables'
app_folder = r'C:\Saradakosh antigravity\webapp\reports\Vivekananda_App'

if not os.path.exists(app_folder):
    os.makedirs(app_folder)

print("Loading tables...")
param1 = pd.read_excel(os.path.join(folder, 'Parameter1.xlsx'))
paramM = pd.read_excel(os.path.join(folder, 'ParaM.xlsx'))
matrix = pd.read_excel(os.path.join(folder, 'Matrix.xlsx'))
du1 = pd.read_excel(os.path.join(folder, 'DU1.xlsx'))
print("Tables loaded.")

vivekananda_id = param1[(param1['Para1'] == 'Vivekananda') & (param1['Type'] == 'Period1')]['ParaID'].iloc[0]

# --- Build the Tree and index.html ---
html_index = [
    '<!DOCTYPE html>',
    '<html><head>',
    '<meta charset="UTF-8">',
    '<link href="../../css/style_main.css?v=14" rel="stylesheet">',
    '</head><body><div class="container">'
]
html_index.append('<h1 style="color: #b01a1a; text-align: center;">Vivekananda Report</h1>')

p2_ids = paramM[paramM['ChildID'] == vivekananda_id]['ParentID'].tolist()
p2_items = param1[param1['ParaID'].isin(p2_ids)].sort_values('Sequence')

all_p4_items = [] # Store to generate detailed pages later

for _, p2 in p2_items.iterrows():
    p3_ids = paramM[paramM['ChildID'] == p2.ParaID]['ParentID'].tolist()
    p3_items = param1[param1['ParaID'].isin(p3_ids)].sort_values('Sequence')
    
    valid_p3s = []
    for _, p3 in p3_items.iterrows():
        p4_ids = paramM[paramM['ChildID'] == p3.ParaID]['ParentID'].tolist()
        p4_rows = param1[param1['ParaID'].isin(p4_ids)].sort_values('Sequence')
        if len(p4_rows) > 0:
            valid_p3s.append((p3, p4_rows))
            
    if len(valid_p3s) > 0:
        html_index.append(f'<div class="level1">{p2.Sequence} {p2.Para1}</div>')
        for p3, p4_rows in valid_p3s:
            html_index.append(f'<div class="level2">{p3.Sequence} {p3.Para1}</div>')
            
            p4_idx = 1
            for _, p4 in p4_rows.iterrows():
                html_index.append(f'<div class="level3"><span class="num">{p4_idx}</span> <a href="outline_{p4.ParaID}.html">{p4.Para1}</a></div>')
                all_p4_items.append(p4)
                p4_idx += 1

html_index.append('</div></body></html>')

index_path = os.path.join(app_folder, 'index.html')
with open(index_path, 'w', encoding='utf-8') as f:
    f.write('\n'.join(html_index))

print(f"Generated index.html with {len(all_p4_items)} clickable records.")

# --- Helper for Nav Bar ---
def get_nav_bar(para_id, active_tab):
    outline_style = "border: 1px dotted black; border-radius: 5px; font-weight: bold; color: black;" if active_tab == 'outline' else "font-style: italic; color: black;"
    detail_style = "border: 1px dotted black; border-radius: 5px; font-weight: bold; color: black;" if active_tab == 'detail' else "font-style: italic; color: black;"
    
    return f"""
    <div style="text-align: center; margin-bottom: 30px; font-size: 14px; font-weight: bold;">
        <a href="index.html" style="margin-right: 20px; color: red; font-style: italic; text-decoration: none;">Back</a>
        <a href="outline_{para_id}.html" style="padding: 5px 15px; text-decoration: none; {outline_style} margin-right: 20px;">Outline Life</a>
        <a href="detail_{para_id}.html" style="padding: 5px 15px; text-decoration: none; {detail_style} margin-right: 20px;">Detail Life</a>
        <span style="margin-right: 20px; font-style: italic;">Outline Works</span>
        <span style="margin-right: 20px; font-style: italic;">Detail Works</span>
        <span style="margin-right: 20px; font-style: italic;">Current CW</span>
        <span style="margin-right: 20px; font-style: italic;">Detail Print</span>
    </div>
    """

# --- Generate Detail Pages for each Period4 ---
print("Generating outline and detail pages...")

for p4 in all_p4_items:
    pid = p4.ParaID
    title = p4.Para1
    
    # Fetch DU1 records
    rdu_ids = matrix[matrix['M1'] == pid]['RDU'].tolist()
    records = du1[du1['ID'].isin(rdu_ids)].sort_values('Sequence')
    
    # OUTLINE HTML
    html_out = [
        '<!DOCTYPE html>',
        '<html><head>',
        '<meta charset="UTF-8">',
        '<link href="../../css/style_main.css?v=14" rel="stylesheet">',
        '</head><body><div class="container">'
    ]
    html_out.append(get_nav_bar(pid, 'outline'))
    html_out.append(f'<h2 style="color: red; text-align: center; margin-bottom: 20px;">{title}</h2>')
    html_out.append('<table style="width: 100%; border-collapse: collapse;">')
    
    for i, row in enumerate(records.iterrows(), 1):
        r = row[1]
        
        shortMonthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        dateParts = []
        try:
            if 'dt' in r and pd.notna(r['dt']) and str(r['dt']).strip() != "" and float(r['dt']) != 0:
                dateParts.append(str(int(float(r['dt']))))
            if 'mn' in r and pd.notna(r['mn']) and str(r['mn']).strip() != "" and float(r['mn']) != 0:
                m = int(float(r['mn']))
                if 1 <= m <= 12:
                    dateParts.append(shortMonthNames[m - 1])
            if 'yr' in r and pd.notna(r['yr']) and str(r['yr']).strip() != "" and float(r['yr']) != 0:
                dateParts.append(str(int(float(r['yr']))))
        except ValueError:
            pass
            
        yr_str = " ".join(dateParts)
                
        # Handle DU and Ref
        du_text = str(r.DU) if pd.notna(r.DU) else ""
        if pd.notna(r.Ref):
            du_text += f" ({r.Ref})"
            
        type_str = str(r.Type) if pd.notna(r.Type) else ""
        
        html_out.append('<tr>')
        html_out.append(f'<td style="color: #213c7a; font-weight: bold; width: 40px; text-align: right; padding-right: 15px;">{i}</td>')
        html_out.append(f'<td style="color: green; width: 60px; font-weight: bold;">{yr_str}</td>')
        html_out.append(f'<td style="color: red; font-weight: bold; width: 30px;">{type_str}</td>')
        html_out.append(f'<td style="color: #2c3e50; font-weight: bold;">{du_text}</td>')
        html_out.append('</tr>')
        
    html_out.append('</table></div></body></html>')
    with open(os.path.join(app_folder, f'outline_{pid}.html'), 'w', encoding='utf-8') as f:
        f.write('\n'.join(html_out))
        
    # DETAIL HTML
    html_det = [
        '<!DOCTYPE html>',
        '<html><head>',
        '<meta charset="UTF-8">',
        '<link href="../../css/style_main.css?v=14" rel="stylesheet">',
        '</head><body><div class="container">'
    ]
    html_det.append(get_nav_bar(pid, 'detail'))
    html_det.append(f'<h2 style="color: red; text-align: center; margin-bottom: 20px;">{title}</h2>')
    html_det.append('<div style="margin-left: 40px;">')
    
    for _, r in records.iterrows():
        seq_str = ""
        if pd.notna(r.Sequence):
            try:
                seq_str = str(int(r.Sequence))
            except:
                seq_str = str(r.Sequence)
                
        type_str = str(r.Type) if pd.notna(r.Type) else ""
        
        du_text = str(r.DU) if pd.notna(r.DU) else ""
        if pd.notna(r.Ref):
            du_text += f" ({r.Ref})"
            
        html_det.append('<div style="margin-bottom: 25px;">')
        html_det.append('<div style="margin-bottom: 8px;">')
        html_det.append(f'<span style="color: purple; font-weight: bold; margin-right: 15px;">-- {seq_str}</span>')
        html_det.append(f'<span style="color: red; font-weight: bold; margin-right: 15px;">{type_str}</span>')
        html_det.append(f'<span style="color: #333; font-weight: bold;">{du_text}</span>')
        html_det.append('</div>')
        
        # Children
        child_records = du1[du1['ChildID'] == r.ID].sort_values('Sequence') if 'ChildID' in du1.columns else []
        if len(child_records) > 0:
            for _, cr in child_records.iterrows():
                child_du = str(cr.DU) if pd.notna(cr.DU) else ""
                if child_du:
                    # Convert newlines to breaks
                    child_du = child_du.replace('\n', '<br>')
                    html_det.append(f'<div style="color: blue; margin-left: 100px; margin-top: 5px; line-height: 1.5;">{child_du}</div>')
                    
        html_det.append('</div>')
        
    html_det.append('</div></div></body></html>')
    with open(os.path.join(app_folder, f'detail_{pid}.html'), 'w', encoding='utf-8') as f:
        f.write('\n'.join(html_det))

print("Done! Open index.html in the Vivekananda_App folder to start clicking.")
