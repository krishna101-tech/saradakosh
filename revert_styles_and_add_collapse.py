import os
import re

reports_dir = r"c:\Saradakosh antigravity\webapp\reports"

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

/* Reverted Level 1 & 2 to original colors/styles but keeping good spacing */
.level1 { color: #cc0000; font-weight: bold; font-style: italic; font-size: 1.15rem; margin-top: 25px; margin-bottom: 8px; cursor: pointer; user-select: none; }
.level2 { color: #006600; font-weight: bold; font-size: 1.05rem; margin-left: 40px; margin-top: 15px; margin-bottom: 8px; cursor: pointer; user-select: none; }

.level1::before, .level2::before { content: '▼ '; font-size: 0.75em; display: inline-block; transition: transform 0.2s; color: #888; margin-right: 5px; }
.level1.collapsed::before, .level2.collapsed::before { transform: rotate(-90deg); }

.level3-container { margin-left: 80px; display: table; width: 100%; max-width: 800px; border-bottom: 1px solid #f8f9fa; transition: background 0.2s; }
.level3-container:hover { background-color: #fafbfc; }
.level3-row { display: table-row; }
.level3-text { display: table-cell; color: #444; padding: 6px 5px; font-size: 0.95rem; }
.level3-seq { display: table-cell; color: #95a5a6; font-size: 0.85rem; text-align: right; padding: 6px 10px; font-variant-numeric: tabular-nums; }
.level3-remark { display: table-cell; color: #7f8c8d; font-size: 0.85rem; text-align: right; padding: 6px 10px; }

/* Styles for List Reports */
.header { background-color: #f7d2b2; padding: 8px 15px; text-align: center; font-weight: bold; color: #333; margin-bottom: 15px; border-radius: 6px; width: 400px; font-size: 1.1rem; }
.item { margin-bottom: 6px; padding: 8px 20px; width: 370px; background: #fff; border: 1px solid #eee; border-radius: 6px; transition: all 0.2s; color: #1f3b61; font-weight: 500; }
.item:hover { background: #fffaf5; border-color: #f2e3d5; transform: translateX(5px); box-shadow: 0 2px 5px rgba(0,0,0,0.02); }

/* Styles for Table Reports */
table { border-collapse: separate; border-spacing: 0; width: 100%; margin-top: 20px; font-size: 0.95rem; border: 1px solid #eee; border-radius: 8px; overflow: hidden; }
th { background-color: #f8f9fa; color: #2c3e50; font-weight: 600; text-align: left; padding: 15px; border-bottom: 1px solid #ddd; }
td { padding: 12px 15px; border-bottom: 1px solid #eee; color: #444; }
tr:last-child td { border-bottom: none; }
tr:hover td { background-color: #fafbfc; }

/* Back link */
.back-link { display: inline-block; margin-bottom: 20px; text-decoration: none; color: #7f8c8d; font-weight: 600; transition: 0.2s; }
.back-link:hover { color: #cc0000; }
</style>"""

collapse_script = """
<script>
// Individual level toggling logic
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('level1')) {
        let el = e.target.nextElementSibling;
        let isCollapsed = e.target.classList.toggle('collapsed');
        while (el && !el.classList.contains('level1')) {
            if (el.classList.contains('level2')) {
                el.style.display = isCollapsed ? 'none' : 'block';
            } else if (el.classList.contains('level3-container')) {
                let prev = el.previousElementSibling;
                let parentL2Collapsed = false;
                while (prev && !prev.classList.contains('level1')) {
                    if (prev.classList.contains('level2')) {
                        parentL2Collapsed = prev.classList.contains('collapsed');
                        break;
                    }
                    prev = prev.previousElementSibling;
                }
                
                if (isCollapsed) {
                    el.style.display = 'none';
                } else {
                    el.style.display = parentL2Collapsed ? 'none' : 'table';
                }
            }
            el = el.nextElementSibling;
        }
    }
    
    if (e.target.classList.contains('level2')) {
        let el = e.target.nextElementSibling;
        let isCollapsed = e.target.classList.toggle('collapsed');
        while (el && !el.classList.contains('level2') && !el.classList.contains('level1')) {
            if (el.classList.contains('level3-container')) {
                el.style.display = isCollapsed ? 'none' : 'table';
            }
            el = el.nextElementSibling;
        }
    }
});

// Update the master toggle to also handle the arrow states
if (typeof setLevel === 'function') {
    const originalSetLevel = setLevel;
    window.setLevel = function(level) {
        originalSetLevel(level);
        
        // Fix up the collapsed classes based on the master level
        document.querySelectorAll('.level1').forEach(function(el) {
            if (level >= 2) el.classList.remove('collapsed');
            else el.classList.add('collapsed');
        });
        
        document.querySelectorAll('.level2').forEach(function(el) {
            if (level >= 3) el.classList.remove('collapsed');
            else el.classList.add('collapsed');
        });
    };
    // Re-trigger the initial state
    window.setLevel(3);
}
</script>
</body>
"""

for file in os.listdir(reports_dir):
    if file.endswith(".html"):
        filepath = os.path.join(reports_dir, file)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Replace styles
        content = re.sub(r'<style>.*?</style>', modern_style, content, flags=re.DOTALL)
        
        # Inject script at end of body if not already there
        if "Individual level toggling logic" not in content:
            content = content.replace("</body>", collapse_script)
        else:
            # Replace existing script if modifying it
            content = re.sub(r'<script>\s*// Individual level toggling logic.*?</script>\s*</body>', collapse_script, content, flags=re.DOTALL)
            
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {file}")
