import os
import re

reports_dir = r"c:\Saradakosh antigravity\webapp\reports"

for file in os.listdir(reports_dir):
    if file.endswith(".html"):
        filepath = os.path.join(reports_dir, file)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # 1. Strip all <style> blocks entirely so the external style.css handles everything
        content = re.sub(r'<style>.*?</style>\s*', '', content, flags=re.DOTALL)
            
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Cleaned and fixed CSS securely in {file}")
