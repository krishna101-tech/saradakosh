import os

js_file = r"c:\Saradakosh antigravity\webapp\js\viewer.js"
css_file = r"c:\Saradakosh antigravity\webapp\css\style.css"

# Update JS file
with open(js_file, 'r', encoding='utf-8') as f:
    js_content = f.read()

new_js_logic = """    currentEvents.forEach((e, index) => {
        let yrStr = "--";
        if (e.yr) yrStr = `--${e.yr}`;
        
        let typeStr = e.type || "";
        
        let duText = e.du || "";
        if (e.ref) duText += ` (${e.ref})`;
        
        let hasChildren = false;
        let childrenHtml = '';
        
        if (childrenMap[e.id] && childrenMap[e.id].length > 0) {
            hasChildren = true;
            let children = childrenMap[e.id];
            children.forEach(child => {
                let childDu = child.du || "";
                if (childDu) {
                    childDu = childDu.replace(/_x000d_|\\\\n/g, '<br>');
                    childrenHtml += `<div class="child-text">${childDu}</div>`;
                }
            });
        } else if (e.du_bengali) {
            hasChildren = true;
            let childText = e.du_bengali.replace(/_x000d_|\\\\n/g, '<br>');
            childrenHtml += `<div class="child-text">${childText}</div>`;
        }
        
        let arrowHtml = hasChildren ? `<span class="acc-arrow">&#9654;</span>` : `<span class="acc-arrow-empty"></span>`;
        let accClass = hasChildren ? 'accordion' : 'accordion-static';
        let accTag = hasChildren ? 'button' : 'div';
        
        html += `<${accTag} class="${accClass}">
                    <div class="acc-row">
                        ${arrowHtml}
                        <span class="acc-seq">${index + 1}</span>
                        <span class="acc-yr">${yrStr}</span>
                        <span class="acc-type">${typeStr}</span>
                        <span class="acc-du">${duText}</span>
                    </div>
                 </${accTag}>`;
                 
        if (hasChildren) {
            html += `<div class="panel">${childrenHtml}</div>`;
        }
    });"""

# We need to replace the entire forEach loop in js_content
import re
js_content = re.sub(
    r'currentEvents\.forEach\(\(e, index\) => \{.*container\.innerHTML = html;',
    new_js_logic + '\n    \n    container.innerHTML = html;',
    js_content,
    flags=re.DOTALL
)

with open(js_file, 'w', encoding='utf-8') as f:
    f.write(js_content)


# Update CSS file
with open(css_file, 'r', encoding='utf-8') as f:
    css_content = f.read()

if '.accordion-static' not in css_content:
    css_additions = """
.accordion-static { background-color: #fff; padding: 18px; width: 100%; text-align: left; border: 1px solid #eed; outline: none; border-radius: 4px; margin-bottom: 5px; font-size: 1.1rem; box-sizing: border-box; }
.acc-arrow { width: 15px; flex-shrink: 0; color: #aaa; font-size: 0.8rem; transition: transform 0.2s; display: inline-block; }
.accordion.active .acc-arrow { transform: rotate(90deg); color: var(--primary-color); }
.acc-arrow-empty { width: 15px; flex-shrink: 0; display: inline-block; }
"""
    css_content += css_additions
    with open(css_file, 'w', encoding='utf-8') as f:
        f.write(css_content)

print("Updated JS and CSS successfully!")
