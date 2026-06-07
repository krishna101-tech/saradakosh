import os

reports_dir = r"c:\Saradakosh antigravity\webapp\reports"

for file in os.listdir(reports_dir):
    if file.endswith(".html"):
        filepath = os.path.join(reports_dir, file)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        new_content = content.replace(
            ".level3-seq { display: table-cell;", 
            ".level3-seq { display: none;"
        )
        
        if new_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Hid level3-seq in {file}")
