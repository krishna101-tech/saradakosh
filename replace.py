import os

reports_dir = r"c:\Saradakosh antigravity\webapp\reports"

for file in os.listdir(reports_dir):
    if file.endswith(".html"):
        filepath = os.path.join(reports_dir, file)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        if "index.html?paramId=" in content or "index.html?paramName=" in content:
            content = content.replace("index.html?paramId=", "viewer.html?paramId=")
            content = content.replace("index.html?paramName=", "viewer.html?paramName=")
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Updated links in {file}")
