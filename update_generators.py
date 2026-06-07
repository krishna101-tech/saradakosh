import os
import re

folder = r"c:\Saradakosh antigravity"
files = [
    'generate_all_reports.py', 'generate_report.py', 'generate_megaperiod_report.py', 
    'generate_person_report.py', 'generate_places_report.py', 'generate_places_report_full.py', 
    'generate_ref_report.py', 'generate_type_report.py', 'generate_ref_table_report.py'
]

replacement = r'''html = [
    '<!DOCTYPE html>',
    '<html><head>',
    '<meta charset="UTF-8">',
    '<link href="../css/style.css" rel="stylesheet">',
    '</head><body><div class="container">'
]'''

for f in files:
    path = os.path.join(folder, f)
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # Replace the HTML block
        new_content = re.sub(
            r"(html(_[a-z]+)?\s*=\s*\['<html><head><style>'\].*?html(_[a-z]+)?\.append\('</style></head><body>'\))",
            replacement, content, flags=re.DOTALL
        )
        
        # We need to use dynamic variable names if they used html_out instead of html
        new_content = re.sub(
            r"html\.append\('</body></html>'\)",
            r"html.append('</div></body></html>')", new_content
        )
        
        if new_content != content:
            with open(path, 'w', encoding='utf-8') as file:
                file.write(new_content)
            print(f"Updated {f}")
        else:
            print(f"No match for {f}")
