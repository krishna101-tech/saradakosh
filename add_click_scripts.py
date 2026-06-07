import os

reports_dir = r"c:\Saradakosh antigravity\webapp\reports"

script_to_append = """
<script>
document.addEventListener('click', function(e) {
    // Handle row clicks in tables (ID is usually in the first column)
    if (e.target.tagName === 'TD') {
        const tr = e.target.parentElement;
        const firstTd = tr.querySelector('td');
        if (firstTd) {
            const text = firstTd.innerText.trim();
            if (/^\d+$/.test(text)) {
                window.open('../viewer.html?paramId=' + encodeURIComponent(text), '_blank');
                return;
            }
        }
    }
    
    // Handle div items (like Person_Report, Type_Report)
    if (e.target.classList.contains('item')) {
        const text = e.target.innerText.trim();
        window.open('../viewer.html?paramName=' + encodeURIComponent(text), '_blank');
        return;
    }

    // Handle Vivekananda report specifically AND Mega Period report
    if (e.target.classList.contains('level3-text') || e.target.classList.contains('item-text') || e.target.closest('.item-container')) {
        let targetEl = e.target;
        if (e.target.closest('.item-container')) {
            targetEl = e.target.closest('.item-container').querySelector('.item-text');
        }
        if (!targetEl) return;
        
        let text = targetEl.innerText.trim();
        // Remove leading numbers, e.g., "1 Ancestry" -> "Ancestry"
        // For Mega Period, it also has numbers like "1   Balya Parva"
        text = text.replace(/^\d+\s*/, '');
        window.open('../viewer.html?paramName=' + encodeURIComponent(text), '_blank');
        return;
    }
});
// Change cursor to pointer for clickable elements
document.querySelectorAll('.item, td, .level3-text, .item-container').forEach(el => {
    el.style.cursor = 'pointer';
    el.title = "Click to view events";
});
</script>
</body>
"""

for file in os.listdir(reports_dir):
    if file.endswith(".html") and file != "reports.html":
        filepath = os.path.join(reports_dir, file)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        if "document.addEventListener('click'" not in content:
            content = content.replace("</body>", script_to_append)
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Injected click handler into {file}")
