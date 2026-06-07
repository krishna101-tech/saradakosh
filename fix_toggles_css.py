import os
import re

reports_dir = r"c:\Saradakosh antigravity\webapp\reports"

toggle_style = """<style>
.level-toggles { margin-top: 15px; margin-bottom: 25px; display: flex; align-items: center; font-family: 'Inter', "Segoe UI", sans-serif; }
.toggle-btn { border: 2px solid #d35400; padding: 6px 18px; margin-right: 12px; cursor: pointer; border-radius: 6px; background: white; color: #d35400; font-weight: bold; font-size: 14px; transition: 0.2s; text-align: center; }
.toggle-btn:hover { background: #fff1e6; }
.toggle-btn.active { background: #d35400; color: white; }
</style>"""

for file in os.listdir(reports_dir):
    if file.endswith(".html"):
        filepath = os.path.join(reports_dir, file)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Find all style blocks
        style_blocks = re.findall(r'<style>.*?</style>', content, flags=re.DOTALL)
        
        # If there are multiple style blocks, the second one is the toggle buttons style
        # that got accidentally overwritten with the main modern style.
        if len(style_blocks) >= 2:
            # Only replace if the second block is NOT already the toggle style
            if "level-toggles" not in style_blocks[1]:
                content = content.replace(style_blocks[1], toggle_style, 1)
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"Restored toggle CSS in {file}")
