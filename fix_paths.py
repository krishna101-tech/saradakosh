import os
import re

folder = r"c:\Saradakosh antigravity"
files = [
    'generate_all_reports.py', 'generate_report.py', 'generate_megaperiod_report.py', 
    'generate_person_report.py', 'generate_places_report.py', 'generate_places_report_full.py', 
    'generate_ref_report.py', 'generate_type_report.py', 'generate_ref_table_report.py',
    'generate_linked_vivekananda_report.py'
]

for f in files:
    path = os.path.join(folder, f)
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as file:
            content = file.read()
        
        new_content = content.replace(r"r'C:\Saradakosh antigravity\reports'", r"r'C:\Saradakosh antigravity\webapp\reports'")
        
        if new_content != content:
            with open(path, 'w', encoding='utf-8') as file:
                file.write(new_content)
            print(f"Fixed paths in {f}")
