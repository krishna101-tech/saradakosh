import os

reports_dir = r"c:\Saradakosh antigravity\webapp\reports"
for file in os.listdir(reports_dir):
    if file.endswith(".html"):
        filepath = os.path.join(reports_dir, file)
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
        
        if "<meta charset=\"UTF-8\">" not in content and "<meta charset='UTF-8'>" not in content:
            # Insert after <head>
            if "<head>" in content:
                content = content.replace("<head>", "<head>\n<meta charset=\"UTF-8\">", 1)
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"Fixed charset for {file}")
