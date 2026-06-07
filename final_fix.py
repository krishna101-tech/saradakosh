import os
import re

reports_dir = r"c:\Saradakosh antigravity\webapp\reports"

# The perfect modern style with colors and collapse pointer
modern_style = """<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap');
body { 
    font-family: 'Inter', "Segoe UI", sans-serif; 
    font-size: 15px; 
    background-color: #f4f5f7; 
    color: #333; 
    margin: 40px auto; 
    max-width: 1000px; 
    padding: 40px 60px; 
    background: white; 
    box-shadow: 0 4px 20px rgba(0,0,0,0.05); 
    border-radius: 12px;
}
h1 { color: #2c3e50; font-weight: 700; font-size: 2.2rem; margin-top: 0; margin-bottom: 30px; border-bottom: 2px solid #f0f0f0; padding-bottom: 15px; }

/* Modern Level 1 & 2 colors WITH collapse pointer */
.level1 { color: #d35400; font-weight: 700; font-size: 1.25rem; margin-top: 35px; margin-bottom: 12px; border-bottom: 1px solid #f2e3d5; padding-bottom: 5px; cursor: pointer; user-select: none; }
.level2 { color: #2980b9; font-weight: 600; font-size: 1.05rem; margin-left: 20px; margin-top: 15px; margin-bottom: 8px; border-left: 3px solid #3498db; padding-left: 12px; cursor: pointer; user-select: none; }

.level1::before, .level2::before { content: '▼ '; font-size: 0.75em; display: inline-block; transition: transform 0.2s; color: #aaa; margin-right: 6px; }
.level1.collapsed::before, .level2.collapsed::before { transform: rotate(-90deg); }

.level3-container { margin-left: 50px; display: table; width: 100%; max-width: 800px; border-bottom: 1px solid #f8f9fa; transition: background 0.2s; }
.level3-container:hover { background-color: #fafbfc; }
.level3-row { display: table-row; }
.level3-text { display: table-cell; color: #444; padding: 10px 5px; font-size: 0.95rem; }
.level3-seq { display: table-cell; color: #95a5a6; font-size: 0.85rem; text-align: right; padding: 10px 10px; font-variant-numeric: tabular-nums; }
.level3-remark { display: table-cell; color: #7f8c8d; font-size: 0.85rem; text-align: right; padding: 10px 10px; }

/* Styles for List Reports */
.header { background-color: #d35400; padding: 12px 15px; text-align: center; font-weight: 700; color: white; margin-bottom: 15px; border-radius: 6px; width: 400px; font-size: 1.1rem; }
.item { margin-bottom: 8px; padding: 10px 20px; width: 370px; background: #fff; border: 1px solid #eee; border-radius: 6px; transition: all 0.2s; color: #2c3e50; font-weight: 500; }
.item:hover { background: #fffaf5; border-color: #f2e3d5; transform: translateX(5px); box-shadow: 0 2px 5px rgba(0,0,0,0.02); }

/* Styles for Table Reports */
table { border-collapse: separate; border-spacing: 0; width: 100%; margin-top: 20px; font-size: 0.95rem; border: 1px solid #eee; border-radius: 8px; overflow: hidden; }
th { background-color: #f8f9fa; color: #2c3e50; font-weight: 600; text-align: left; padding: 15px; border-bottom: 1px solid #ddd; }
td { padding: 12px 15px; border-bottom: 1px solid #eee; color: #444; }
tr:last-child td { border-bottom: none; }
tr:hover td { background-color: #fafbfc; }

/* Back link */
.back-link { display: inline-block; margin-bottom: 20px; text-decoration: none; color: #7f8c8d; font-weight: 600; transition: 0.2s; }
.back-link:hover { color: #d35400; }
</style>"""

toggle_style = """<style>
.level-toggles { margin-top: 15px; margin-bottom: 25px; display: flex; align-items: center; font-family: 'Inter', "Segoe UI", sans-serif; }
.toggle-btn { border: 2px solid #d35400; padding: 6px 18px; margin-right: 12px; cursor: pointer; border-radius: 6px; background: white; color: #d35400; font-weight: bold; font-size: 14px; transition: 0.2s; text-align: center; }
.toggle-btn:hover { background: #fff1e6; }
.toggle-btn.active { background: #d35400; color: white; }
</style>
<div class="level-toggles">"""

for file in os.listdir(reports_dir):
    if file.endswith(".html"):
        filepath = os.path.join(reports_dir, file)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # 1. Strip all <style> blocks entirely
        content = re.sub(r'<style>.*?</style>\s*', '', content, flags=re.DOTALL)
        
        # 2. Insert modern_style right before </head>
        content = content.replace("</head>", modern_style + "\n</head>", 1)
        
        # 3. Insert toggle_style right before <div class="level-toggles">
        content = content.replace('<div class="level-toggles">', toggle_style, 1)
            
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Cleaned and fixed CSS securely in {file}")
