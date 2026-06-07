import os

reports_dir = r"c:\Saradakosh antigravity\webapp\reports"

toggle_html = """

<div class="level-toggles">
    <span style="font-weight:bold; margin-right: 15px; color: #333; font-size: 15px;">Levels:</span>
    <div class="toggle-btn" onclick="setLevel(1)">1</div>
    <div class="toggle-btn" onclick="setLevel(2)">2</div>
    <div class="toggle-btn active" onclick="setLevel(3)">3</div>
</div>
<script>
function setLevel(level) {
    var btns = document.querySelectorAll('.toggle-btn');
    if(btns.length >= 3) {
        btns[0].classList.toggle('active', level === 1);
        btns[1].classList.toggle('active', level === 2);
        btns[2].classList.toggle('active', level === 3);
    }
    
    document.querySelectorAll('.level2').forEach(function(el) {
        el.style.display = level >= 2 ? 'block' : 'none';
    });
    
    document.querySelectorAll('.level3-container').forEach(function(el) {
        el.style.display = level >= 3 ? 'table' : 'none';
    });
}
// Default state is already 3.
</script>
"""

for file in os.listdir(reports_dir):
    if file.endswith(".html"):
        filepath = os.path.join(reports_dir, file)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        if 'class="level1"' in content and "level-toggles" not in content:
            # Inject after </h1> if exists, else after <body>
            if "</h1>" in content:
                content = content.replace("</h1>", "</h1>\n" + toggle_html, 1)
            else:
                content = content.replace("<body>", "<body>\n" + toggle_html, 1)
                
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Added toggles to {file}")
