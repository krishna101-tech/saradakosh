import os

base_dir = r"c:\Saradakosh antigravity\webapp"
reports_dir = os.path.join(base_dir, "reports")

back_to_top_snippet = """
<style>
.back-to-top {
    position: fixed;
    bottom: 30px;
    right: 30px;
    background-color: #d35400;
    color: white;
    width: 45px;
    height: 45px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    font-weight: bold;
    text-decoration: none;
    box-shadow: 0 4px 15px rgba(211, 84, 0, 0.4);
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
    z-index: 1000;
    cursor: pointer;
    border: none;
    outline: none;
    font-family: sans-serif;
}
.back-to-top.visible {
    opacity: 1;
    visibility: visible;
}
.back-to-top:hover {
    background-color: #b94a00;
    transform: translateY(-5px);
    box-shadow: 0 6px 20px rgba(211, 84, 0, 0.5);
}
</style>
<button class="back-to-top" id="backToTopBtn" title="Go to top">&#8593;</button>
<script>
document.addEventListener("DOMContentLoaded", function() {
    var btn = document.getElementById("backToTopBtn");
    if(!btn) return;
    
    window.addEventListener("scroll", function() {
        if (window.scrollY > 300) {
            btn.classList.add("visible");
        } else {
            btn.classList.remove("visible");
        }
    });
    
    btn.addEventListener("click", function() {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
});
</script>
</body>
"""

files_to_update = []

# Collect all files
for file in os.listdir(reports_dir):
    if file.endswith(".html"):
        files_to_update.append(os.path.join(reports_dir, file))

files_to_update.append(os.path.join(base_dir, "viewer.html"))
files_to_update.append(os.path.join(base_dir, "reports.html"))

for filepath in files_to_update:
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        if 'id="backToTopBtn"' not in content:
            content = content.replace("</body>", back_to_top_snippet)
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Added Back To Top to {os.path.basename(filepath)}")
